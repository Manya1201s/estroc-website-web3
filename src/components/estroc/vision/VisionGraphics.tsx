import type { ReactNode } from "react";

/**
 * Hand-drawn SVG scenes for the Computer Vision page. They are illustrations
 * with annotations laid over them — no model runs, nothing is uploaded and no
 * camera is used. Fills use `cv-*` classes and strokes use currentColor with
 * zinc text classes, so every scene follows the light and dark themes.
 */

const ORANGE = "#ff5500";

export interface DetBoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  score?: string;
  /** "accent" for a finding, "muted" for context, "ok" for a passed check. */
  tone?: "accent" | "muted" | "ok";
  active?: boolean;
  dim?: boolean;
}

/** Corner-bracket detection box with a label tag — the page's one annotation style. */
export function DetBox({ x, y, w, h, label, score, tone = "accent", active = false, dim = false }: DetBoxProps) {
  const c = Math.min(12, w / 3, h / 3);
  const stroke = tone === "accent" ? ORANGE : "currentColor";
  const text = score ? `${label} ${score}` : label;
  const tagW = text.length * 5.7 + 12;
  const tagY = y >= 18 ? y - 16 : y + 2;

  return (
    <g
      className={tone === "accent" ? undefined : tone === "ok" ? "text-zinc-400" : "text-zinc-500"}
      style={{ opacity: dim ? 0.28 : 1, transition: "opacity 300ms" }}
    >
      <rect x={x} y={y} width={w} height={h} fill={active ? "rgba(255,85,0,0.14)" : "none"} stroke={stroke} strokeOpacity={active ? 0.9 : 0.35} strokeWidth={active ? 1.5 : 0.75} />
      <path
        d={`M${x} ${y + c}V${y}H${x + c} M${x + w - c} ${y}H${x + w}V${y + c} M${x + w} ${y + h - c}V${y + h}H${x + w - c} M${x + c} ${y + h}H${x}V${y + h - c}`}
        fill="none"
        stroke={stroke}
        strokeWidth={active ? 3 : 2}
      />
      <rect x={x} y={tagY} width={tagW} height="14" fill={tone === "accent" ? ORANGE : "currentColor"} />
      <text x={x + 6} y={tagY + 10} fontSize="8.5" fontFamily="JetBrains Mono Variable, monospace" letterSpacing="0.4" className="cv-tag-text">
        {text.toUpperCase()}
      </text>
    </g>
  );
}

/** Shared frame: dark viewport with a faint grid, like a camera or image canvas. */
function Canvas({ w, h, children, label }: { w: number; h: number; children: ReactNode; label: string }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={label}>
      <defs>
        <pattern id={`cv-grid-${w}-${h}`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
        <pattern id="cv-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={ORANGE} strokeWidth="1.2" strokeOpacity="0.55" />
        </pattern>
      </defs>
      <rect width={w} height={h} className="cv-fill" />
      <rect width={w} height={h} fill={`url(#cv-grid-${w}-${h})`} className="text-zinc-800" opacity="0.5" />
      {children}
    </svg>
  );
}

const S = "currentColor";

/* ───────────────────────────── Hero: a warehouse dock ───────────────────────────── */

export function HeroScene({ animate }: { animate: boolean }) {
  return (
    <Canvas w={640} h={460} label="Illustration: a warehouse dock with detection boxes around a forklift, a pallet, shelf stock and a worker, a tracked path and a live-count panel">
      {/* Back wall and floor in perspective */}
      <g className="text-zinc-700">
        <rect x="0" y="40" width="640" height="190" className="cv-fill-2" />
        <line x1="0" y1="230" x2="640" y2="230" stroke={S} />
        {[-260, -120, 20, 160, 300, 440, 580, 720, 860].map((x) => (
          <line key={x} x1={320 + (x - 320) * 0.32} y1="230" x2={x} y2="460" stroke={S} strokeWidth="0.6" />
        ))}
        {[268, 318, 382, 460].map((y) => <line key={y} x1="0" y1={y} x2="640" y2={y} stroke={S} strokeWidth="0.5" />)}
        {/* Dock door */}
        <rect x="236" y="70" width="168" height="160" className="cv-fill-3" stroke={S} />
        {[100, 130, 160, 190].map((y) => <line key={y} x1="236" y1={y} x2="404" y2={y} stroke={S} strokeWidth="0.6" />)}
      </g>

      {/* Racking, left and right, stocked with cartons */}
      {[{ x: 18, side: "l" }, { x: 470, side: "r" }].map(({ x, side }) => (
        <g key={side} className="text-zinc-600">
          <rect x={x} y="60" width="152" height="270" fill="none" stroke={S} />
          {[128, 196, 264].map((y) => <line key={y} x1={x} y1={y} x2={x + 152} y2={y} stroke={S} />)}
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) =>
              (row + col + (side === "r" ? 1 : 0)) % 5 === 4 ? null : (
                <rect key={`${row}${col}`} x={x + 8 + col * 36} y={row === 3 ? 270 : 76 + row * 68} width="30" height={row === 3 ? 56 : 48} className="cv-fill-3" stroke={S} strokeWidth="0.8" />
              ),
            ),
          )}
        </g>
      ))}

      {/* Worker in hi-vis */}
      <g className="text-zinc-500">
        <circle cx="196" cy="304" r="9" className="cv-fill-3" stroke={S} />
        <path d="M184 318h24l4 44h-32z" className="cv-fill-3" stroke={S} />
        <path d="M186 330h20" stroke={ORANGE} strokeWidth="3" />
        <path d="M188 362l-3 30M204 362l3 30" stroke={S} strokeWidth="5" strokeLinecap="round" />
      </g>

      {/* Forklift carrying a loaded pallet */}
      <g className={animate ? "cv-forklift text-zinc-500" : "text-zinc-500"}>
        <rect x="262" y="296" width="92" height="58" rx="4" className="cv-fill-3" stroke={S} />
        <path d="M276 296v-46h44l14 46" fill="none" stroke={S} strokeWidth="2" />
        <line x1="360" y1="226" x2="360" y2="364" stroke={S} strokeWidth="3" />
        <line x1="372" y1="226" x2="372" y2="364" stroke={S} strokeWidth="3" />
        <path d="M372 356h62" stroke={S} strokeWidth="3" />
        <rect x="378" y="300" width="54" height="52" className="cv-fill-2" stroke={S} />
        <line x1="378" y1="326" x2="432" y2="326" stroke={S} strokeWidth="0.8" />
        <line x1="405" y1="300" x2="405" y2="352" stroke={S} strokeWidth="0.8" />
        <circle cx="282" cy="362" r="12" className="cv-fill-2" stroke={S} strokeWidth="2" />
        <circle cx="340" cy="362" r="12" className="cv-fill-2" stroke={S} strokeWidth="2" />
      </g>

      {/* Floor pallet */}
      <g className="text-zinc-600">
        <rect x="474" y="378" width="120" height="12" className="cv-fill-3" stroke={S} />
        {[0, 1, 2].map((i) => <rect key={i} x={480 + i * 38} y="342" width="34" height="36" className="cv-fill-2" stroke={S} />)}
        {[0, 1].map((i) => <rect key={i} x={498 + i * 38} y="310" width="34" height="32" className="cv-fill-2" stroke={S} />)}
      </g>

      {/* Tracked path */}
      <path d="M70 450 C 140 420, 200 400, 300 380" fill="none" stroke={ORANGE} strokeWidth="1.5" strokeDasharray="4 6" className={animate ? "cv-dash" : undefined} />
      {[[70, 450], [134, 424], [204, 402]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.5} fill={ORANGE} opacity={0.4 + i * 0.25} />
      ))}

      {/* Annotations */}
      <g className={animate ? "cv-boxes" : undefined}>
        <DetBox x={254} y={218} w={186} h={160} label="Forklift · ID 07" score="0.94" active />
        <DetBox x={176} y={290} w={42} h={106} label="Person" score="0.91" />
        <DetBox x={470} y={304} w={128} h={90} label="Pallet" score="0.89" />
        <DetBox x={24} y={72} w={144} h={54} label="Carton ×4" tone="muted" />
        <DetBox x={476} y={276} w={36} h={50} label="Empty bay" tone="muted" />
      </g>

      {/* HUD */}
      <g fontFamily="JetBrains Mono Variable, monospace" fontSize="9" letterSpacing="0.8">
        <rect x="12" y="10" width="170" height="22" className="cv-fill" opacity="0.92" />
        <circle cx="24" cy="21" r="3" fill={ORANGE} className={animate ? "cv-blink" : undefined} />
        <text x="34" y="24" fill={S} className="text-zinc-300">CAM 03 · DOCK B · SIMULATED</text>
        <rect x="452" y="10" width="176" height="64" className="cv-fill" opacity="0.92" stroke={ORANGE} strokeOpacity="0.4" />
        <text x="462" y="26" fill={ORANGE}>LIVE COUNT (DEMO)</text>
        {[["PALLETS", "12"], ["FORKLIFTS", "2"], ["ZONE B", "CLEAR"]].map(([k, v], i) => (
          <g key={k}>
            <text x="462" y={42 + i * 13} fill={S} className="text-zinc-500">{k}</text>
            <text x="618" y={42 + i * 13} fill={S} textAnchor="end" className="text-zinc-200">{v}</text>
          </g>
        ))}
        <text x="74" y="440" fill={ORANGE}>TRACK 07</text>
      </g>

      {animate && <rect className="cv-scan" x="0" y="0" width="640" height="2" fill={ORANGE} opacity="0.35" />}
    </Canvas>
  );
}

/* ───────────────────────────── Demo scenes ───────────────────────────── */

export interface SceneProps {
  active: string | null;
  showOverlay: boolean;
  animate: boolean;
}

const dimmed = (active: string | null, id: string) => active !== null && active !== id;

/** Retail shelf: products, a gap and a price label. */
export function DetectionScene({ active, showOverlay }: SceneProps) {
  return (
    <Canvas w={640} h={400} label="Illustrative retail shelf with detected products, an empty slot and a price label">
      <g className="text-zinc-600">
        {[110, 240, 370].map((y) => <rect key={y} x="30" y={y} width="580" height="8" className="cv-fill-3" stroke={S} />)}
        {/* Top shelf: cereal boxes */}
        {[0, 1, 2, 3].map((i) => <rect key={i} x={44 + i * 64} y="24" width="54" height="86" className="cv-fill-2" stroke={S} />)}
        {[0, 1, 2].map((i) => <rect key={`b${i}`} x={360 + i * 70} y="34" width="58" height="76" className="cv-fill-3" stroke={S} />)}
        {/* Middle shelf: bottles, with a gap */}
        {[0, 1, 2, 4, 5].map((i) => (
          <path key={i} d={`M${60 + i * 54} 240v-70q0-14 10-18v-18h14v18q10 4 10 18v70z`} className="cv-fill-2" stroke={S} />
        ))}
        {/* Bottom shelf: cans */}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={50 + i * 44} y="312" width="36" height="58" rx="5" className="cv-fill-2" stroke={S} />)}
        <rect x="420" y="380" width="70" height="16" className="cv-fill" stroke={ORANGE} />
        <text x="430" y="392" fontSize="9" fontFamily="JetBrains Mono Variable, monospace" fill={S} className="text-zinc-300">₹ 149.00</text>
      </g>
      {showOverlay && (
        <g>
          <DetBox x={40} y={20} w={250} h={94} label="Cereal box ×4" score="0.93" active={active === "cereal"} dim={dimmed(active, "cereal")} />
          <DetBox x={50} y={146} w={152} h={98} label="Bottle ×3" score="0.90" active={active === "bottle"} dim={dimmed(active, "bottle")} />
          <DetBox x={212} y={146} w={50} h={98} label="Empty slot" active={active === "gap"} dim={dimmed(active, "gap")} />
          <DetBox x={44} y={306} w={356} h={68} label="Can ×8" score="0.88" tone="muted" active={active === "cans"} dim={dimmed(active, "cans")} />
          <DetBox x={416} y={376} w={78} h={22} label="Price label" tone="muted" active={active === "price"} dim={dimmed(active, "price")} />
        </g>
      )}
    </Canvas>
  );
}

export interface BoardDefects {
  missing: boolean;
  scratch: boolean;
  bridge: boolean;
}
const ALL_DEFECTS: BoardDefects = { missing: true, scratch: true, bridge: true };

/** Circuit board under inspection; which defects appear is configurable. */
export function InspectionScene({ active, showOverlay, defects = ALL_DEFECTS, board = "PCB-A12" }: SceneProps & { defects?: BoardDefects; board?: string }) {
  const found = [defects.missing && "a missing component", defects.scratch && "a surface scratch", defects.bridge && "a possible solder bridge"].filter(Boolean);
  return (
    <Canvas w={640} h={400} label={`Illustrative circuit board ${board} under inspection${found.length ? " with " + found.join(", ") : ", no defects found"}`}>
      <g className="text-zinc-600">
        <rect x="70" y="40" width="500" height="320" rx="10" className="cv-fill-2" stroke={S} strokeWidth="1.5" />
        {[[100, 90, 300, 90], [100, 300, 540, 300], [300, 90, 300, 180], [420, 70, 420, 260], [140, 180, 540, 180], [180, 230, 180, 330]].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={S} strokeWidth="1.5" />
        ))}
        {/* Main chip */}
        <rect x="240" y="120" width="120" height="120" className="cv-fill-3" stroke={S} />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i}>
            <rect x={250 + i * 13} y="112" width="6" height="8" fill={S} />
            <rect x={250 + i * 13} y="240" width="6" height="8" fill={S} />
          </g>
        ))}
        {/* Capacitors C1–C3 present, C4 slot empty */}
        {[[120, 110], [120, 160], [470, 110]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="16" className="cv-fill-3" stroke={S} />)}
        {defects.missing ? (
          <circle cx="470" cy="160" r="16" fill="none" stroke={S} strokeDasharray="3 3" />
        ) : (
          <circle cx="470" cy="160" r="16" className="cv-fill-3" stroke={S} />
        )}
        <text x="458" y="196" fontSize="9" fontFamily="JetBrains Mono Variable, monospace" fill={S}>C4</text>
        {/* Resistors */}
        {[0, 1, 2, 3].map((i) => <rect key={i} x={400 + i * 30} y="280" width="20" height="40" rx="3" className="cv-fill-3" stroke={S} />)}
        {/* Solder bridge between two pads */}
        <rect x="140" y="270" width="12" height="12" fill={S} />
        <rect x="160" y="270" width="12" height="12" fill={S} />
        {defects.bridge && <rect x="150" y="273" width="12" height="6" fill={ORANGE} opacity="0.7" />}
        {/* Scratch */}
        {defects.scratch && <path d="M300 300 L370 330" stroke={ORANGE} strokeWidth="1.5" opacity="0.8" />}
        {/* Label */}
        <rect x="90" y="320" width="70" height="22" className="cv-fill" stroke={S} />
        <text x="98" y="335" fontSize="8.5" fontFamily="JetBrains Mono Variable, monospace" fill={S}>{board}</text>
      </g>
      {showOverlay && (
        <g>
          {defects.missing && <DetBox x={446} y={136} w={48} h={48} label="Missing C4" active={active === "missing"} dim={dimmed(active, "missing")} />}
          {defects.scratch && <DetBox x={292} y={292} w={86} h={46} label="Scratch" score="0.81" active={active === "scratch"} dim={dimmed(active, "scratch")} />}
          {defects.bridge && <DetBox x={134} y={264} w={44} h={24} label="Bridge?" score="0.62" active={active === "bridge"} dim={dimmed(active, "bridge")} />}
          <DetBox x={86} y={316} w={78} h={30} label="Label OK" tone="ok" active={active === "label"} dim={dimmed(active, "label")} />
          <DetBox x={236} y={108} w={128} h={144} label="Chip aligned" tone="ok" active={active === "align"} dim={dimmed(active, "align")} />
        </g>
      )}
    </Canvas>
  );
}

/** Sample invoice with extracted field regions. */
export function DocumentScene({ active, showOverlay }: SceneProps) {
  const t = { fontFamily: "Outfit Variable, sans-serif", fill: S } as const;
  return (
    <Canvas w={640} h={400} label="Illustrative sample invoice with highlighted text regions for vendor, invoice number, date, tax ID and total">
      <g className="text-zinc-400" transform="rotate(-1.2 320 200)">
        <rect x="150" y="16" width="340" height="372" className="cv-paper" stroke={S} strokeOpacity="0.3" />
        <text x="172" y="46" fontSize="18" fontWeight="700" {...t} className="text-zinc-200">INVOICE</text>
        <text x="172" y="86" fontSize="10" {...t}>Sample Vendor Pvt Ltd</text>
        <text x="172" y="99" fontSize="8" {...t} className="text-zinc-600">12 Example Road, Sample City</text>
        <text x="350" y="52" fontSize="9" {...t}>Invoice No.</text>
        <text x="420" y="52" fontSize="9" {...t} className="text-zinc-200">INV-20418</text>
        <text x="350" y="86" fontSize="9" {...t}>Date</text>
        <text x="420" y="86" fontSize="9" {...t} className="text-zinc-200">14 Aug 2026</text>
        <text x="172" y="127" fontSize="8" {...t}>Tax ID</text>
        <text x="206" y="127" fontSize="8" {...t} className="text-zinc-300">29AAB•••1Z5</text>
        <line x1="172" y1="142" x2="468" y2="142" stroke={S} strokeOpacity="0.4" />
        {[["Steel brackets ×40", "18,400.00"], ["Fasteners kit ×12", "9,960.00"], ["Packaging ×200", "12,540.00"]].map(([item, amount], i) => (
          <g key={item}>
            <text x="172" y={164 + i * 22} fontSize="9" {...t}>{item}</text>
            <text x="468" y={164 + i * 22} fontSize="9" textAnchor="end" {...t}>{amount}</text>
          </g>
        ))}
        <line x1="172" y1="230" x2="468" y2="230" stroke={S} strokeOpacity="0.4" />
        <text x="340" y="247" fontSize="9" {...t}>Tax (18%)</text>
        <text x="468" y="247" fontSize="9" textAnchor="end" {...t}>7,360.20</text>
        <text x="340" y="285" fontSize="11" fontWeight="700" {...t} className="text-zinc-200">Total</text>
        <text x="468" y="285" fontSize="11" fontWeight="700" textAnchor="end" {...t} className="text-zinc-200">₹ 48,260.20</text>
        {[312, 326, 340].map((y) => <rect key={y} x="172" y={y} width={y === 340 ? 120 : 200} height="5" fill={S} opacity="0.25" />)}
        <path d="M380 352 q14 -18 26 0 t26 0" fill="none" stroke={S} strokeOpacity="0.6" />
      </g>
      {showOverlay && (
        <g transform="rotate(-1.2 320 200)">
          <DetBox x={166} y={73} w={124} h={18} label="Vendor" score="0.97" active={active === "vendor"} dim={dimmed(active, "vendor")} />
          <DetBox x={414} y={40} w={70} h={16} label="Invoice no." score="0.96" active={active === "number"} dim={dimmed(active, "number")} />
          <DetBox x={414} y={75} w={70} h={14} label="Date" score="0.95" tone="muted" active={active === "date"} dim={dimmed(active, "date")} />
          <DetBox x={168} y={117} w={104} h={14} label="Tax ID" score="0.71" active={active === "tax"} dim={dimmed(active, "tax")} />
          <DetBox x={334} y={271} w={140} h={20} label="Total" score="0.98" active={active === "total"} dim={dimmed(active, "total")} />
        </g>
      )}
    </Canvas>
  );
}

/** Top-down warehouse floor: docks, racking, a restricted zone and tracked movers. */
export type TrackKind = "forklift" | "pallet" | "person";

export const trackedObjects: { id: string; kind: TrackKind; label: string; box: [number, number, number, number]; path?: string }[] = [
  { id: "f07", kind: "forklift", label: "Forklift F-07", box: [338, 292, 44, 30], path: "M240 44 L240 200 L352 300" },
  { id: "f11", kind: "forklift", label: "Forklift F-11", box: [474, 168, 32, 44], path: "M490 360 L490 196" },
  { id: "p214", kind: "pallet", label: "Pallet P-214", box: [148, 108, 34, 34], path: "M120 40 L120 92 L160 122" },
  { id: "p219", kind: "pallet", label: "Pallet P-219", box: [250, 212, 34, 34] },
  { id: "w1", kind: "person", label: "Person (anon.)", box: [80, 194, 26, 26], path: "M60 350 L92 214" },
];

export function WarehouseMapScene({ active, showOverlay, animate, filter = "all" }: SceneProps & { filter?: TrackKind | "all" }) {
  const shown = trackedObjects.filter((o) => filter === "all" || o.kind === filter);
  const docks: [number, string][] = [[80, "D1"], [200, "D2"], [320, "D3"]];
  return (
    <Canvas w={640} h={400} label="Illustrative top-down warehouse floor with docks, racking, a restricted zone, and tracked forklifts, pallets and a person">
      <g className="text-zinc-700">
        <rect x="20" y="20" width="600" height="360" className="cv-fill-2" stroke={S} />
        {docks.map(([x, name]) => (
          <g key={name}>
            <rect x={x} y="20" width="80" height="14" className="cv-fill-3" stroke={S} />
            <text x={x + 30} y="31" fontSize="9" fontFamily="JetBrains Mono Variable, monospace" fill={S} className="text-zinc-500">{name}</text>
          </g>
        ))}
        {[440, 520].map((x) => <rect key={x} x={x} y="80" width="30" height="260" className="cv-fill-3" stroke={S} />)}
        {[250, 300].map((y) => <rect key={y} x="60" y={y} width="240" height="20" className="cv-fill-3" stroke={S} />)}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <line key={i} x1="440" y1={80 + i * 37} x2="550" y2={80 + i * 37} stroke={S} strokeWidth="0.5" />)}
      </g>
      <rect x="320" y="270" width="100" height="90" fill="url(#cv-hatch)" />
      <rect x="320" y="270" width="100" height="90" fill="none" stroke={ORANGE} strokeDasharray="5 4" />
      <text x="324" y="372" fontSize="8.5" fontFamily="JetBrains Mono Variable, monospace" fill={ORANGE}>ZONE C · RESTRICTED</text>

      {/* The movers themselves */}
      <g className="text-zinc-400">
        <rect x="342" y="298" width="36" height="20" rx="3" className="cv-fill-3" stroke={S} />
        <rect x="480" y="174" width="20" height="32" rx="3" className="cv-fill-3" stroke={S} />
        {[[152, 112], [254, 216]].map(([x, y]) => (
          <g key={x}>
            <rect x={x} y={y} width="26" height="26" className="cv-fill-3" stroke={S} />
            <path d={`M${x} ${y + 13}h26M${x + 13} ${y}v26`} stroke={S} strokeWidth="0.6" />
          </g>
        ))}
        <circle cx="93" cy="207" r="8" className="cv-fill-3" stroke={S} />
      </g>

      {showOverlay &&
        shown.map((o) => (
          <g key={o.id}>
            {o.path && (
              <g style={{ opacity: dimmed(active, o.id) ? 0.25 : 1 }}>
                <path d={o.path} fill="none" stroke={ORANGE} strokeWidth="1.4" strokeDasharray="3 5" />
                {animate && (
                  <circle r="3" fill={ORANGE}>
                    <animateMotion dur="5s" repeatCount="indefinite" path={o.path} />
                  </circle>
                )}
              </g>
            )}
            <DetBox x={o.box[0]} y={o.box[1]} w={o.box[2]} h={o.box[3]} label={o.label} tone={o.kind === "person" ? "muted" : "accent"} active={active === o.id} dim={dimmed(active, o.id)} />
          </g>
        ))}
    </Canvas>
  );
}

/** Bottling line: one missing cap, one low fill, one skewed label. */
export function BottleScene({ active, showOverlay }: SceneProps) {
  const bottles = [
    { x: 90, cap: true, fill: 160, skew: 0 },
    { x: 210, cap: false, fill: 160, skew: 0 },
    { x: 330, cap: true, fill: 236, skew: 0 },
    { x: 450, cap: true, fill: 160, skew: -9 },
    { x: 570, cap: true, fill: 160, skew: 0 },
  ];
  return (
    <Canvas w={640} h={400} label="Illustrative bottling line with five bottles: one missing a cap, one under-filled and one with a skewed label">
      <g className="text-zinc-600">
        <rect x="10" y="300" width="620" height="26" className="cv-fill-3" stroke={S} />
        {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={28 + i * 39} cy="313" r="7" fill="none" stroke={S} strokeWidth="0.8" />)}
        {bottles.map((b, i) => (
          <g key={i}>
            <rect x={b.x - 12} y="100" width="24" height="42" className="cv-fill-2" stroke={S} />
            {b.cap && <rect x={b.x - 15} y="84" width="30" height="18" rx="2" className="cv-fill-3" stroke={S} />}
            <rect x={b.x - 30} y="140" width="60" height="158" rx="10" className="cv-fill-2" stroke={S} />
            <rect x={b.x - 26} y={b.fill} width="52" height={294 - b.fill} rx="6" className="cv-fill-3" />
            <line x1={b.x - 26} y1={b.fill} x2={b.x + 26} y2={b.fill} stroke={S} strokeDasharray="2 2" />
            <g transform={`rotate(${b.skew} ${b.x} 228)`}>
              <rect x={b.x - 30} y="206" width="60" height="44" className="cv-paper" stroke={S} />
              <path d={`M${b.x - 20} 220h40M${b.x - 20} 230h28M${b.x - 20} 240h34`} stroke={S} strokeWidth="1" opacity="0.6" />
            </g>
          </g>
        ))}
      </g>
      {showOverlay && (
        <g>
          <DetBox x={190} y={72} w={40} h={36} label="No cap" score="0.96" active={active === "cap"} dim={dimmed(active, "cap")} />
          <DetBox x={296} y={150} w={68} h={90} label="Low fill" score="0.88" active={active === "fill"} dim={dimmed(active, "fill")} />
          <DetBox x={414} y={196} w={72} h={64} label="Label skew?" score="0.64" active={active === "label"} dim={dimmed(active, "label")} />
          <DetBox x={56} y={80} w={68} h={222} label="Pass" tone="ok" active={active === "pass"} dim={dimmed(active, "pass")} />
          <DetBox x={536} y={80} w={68} h={222} label="Pass" tone="ok" active={active === "pass"} dim={dimmed(active, "pass")} />
        </g>
      )}
    </Canvas>
  );
}

/** Parcel shipping label with tracking number, consignee, postcode, weight and service. */
export function ShippingLabelScene({ active, showOverlay }: SceneProps) {
  const t = { fontFamily: "Outfit Variable, sans-serif", fill: S } as const;
  const widths = [3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 1, 2, 2, 1, 3];
  let cursor = 196;
  const bars = widths.map((w, i) => {
    const x = cursor;
    cursor += w * 2 + 2;
    return i % 2 === 0 ? <rect key={i} x={x} y="262" width={w * 2} height="62" fill={S} /> : null;
  });
  return (
    <Canvas w={640} h={400} label="Illustrative parcel shipping label with highlighted tracking number, consignee, postcode, weight and service">
      <g className="text-zinc-400" transform="rotate(1.5 320 200)">
        <rect x="170" y="24" width="300" height="352" className="cv-paper" stroke={S} strokeOpacity="0.3" />
        <rect x="372" y="40" width="82" height="24" fill="none" stroke={S} strokeWidth="1.5" />
        <text x="381" y="57" fontSize="12" fontWeight="700" {...t} className="text-zinc-200">EXPRESS</text>
        <text x="188" y="50" fontSize="8" {...t} className="text-zinc-600">FROM</text>
        <text x="188" y="62" fontSize="9" {...t}>Sample Warehouse, Example City</text>
        <line x1="188" y1="80" x2="454" y2="80" stroke={S} strokeOpacity="0.4" />
        <text x="188" y="100" fontSize="8" {...t} className="text-zinc-600">SHIP TO</text>
        <text x="188" y="122" fontSize="14" fontWeight="700" {...t} className="text-zinc-200">A. Sample</text>
        <text x="188" y="140" fontSize="10" {...t}>14 Demo Street, Block C</text>
        <text x="188" y="156" fontSize="10" {...t}>Sample City</text>
        <text x="188" y="180" fontSize="13" fontWeight="700" {...t} className="text-zinc-200">560 0?1</text>
        <line x1="188" y1="198" x2="454" y2="198" stroke={S} strokeOpacity="0.4" />
        <text x="188" y="218" fontSize="8" {...t} className="text-zinc-600">WEIGHT</text>
        <text x="188" y="234" fontSize="12" fontWeight="600" {...t} className="text-zinc-200">4.2 kg</text>
        <text x="300" y="218" fontSize="8" {...t} className="text-zinc-600">PIECES</text>
        <text x="300" y="234" fontSize="12" fontWeight="600" {...t} className="text-zinc-200">1 / 1</text>
        <g className="text-zinc-300">{bars}</g>
        <text x="196" y="342" fontSize="11" letterSpacing="2" fontFamily="JetBrains Mono Variable, monospace" fill={S} className="text-zinc-200">TRK 7741 2093 5518</text>
      </g>
      {showOverlay && (
        <g transform="rotate(1.5 320 200)">
          <DetBox x={190} y={328} w={170} h={20} label="Tracking no." score="0.99" active={active === "tracking"} dim={dimmed(active, "tracking")} />
          <DetBox x={184} y={108} w={96} h={20} label="Consignee" score="0.95" active={active === "consignee"} dim={dimmed(active, "consignee")} />
          <DetBox x={184} y={166} w={72} h={20} label="Postcode" score="0.68" active={active === "postcode"} dim={dimmed(active, "postcode")} />
          <DetBox x={184} y={222} w={64} h={18} label="Weight" score="0.97" tone="muted" active={active === "weight"} dim={dimmed(active, "weight")} />
          <DetBox x={368} y={36} w={90} h={32} label="Service" score="0.98" tone="muted" active={active === "service"} dim={dimmed(active, "service")} />
        </g>
      )}
    </Canvas>
  );
}
