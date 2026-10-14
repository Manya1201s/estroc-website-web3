import { useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import { CircleCheck, CircleX, Pause, Play, RotateCcw, ScanLine, SkipForward } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { focusRing } from "@/components/estroc/web3/shared";
import {
  LOOP,
  OFFSET,
  SCAN_AT,
  SLOTS,
  START_D,
  ZONE,
  initialInspectState,
  inspectReducer,
  loopPos,
  serialLabel,
  simulatedInspector,
  tally,
} from "@/lib/visionInspect";
import type { DefectKind, InspectionEvent, Inspector, Product, ProductKind } from "@/lib/visionInspect";

/**
 * VisionInspect: a conveyor of parts passing a machine-vision camera. One
 * requestAnimationFrame loop moves the belt by writing transforms straight to
 * the SVG; React only re-renders on inspection events (a part entering the
 * camera's view, being judged, or leaving the belt). Results come from the
 * `inspector` prop — a simulated sample sequence by default.
 */

const SPEED = 115; // belt units per second
const STEP_SPEED = 620; // fast-forward for "Inspect Next Product"
const REDUCED_INTERVAL = 1800; // with reduced motion, the belt steps product by product
const BELT_Y = 300;
const RECENT = 5; // rows in the recent-results list

type Filter = "all" | "pass" | "defect";

const GREEN = "#34d399";
const RED = "#f87171";
const CYAN = "#67e8f9";

/* ─────────────── part drawings (bottom-centre at 0,0) ─────────────── */

function gearPath(cx: number, cy: number, outer: number, inner: number, teeth: number) {
  const pts: string[] = [];
  for (let t = 0; t < teeth * 2; t++) {
    const r = t % 2 ? inner : outer;
    const a0 = (t / (teeth * 2)) * Math.PI * 2 - 0.12;
    const a1 = ((t + 1) / (teeth * 2)) * Math.PI * 2 - 0.12;
    pts.push(`${(cx + Math.cos(a0) * r).toFixed(1)},${(cy + Math.sin(a0) * r).toFixed(1)}`);
    pts.push(`${(cx + Math.cos(a1 - 0.05) * r).toFixed(1)},${(cy + Math.sin(a1 - 0.05) * r).toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}
const GEAR = gearPath(0, -36, 35, 28, 10);

function Part({ kind }: { kind: ProductKind }) {
  if (kind === "Gear") {
    return (
      <g>
        <path d={GEAR} fill="url(#vi-metal)" stroke="#a1a1aa" strokeOpacity="0.55" />
        <circle cx="0" cy="-36" r="15" fill="none" stroke="#52525b" strokeWidth="3" />
        <circle cx="0" cy="-36" r="7" fill="#0b0b0d" stroke="#71717a" />
      </g>
    );
  }
  if (kind === "Bracket") {
    return (
      <g>
        <path d="M-40 0 L-40 -64 L-18 -64 L-18 -20 L40 -20 L40 0 Z" fill="url(#vi-metal)" stroke="#a1a1aa" strokeOpacity="0.55" />
        <circle cx="-29" cy="-48" r="4.5" fill="#0b0b0d" stroke="#71717a" />
        <circle cx="16" cy="-10" r="4.5" fill="#0b0b0d" stroke="#71717a" />
        <path d="M-40 -64 L-18 -64" stroke="#e4e4e7" strokeOpacity="0.35" />
      </g>
    );
  }
  return (
    <g>
      <rect x="-42" y="-58" width="84" height="58" rx="8" fill="url(#vi-metal)" stroke="#a1a1aa" strokeOpacity="0.55" />
      <rect x="-30" y="-46" width="60" height="30" rx="4" fill="#18181b" stroke="#52525b" />
      {[-32, 32].map((x) => (
        <circle key={x} cx={x} cy="-7" r="3.5" fill="#0b0b0d" stroke="#71717a" />
      ))}
      <path d="M-38 -56 L38 -56" stroke="#e4e4e7" strokeOpacity="0.35" />
    </g>
  );
}

/** Where each defect shows on the part once it has been judged. */
function DefectMark({ defect }: { defect: DefectKind }) {
  if (defect === "Surface Scratch") {
    return (
      <g stroke={RED} strokeWidth="2" strokeLinecap="round" data-defect="scratch">
        <path d="M-16 -46 L4 -30" />
        <path d="M-10 -50 L10 -34" strokeOpacity="0.7" />
        <circle cx="-3" cy="-40" r="17" fill="none" strokeWidth="1.2" strokeDasharray="3 3" />
      </g>
    );
  }
  if (defect === "Crack Detected") {
    return (
      <g data-defect="crack">
        <path d="M14 -60 L6 -46 L13 -38 L3 -24 L8 -14" fill="none" stroke={RED} strokeWidth="2.2" strokeLinejoin="round" />
        <circle cx="9" cy="-38" r="19" fill="none" stroke={RED} strokeWidth="1.2" strokeDasharray="3 3" />
      </g>
    );
  }
  return (
    <g data-defect="alignment">
      <rect x="-42" y="-64" width="84" height="64" rx="6" fill="none" stroke={RED} strokeWidth="1.5" strokeDasharray="5 4" transform="rotate(7 0 -32) translate(8 -2)" />
      <path d="M48 -66 l10 -6 M48 -66 l11 2" stroke={RED} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function verdictText(event: Pick<InspectionEvent, "verdict">) {
  return event.verdict.status === "pass" ? "Passed" : event.verdict.defect;
}

/** Phones get a closer view of the camera and the parts beneath it. */
function useNarrow() {
  const query = "(max-width: 639px)";
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setNarrow(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return narrow;
}

/* ─────────────────────────────── component ─────────────────────────────── */

export default function VisionInspectLive({ inspector = simulatedInspector }: { inspector?: Inspector }) {
  const reducedMotion = !!useReducedMotion();
  const [state, dispatch] = useReducer(inspectReducer, undefined, initialInspectState);
  const [filter, setFilter] = useState<Filter>("all");
  const [announce, setAnnounce] = useState("");
  const narrow = useNarrow();

  const sceneRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(SVGGElement | null)[]>([]);
  const beltRef = useRef<SVGPathElement>(null);
  const rollerRefs = useRef<(SVGGElement | null)[]>([]);
  const dRef = useRef(START_D);
  const runRef = useRef(state.run);
  const stepRef = useRef(false);
  const announceRef = useRef(false);
  const inspectorRef = useRef(inspector);
  const wakeRef = useRef<() => void>(() => {});
  const reducedRef = useRef(reducedMotion);

  runRef.current = state.run;
  inspectorRef.current = inspector;
  reducedRef.current = reducedMotion;

  /** Draw the belt for the current travel: part positions, belt texture, rollers. */
  const place = useCallback(() => {
    const d = dRef.current;
    for (let i = 0; i < SLOTS; i++) {
      const g = slotRefs.current[i];
      if (g) g.setAttribute("transform", `translate(${(loopPos(i, d) - OFFSET).toFixed(1)} ${BELT_Y})`);
    }
    beltRef.current?.setAttribute("stroke-dashoffset", (-d % 24).toFixed(1));
    for (const r of rollerRefs.current) r?.setAttribute("transform", `rotate(${((d * 3) % 360).toFixed(1)})`);
  }, []);

  // Parts get their belt positions before first paint.
  useLayoutEffect(() => place(), [place]);

  /** Move the belt forward, raising an event for every boundary a part crosses. */
  const advance = useCallback((delta: number) => {
    const d = dRef.current;
    for (let i = 0; i < SLOTS; i++) {
      const from = loopPos(i, d);
      const to = loopPos(i, d + delta);
      if (to < from) {
        dispatch({ type: "recycle", slot: i }); // left the belt; a fresh part is loaded upstream
        continue;
      }
      if (from < SCAN_AT - ZONE && to >= SCAN_AT - ZONE) dispatch({ type: "enter", slot: i });
      if (from < SCAN_AT && to >= SCAN_AT) {
        dispatch({ type: "inspect", slot: i, inspector: inspectorRef.current });
        stepRef.current = false;
      }
    }
    dRef.current = d + delta;
  }, []);

  /** Distance until the next part reaches the camera. */
  const toNext = () => {
    let best = LOOP;
    for (let i = 0; i < SLOTS; i++) {
      const gap = (SCAN_AT - loopPos(i, dRef.current) + LOOP) % LOOP;
      if (gap > 0.01 && gap < best) best = gap;
    }
    return best + 0.5;
  };

  // One animation loop, alive only while the belt is moving and on screen.
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let inView = false;
    let interval = 0;

    const moving = () => runRef.current === "running" || stepRef.current;
    const live = () => inView && !document.hidden;

    const frame = (now: number) => {
      raf = 0;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      if (moving()) advance((stepRef.current ? STEP_SPEED : SPEED) * dt);
      place();
      if (moving() && live()) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      // Reduced motion: no gliding belt — it steps one part at a time.
      if (reducedRef.current) {
        cancelAnimationFrame(raf);
        raf = 0;
        if (stepRef.current) {
          advance(toNext());
          stepRef.current = false;
          place();
        }
        const shouldTick = runRef.current === "running" && live();
        if (shouldTick && !interval) {
          interval = window.setInterval(() => {
            advance(toNext());
            place();
          }, REDUCED_INTERVAL);
        } else if (!shouldTick && interval) {
          clearInterval(interval);
          interval = 0;
        }
        return;
      }
      if (interval) {
        clearInterval(interval);
        interval = 0;
      }
      if (moving() && live()) {
        if (!raf) {
          last = 0;
          raf = requestAnimationFrame(frame);
        }
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
        place();
      }
    };
    wakeRef.current = wake;

    place();
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      wake();
    });
    if (sceneRef.current) io.observe(sceneRef.current);
    document.addEventListener("visibilitychange", wake);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
      wakeRef.current = () => {};
    };
  }, [advance, place]);

  // Start, pause, resume and motion-preference changes all re-evaluate the loop.
  useEffect(() => {
    wakeRef.current();
  }, [state.run, reducedMotion]);

  // A part judged after "Inspect Next Product" is announced to screen readers.
  const last = state.events[state.events.length - 1];
  useEffect(() => {
    if (!announceRef.current || !last) return;
    announceRef.current = false;
    setAnnounce(`${serialLabel(last.serial)} ${last.kind}: ${verdictText(last)}`);
  }, [state.events.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const inspectNext = () => {
    stepRef.current = true;
    announceRef.current = true;
    wakeRef.current();
  };

  const reset = () => {
    stepRef.current = false;
    announceRef.current = false;
    dRef.current = START_D;
    dispatch({ type: "reset" });
    setAnnounce("");
    place();
  };

  const counts = useMemo(() => tally(state.events), [state.events]);
  const recent = useMemo(
    () =>
      state.events
        .filter((e) => filter === "all" || e.verdict.status === filter)
        .slice(-RECENT)
        .reverse(),
    [state.events, filter],
  );
  const scanningProduct = state.scanning !== null ? state.slots[state.scanning] : null;
  const shown = (p: Product | null) => !p?.verdict || filter === "all" || p.verdict.status === filter;

  const current = scanningProduct
    ? { tone: "scan" as const, title: `Scanning ${serialLabel(scanningProduct.serial)}`, detail: scanningProduct.kind }
    : last
      ? { tone: last.verdict.status, title: `${serialLabel(last.serial)} · ${verdictText(last)}`, detail: last.kind }
      : { tone: "idle" as const, title: state.run === "idle" ? "Ready to inspect" : "Waiting for the next part", detail: "Start the line or inspect the next part" };

  const lastTone = last ? (last.verdict.status === "pass" ? GREEN : RED) : "#71717a";
  const filters: [Filter, string, number][] = [
    ["all", "All", counts.total],
    ["pass", "Passed", counts.passed],
    ["defect", "Defective", counts.defective],
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(19rem,1fr)]" data-testid="vision-inspect-live">
      {/* ───────────── factory scene ───────────── */}
      <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0f]">
        <div ref={sceneRef} className="vi-scene relative flex flex-1 items-center bg-[#09090b]" data-active={state.run === "running" || undefined} data-testid="vision-inspect-scene">
          <svg viewBox={narrow ? "215 70 570 320" : "0 60 1000 340"} className="block h-auto w-full" role="img" aria-label="Simulated production line: parts travel along a conveyor under an inspection camera, which outlines passing parts in green and defective parts in red.">
            <defs>
              <linearGradient id="vi-metal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#5b5b64" />
                <stop offset="0.55" stopColor="#3a3a41" />
                <stop offset="1" stopColor="#24242a" />
              </linearGradient>
              <linearGradient id="vi-cone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={CYAN} stopOpacity="0.22" />
                <stop offset="1" stopColor={CYAN} stopOpacity="0.03" />
              </linearGradient>
              <radialGradient id="vi-floor" cx="0.5" cy="0" r="0.7">
                <stop offset="0" stopColor="#ff5500" stopOpacity="0.16" />
                <stop offset="1" stopColor="#ff5500" stopOpacity="0" />
              </radialGradient>
              <pattern id="vi-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0 L0 0 L0 20" fill="none" stroke={CYAN} strokeOpacity="0.14" strokeWidth="0.8" />
              </pattern>
              <clipPath id="vi-cone-clip">
                <path d="M478 128 L522 128 L612 300 L388 300 Z" />
              </clipPath>
            </defs>

            {/* backdrop: faint factory grid and a warm pool of light under the line */}
            <rect x="0" y="60" width="1000" height="340" fill="#09090b" />
            <g stroke="#ffffff" strokeOpacity="0.035">
              {Array.from({ length: 21 }, (_, i) => (
                <path key={i} d={`M${i * 50} 60 V400`} />
              ))}
            </g>
            <ellipse cx="500" cy="352" rx="520" ry="90" fill="url(#vi-floor)" />

            {/* camera gantry and inspection cone */}
            <path d="M430 60 V104 M570 60 V104" stroke="#3f3f46" strokeWidth="6" />
            <path d="M478 128 L522 128 L612 300 L388 300 Z" fill="url(#vi-cone)" />
            <g clipPath="url(#vi-cone-clip)">
              <rect x="380" y="128" width="240" height="172" fill="url(#vi-grid)" />
              <rect className="vi-beam" x="380" y="128" width="240" height="3" fill={CYAN} opacity="0.85" />
            </g>
            <rect x="440" y="88" width="120" height="34" rx="6" fill="#18181b" stroke="#3f3f46" />
            <rect x="452" y="96" width="44" height="4" rx="2" fill="#ff5500" opacity="0.8" />
            <text x="452" y="114" fill="#71717a" fontSize="8" fontFamily="ui-monospace, monospace" letterSpacing="1">CAM-01</text>
            <circle cx="500" cy="128" r="11" fill="#0b0b0d" stroke="#52525b" strokeWidth="2" />
            <circle cx="500" cy="128" r="5" fill={CYAN} opacity="0.75" />
            {/* status light: flashes the colour of each new verdict */}
            <circle key={state.events.length} className="vi-led" cx="544" cy="104" r="5" fill={lastTone} data-testid="vision-inspect-led" />

            {/* conveyor */}
            <rect x="24" y="300" width="952" height="30" rx="15" fill="#151518" stroke="#2a2a30" />
            <path ref={beltRef} d="M40 304 H960" stroke="#3f3f46" strokeWidth="3" strokeDasharray="10 14" />
            <path d="M40 326 H960" stroke="#0b0b0d" strokeWidth="2" />
            {[39, 961].map((cx, n) => (
              <g key={cx} transform={`translate(${cx} 315)`}>
                <circle r="14" fill="#1f1f23" stroke="#3f3f46" />
                <g ref={(el) => { rollerRefs.current[n] = el; }}>
                  <path d="M-9 0 H9 M0 -9 V9" stroke="#52525b" strokeWidth="2" />
                </g>
              </g>
            ))}
            <path d="M120 330 V392 M880 330 V392 M500 330 V392" stroke="#232328" strokeWidth="8" />

            {/* parts on the belt */}
            {state.slots.map((product, i) => {
              const scanning = state.scanning === i;
              const verdict = product?.verdict;
              const tone = verdict ? (verdict.status === "pass" ? GREEN : RED) : CYAN;
              const label = verdict ? (verdict.status === "pass" ? `PASS · ${serialLabel(product!.serial)}` : verdict.defect.toUpperCase()) : `SCANNING ${product ? serialLabel(product.serial) : ""}`;
              return (
                <g
                  key={i}
                  ref={(el) => { slotRefs.current[i] = el; }}
                  className="vi-part"
                  style={{ opacity: shown(product) ? 1 : 0.18 }}
                  data-testid={`vision-inspect-part-${i}`}
                  data-serial={product?.serial ?? ""}
                  data-status={verdict?.status ?? (scanning ? "scanning" : product ? "queued" : "empty")}
                >
                  {product && (
                    <>
                      <ellipse cx="0" cy="2" rx="46" ry="5" fill="#000" opacity="0.45" />
                      <Part kind={product.kind} />
                      {verdict?.status === "defect" && <DefectMark defect={verdict.defect} />}
                      {(verdict || scanning) && (
                        <g className="vi-mark">
                          <rect x="-56" y="-82" width="112" height="88" rx="6" fill="none" stroke={tone} strokeWidth="2" strokeDasharray={verdict ? undefined : "6 5"} />
                          {[[-56, -82], [56, -82], [-56, 6], [56, 6]].map(([cx, cy]) => (
                            <path key={`${cx}${cy}`} d={`M${cx} ${cy + (cy < 0 ? 12 : -12)} V${cy} H${cx + (cx < 0 ? 12 : -12)}`} fill="none" stroke={tone} strokeWidth="3.5" />
                          ))}
                          <g transform="translate(-56 -104)">
                            <rect width={Math.max(84, label.length * 7.4 + 16)} height="18" rx="3" fill={tone} opacity={verdict ? 1 : 0.85} />
                            <text x="8" y="12.5" fill="#0a0a0b" fontSize="10" fontWeight="700" fontFamily="ui-monospace, monospace" letterSpacing="0.6">
                              {label}
                            </text>
                          </g>
                        </g>
                      )}
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          <span className="pointer-events-none absolute bottom-2 left-3 inline-flex sm:bottom-auto sm:top-3 items-center gap-2 rounded-[3px] border border-[rgba(255,85,0,0.45)] bg-[rgba(10,10,11,0.75)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#ff8a4c] sm:text-[10px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ff5500]" aria-hidden="true" />
            Interactive demo · simulated inspection
          </span>
        </div>

        {/* controls */}
        <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-3 sm:p-4" role="group" aria-label="Inspection controls">
          {state.run === "idle" ? (
            <button type="button" onClick={() => dispatch({ type: "start" })} className={`vi-btn vi-btn-primary ${focusRing}`} data-testid="vision-inspect-start">
              <Play className="h-4 w-4" aria-hidden="true" /> Start Inspection
            </button>
          ) : (
            <button
              type="button"
              onClick={() => dispatch({ type: state.run === "running" ? "pause" : "resume" })}
              aria-pressed={state.run === "paused"}
              className={`vi-btn vi-btn-primary ${focusRing}`}
              data-testid="vision-inspect-pause"
            >
              {state.run === "running" ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
              {state.run === "running" ? "Pause" : "Resume"}
            </button>
          )}
          <button type="button" onClick={inspectNext} className={`vi-btn ${focusRing}`} data-testid="vision-inspect-next">
            <SkipForward className="h-4 w-4" aria-hidden="true" /> Inspect Next Product
          </button>
          <button type="button" onClick={reset} className={`vi-btn ${focusRing}`} data-testid="vision-inspect-reset">
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Reset Demo
          </button>
          <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600 sm:inline" data-testid="vision-inspect-run">
            Line · {state.run === "running" ? "running" : state.run === "paused" ? "paused" : "stopped"}
          </span>
        </div>
      </div>

      {/* ───────────── results ───────────── */}
      <div className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-[#0d0d0f] p-4 sm:p-5" data-testid="vision-inspect-results">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Inspection results · simulated</p>
        <dl className="mt-3 grid grid-cols-3 gap-2">
          {(
            [
              ["Inspected", counts.total, "text-zinc-100", "total"],
              ["Passed", counts.passed, "text-[#34d399]", "passed"],
              ["Defective", counts.defective, "text-[#f87171]", "defective"],
            ] as const
          ).map(([label, value, tone, id]) => (
            <div key={label} className="rounded-lg border border-white/10 px-3 py-2.5">
              <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">{label}</dt>
              <dd className={`mt-1 text-2xl font-semibold tabular-nums tracking-tight ${tone}`} data-testid={`vision-inspect-count-${id}`}>
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="vi-current mt-3 flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5" data-tone={current.tone} data-testid="vision-inspect-current">
          <span className="vi-current-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full" aria-hidden="true">
            {current.tone === "pass" ? <CircleCheck className="h-4 w-4" /> : current.tone === "defect" ? <CircleX className="h-4 w-4" /> : <ScanLine className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Current product</p>
            <p className="truncate text-sm font-medium text-zinc-100" data-testid="vision-inspect-current-title">{current.title}</p>
            <p className="truncate text-xs text-zinc-500">{current.detail}</p>
          </div>
        </div>

        <div className="mt-4 flex gap-1 rounded-lg border border-white/10 p-1" role="group" aria-label="Filter results">
          {filters.map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`vi-filter flex-1 rounded-md px-2 py-1.5 text-xs font-medium ${focusRing}`}
              data-testid={`vision-inspect-filter-${id}`}
            >
              {label} <span className="tabular-nums opacity-70">{count}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-500">Recent inspections</p>
        <ol className="mt-2 flex-1 space-y-1.5" data-testid="vision-inspect-recent">
          {recent.length === 0 && (
            <li className="rounded-md border border-dashed border-white/10 px-3 py-3 text-xs text-zinc-500">
              {counts.total === 0 ? "No parts inspected yet." : "No results match this filter yet."}
            </li>
          )}
          {recent.map((event) => (
            <li key={event.serial} className="vi-row flex items-center justify-between gap-3 rounded-md border border-white/10 px-3 py-2 text-xs" data-status={event.verdict.status}>
              <span className="font-mono text-zinc-400">
                {serialLabel(event.serial)} <span className="text-zinc-600">· {event.kind}</span>
              </span>
              <span className={`font-medium ${event.verdict.status === "pass" ? "text-[#34d399]" : "text-[#f87171]"}`}>{verdictText(event)}</span>
            </li>
          ))}
        </ol>
        <p className="sr-only" aria-live="polite" data-testid="vision-inspect-announce">
          {announce}
        </p>
      </div>
    </div>
  );
}
