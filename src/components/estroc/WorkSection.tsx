import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import SectionHeading from "./SectionHeading";
import { projects, testId as slug } from "@/lib/projects";

/**
 * The portfolio as a continuous orbit. Every project sits on one elliptical
 * track, evenly spaced, and the whole ring turns slowly: a card swings in from
 * the back, grows as it reaches the front, then recedes again — round and
 * round with no reset, because the orbit angle simply keeps increasing.
 *
 * One requestAnimationFrame loop owns the angle and writes each card's
 * transform straight to the DOM; React only re-renders when the card nearest
 * the front changes, to update the caption beneath.
 */

const n = projects.length;
const SLOT = (Math.PI * 2) / n;
const SECONDS_PER_TURN = 42; // a calm, full revolution
const SPEED = (Math.PI * 2) / SECONDS_PER_TURN; // radians per second
const RATIO = 1.15; // screenshots are captured at 1.15 : 1
const BAR = 34; // browser-bar height on each card

type Layout = "mobile" | "tablet" | "desktop";

interface Orbit {
  card: number; // front-card width in px
  radius: number; // horizontal radius of the ellipse
  rise: number; // how far the back of the ring sits above the front
  tilt: number; // max rotateY at the sides, in degrees
  minScale: number; // scale at the very back
}

function orbitFor(width: number, layout: Layout): Orbit {
  if (layout === "mobile") {
    const card = Math.min(width * 0.7, 290);
    return { card, radius: width * 0.36, rise: card * 0.52, tilt: 28, minScale: 0.5 };
  }
  if (layout === "tablet") {
    const card = width * 0.42;
    return { card, radius: width / 2 - card * 0.42, rise: card * 0.58, tilt: 32, minScale: 0.5 };
  }
  const card = Math.min(width * 0.34, 430);
  return { card, radius: width / 2 - card * 0.44, rise: card * 0.64, tilt: 34, minScale: 0.5 };
}

/** Index of the card nearest the front for a given orbit angle. */
const frontOf = (phase: number) => (((Math.round(-phase / SLOT) % n) + n) % n);
const host = (url: string) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");
const focusRing = "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5500]";

export default function WorkSection() {
  const reducedMotion = useReducedMotion();
  const [front, setFront] = useState(0);
  const [paused, setPaused] = useState(false);
  const [layout, setLayout] = useState<Layout>("desktop");
  const [stageHeight, setStageHeight] = useState(560);

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Animation state lives in refs: the loop reads and writes it every frame without re-rendering.
  const phase = useRef(0);
  const speed = useRef(0); // current angular speed, eased toward the target speed
  const target = useRef<number | null>(null); // phase to glide to after prev / next / card click
  const orbit = useRef<Orbit>(orbitFor(1200, "desktop"));
  const hovering = useRef(false);
  const focused = useRef(false);
  const inView = useRef(false);
  const pausedRef = useRef(false);
  const drag = useRef<{ x: number; phase: number } | null>(null);
  const dragMoved = useRef(false);
  const frontRef = useRef(0);

  pausedRef.current = paused;

  /** Place every card for the current phase — the single source of each card's position. */
  const place = useCallback(() => {
    const { card, radius, rise, tilt, minScale } = orbit.current;
    for (let i = 0; i < n; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const angle = phase.current + i * SLOT;
      const sin = Math.sin(angle);
      const depth = (Math.cos(angle) + 1) / 2; // 1 at the front, 0 at the back
      const x = sin * radius;
      const y = -(1 - depth) * rise;
      const scale = minScale + (1 - minScale) * depth;
      const rotate = -sin * tilt * (1 - depth * 0.35);
      el.style.width = `${card}px`;
      el.style.marginLeft = `${-card / 2}px`;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotateY(${rotate.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      el.style.zIndex = String(Math.round(depth * 100));
      el.style.opacity = (0.55 + 0.45 * depth).toFixed(3);
      el.dataset.depth = depth.toFixed(3);
      const shade = shadeRefs.current[i];
      if (shade) shade.style.opacity = ((1 - depth) * 0.55).toFixed(3);
    }
    const nearest = frontOf(phase.current);
    if (nearest !== frontRef.current) {
      frontRef.current = nearest;
      setFront(nearest);
    }
  }, []);

  // Measure the stage and size the orbit to it.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const width = stage.clientWidth;
      const next: Layout = window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";
      orbit.current = orbitFor(width, next);
      setLayout(next);
      // Tallest point of the ring: the front card, or a card at the very back — lifted by the
      // full rise but shrunk to minScale. Plus the 40px floor under the cards and some headroom.
      const { card, rise, minScale } = orbit.current;
      const cardHeight = card / RATIO + BAR;
      setStageHeight(Math.round(40 + Math.max(cardHeight, rise + minScale * cardHeight) + 24));
      place();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [place]);

  // Only animate while the section is on screen.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(([entry]) => { inView.current = entry.isIntersecting; }, { threshold: 0.15 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  // The loop.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamped, so a background tab never lurches on return
      last = now;

      if (target.current !== null) {
        // Glide to a chosen card, then hand back to the steady orbit.
        const diff = target.current - phase.current;
        phase.current += reducedMotion ? diff : diff * (1 - Math.exp(-dt * 7));
        if (Math.abs(diff) < 0.0008) { phase.current = target.current; target.current = null; }
        speed.current = 0;
      } else if (!drag.current) {
        const run = !reducedMotion && inView.current && !pausedRef.current && !hovering.current && !focused.current;
        // Ease the speed rather than switching it, so hover-pauses and resumes are soft.
        speed.current += ((run ? -SPEED : 0) - speed.current) * (1 - Math.exp(-dt * 3));
        phase.current += speed.current * dt;
      }
      place();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [place, reducedMotion]);

  /** Glide so that `index` faces front, travelling the short way round. */
  const bringToFront = (index: number) => {
    const base = target.current ?? phase.current;
    const desired = -index * SLOT;
    const turns = Math.round((base - desired) / (Math.PI * 2));
    target.current = desired + turns * Math.PI * 2;
  };
  /** Move one card along from whichever card is at (or heading to) the front. */
  const step = (delta: number) => {
    const base = target.current ?? phase.current;
    target.current = Math.round(base / SLOT) * SLOT - delta * SLOT;
  };

  /* Drag rotates the ring: a full stage width of drag is half a turn. */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragMoved.current = false;
    if (event.button !== 0) return;
    target.current = null;
    drag.current = { x: event.clientX, phase: phase.current };
  };
  useEffect(() => {
    const move = (event: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const dx = event.clientX - d.x;
      if (Math.abs(dx) > 5) dragMoved.current = true;
      const width = stageRef.current?.clientWidth ?? 1000;
      phase.current = d.phase + (dx / width) * Math.PI;
    };
    const up = () => {
      if (!drag.current) return;
      drag.current = null;
      // Settle on whichever card the drag left nearest the front, then the orbit carries on.
      if (dragMoved.current) target.current = Math.round(phase.current / SLOT) * SLOT;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);

  return (
    <section id="work" className="border-t border-white/[0.08]" data-testid="our-work-section">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <SectionHeading title="OUR WORK" copy="Real products. Real experiences. Built by ESTROC." />

        <div
          // Keyboard focus pauses the orbit so its controls hold still; a mouse click on them does not.
          onFocusCapture={(event) => { focused.current = (event.target as HTMLElement).matches(":focus-visible"); }}
          onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) focused.current = false; }}
        >
          {/* ── The orbit ── */}
          <div
            ref={stageRef}
            className="relative mt-12 cursor-grab select-none overflow-hidden touch-pan-y active:cursor-grabbing"
            style={{ height: stageHeight, perspective: layout === "mobile" ? 900 : 1600 }}
            role="region"
            aria-roledescription="carousel"
            aria-label="ESTROC projects, rotating"
            onPointerDown={onPointerDown}
            onPointerEnter={(event) => { if (event.pointerType === "mouse") hovering.current = true; }}
            onPointerLeave={(event) => { if (event.pointerType === "mouse") hovering.current = false; }}
            onClickCapture={(event) => {
              // The end of a drag is not a click on whatever card is underneath.
              if (dragMoved.current) { event.preventDefault(); event.stopPropagation(); dragMoved.current = false; }
            }}
            data-testid="work-stage"
          >
            {/* The track, faintly drawn, so the eye reads a ring rather than loose cards. */}
            <svg className="pointer-events-none absolute inset-x-0 bottom-4 mx-auto h-20 w-full text-zinc-800" viewBox="0 0 100 20" preserveAspectRatio="none" aria-hidden="true">
              <ellipse cx="50" cy="10" rx="46" ry="8" fill="none" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeDasharray="3 5" />
            </svg>
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-1/2 w-1/2 -translate-x-1/2 bg-[#ff5500]/[0.05] blur-3xl" aria-hidden="true" />

            {projects.map((item, index) => {
              const isFront = index === front;
              return (
                <button
                  key={item.slug}
                  ref={(el) => { cardRefs.current[index] = el; }}
                  type="button"
                  tabIndex={-1}
                  aria-hidden="true"
                  onClick={() => bringToFront(index)}
                  className={`absolute bottom-10 left-1/2 overflow-hidden rounded-lg border text-left will-change-transform ${
                    isFront ? "border-[#ff5500]/50 shadow-[0_24px_60px_-22px_rgba(255,85,0,0.35)]" : "border-white/10 shadow-xl shadow-black/40"
                  }`}
                  style={{ transformOrigin: "50% 100%", transition: "border-color 400ms, box-shadow 400ms" }}
                  data-testid={`work-card-${item.slug}`}
                >
                  <span className="flex items-center gap-2 border-b border-white/10 bg-[#111113] px-2.5" style={{ height: BAR }}>
                    <span className="flex gap-1" aria-hidden="true">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                      <span className={`h-1.5 w-1.5 rounded-full ${isFront ? "bg-[#ff5500]" : "bg-white/15"}`} />
                    </span>
                    <span className="truncate text-[11px] font-semibold tracking-tight text-zinc-200">{item.name}</span>
                    <span className="ml-auto hidden truncate font-mono text-[9px] text-zinc-600 sm:block">{host(item.url)}</span>
                  </span>
                  <span className="relative block overflow-hidden bg-[#111113]" style={{ aspectRatio: `${RATIO} / 1` }}>
                    <img src={item.preview} alt="" draggable={false} decoding="async" className="absolute inset-0 h-full w-full object-cover object-top" />
                    <span ref={(el) => { shadeRefs.current[index] = el; }} className="pointer-events-none absolute inset-0 bg-[#0a0a0b]" aria-hidden="true" />
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Caption for the card nearest the front, plus controls ── */}
          <div className="mt-6 grid gap-6 border-t border-white/10 pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-start md:gap-12">
            {/* All captions share one grid cell, so the height never changes as the front card does. */}
            <div className="order-2 grid md:order-1" aria-live="polite" data-testid="selected-project-details">
              {projects.map((item, index) => {
                const selected = index === front;
                return (
                  <div
                    key={item.slug}
                    className="col-start-1 row-start-1 transition-[opacity,transform] duration-500"
                    style={{ opacity: selected ? 1 : 0, transform: selected ? "none" : "translateY(6px)", pointerEvents: selected ? undefined : "none" }}
                    aria-hidden={!selected}
                    inert={!selected}
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#ff5500]" data-testid={selected ? "selected-project-category" : undefined}>
                      {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} · {item.category}
                    </p>
                    <h3 className="mt-3 break-words text-3xl font-semibold tracking-[-0.05em] text-zinc-100 sm:text-4xl" data-testid={selected ? "selected-project-preview-title" : undefined}>
                      {item.name}
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base" data-testid={selected ? "selected-project-preview-description" : undefined}>
                      {item.description}
                    </p>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-5 inline-flex items-center gap-2 border border-[#ff5500] px-5 py-3 text-sm font-medium text-[#ff5500] transition-colors hover:bg-[#ff5500] hover:text-[#0a0a0b] ${focusRing}`}
                        data-testid={selected ? "selected-project-link" : undefined}
                      >
                        View Project
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Phones get the controls straight under the orbit; wider screens keep them beside the text. */}
            <div className="order-1 flex flex-wrap items-center justify-between gap-4 md:order-2 md:flex-col md:items-end md:justify-start">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => step(-1)} aria-label="Previous project" className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-[#ff5500] ${focusRing}`} data-testid="work-prev-button">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPaused((value) => !value)}
                  aria-pressed={paused}
                  aria-label={reducedMotion ? "Rotation off — reduced motion" : paused ? "Resume rotation" : "Pause rotation"}
                  disabled={!!reducedMotion}
                  className={`flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-[#ff5500] disabled:opacity-40 ${focusRing}`}
                  data-testid="work-pause-button"
                >
                  {paused || reducedMotion ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                  {reducedMotion ? "Still" : paused ? "Play" : "Pause"}
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next project" className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-[#ff5500] ${focusRing}`} data-testid="work-next-button">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div role="tablist" aria-label="Projects" className="flex gap-1.5">
                {projects.map((item, index) => {
                  const selected = index === front;
                  return (
                    <button
                      key={item.slug}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-label={item.name}
                      tabIndex={selected ? 0 : -1}
                      onClick={() => bringToFront(index)}
                      onKeyDown={(event) => {
                        const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: n - 1 };
                        if (!(event.key in keys)) return;
                        event.preventDefault();
                        const to = ((keys[event.key] % n) + n) % n;
                        bringToFront(to);
                        (event.currentTarget.parentElement?.children[to] as HTMLElement | undefined)?.focus();
                      }}
                      className={`group flex h-6 items-center ${focusRing}`}
                      data-testid={`project-card-${slug(item.name)}-button`}
                    >
                      <span className={`block h-[3px] rounded-full transition-all duration-500 ${selected ? "w-9 bg-[#ff5500]" : "w-4 bg-white/15 group-hover:bg-white/25"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
