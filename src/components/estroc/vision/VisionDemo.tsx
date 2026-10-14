import { useState } from "react";
import type { ComponentType } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { focusRing, onTabKeyDown } from "@/components/estroc/web3/shared";
import { BottleScene, DetectionScene, ShippingLabelScene } from "./VisionGraphics";
import type { SceneProps } from "./VisionGraphics";

/**
 * A concept demo, not a model. Each mode pairs a hand-drawn scene with a fixed
 * set of findings; choosing a finding highlights its region. Nothing is
 * uploaded, no camera is requested and no inference runs in the browser.
 */

type Status = "Detected" | "Action" | "Read" | "Defect" | "Review" | "Pass" | "Extracted";

interface Finding {
  id: string;
  label: string;
  detail: string;
  status: Status;
}

interface Mode {
  id: string;
  name: string;
  scene: ComponentType<SceneProps>;
  caption: string;
  summary: [string, string][];
  findings: Finding[];
}

const modes: Mode[] = [
  {
    id: "detect",
    name: "Detect",
    scene: DetectionScene,
    caption: "Retail shelf · still image",
    summary: [["Objects", "16"], ["Classes", "4"], ["Empty slots", "1"]],
    findings: [
      { id: "cereal", label: "Cereal box ×4", detail: "Top shelf · confidence 0.93", status: "Detected" },
      { id: "bottle", label: "Bottle ×3", detail: "Middle shelf · confidence 0.90", status: "Detected" },
      { id: "gap", label: "Empty slot", detail: "Middle shelf, position 4 · restock suggested", status: "Action" },
      { id: "cans", label: "Can ×8", detail: "Bottom shelf · confidence 0.88", status: "Detected" },
      { id: "price", label: "Price label", detail: "Text read as ₹149.00", status: "Read" },
    ],
  },
  {
    id: "inspect",
    name: "Inspect",
    scene: BottleScene,
    caption: "Bottling line · camera frame",
    summary: [["Bottles", "5"], ["Defects", "2"], ["For review", "1"]],
    findings: [
      { id: "cap", label: "Missing cap", detail: "Bottle 2 · confidence 0.96", status: "Defect" },
      { id: "fill", label: "Low fill level", detail: "Bottle 3 · below the fill line", status: "Defect" },
      { id: "label", label: "Label skewed", detail: "Bottle 4 · confidence 0.64 · routed to an inspector", status: "Review" },
      { id: "pass", label: "Bottles 1 and 5", detail: "Cap, fill and label within limits", status: "Pass" },
    ],
  },
  {
    id: "extract",
    name: "Extract",
    scene: ShippingLabelScene,
    caption: "Parcel label · scanned image",
    summary: [["Fields", "5"], ["Needs review", "1"], ["Format", "Label"]],
    findings: [
      { id: "tracking", label: "Tracking number", detail: "TRK 7741 2093 5518 · 0.99", status: "Extracted" },
      { id: "consignee", label: "Consignee", detail: "A. Sample · 0.95", status: "Extracted" },
      { id: "postcode", label: "Postcode", detail: "560 0?1 · 0.68 · one digit unclear, sent for review", status: "Review" },
      { id: "weight", label: "Weight", detail: "4.2 kg · 0.97", status: "Extracted" },
      { id: "service", label: "Service", detail: "Express · 0.98", status: "Extracted" },
    ],
  },
];

const statusStyle: Record<Status, string> = {
  Detected: "border-white/15 text-zinc-400",
  Extracted: "border-white/15 text-zinc-400",
  Read: "border-white/15 text-zinc-400",
  Pass: "border-white/15 text-zinc-300",
  Action: "border-[#ff5500]/40 text-[#ff5500]",
  Review: "border-[#ff5500]/40 text-[#ff5500]",
  Defect: "border-[#ff5500] bg-[#ff5500] text-[#0a0a0b]",
};

export default function VisionDemo() {
  const [modeIndex, setModeIndex] = useState(0);
  const [active, setActive] = useState<string | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);
  const reducedMotion = useReducedMotion();
  const mode = modes[modeIndex];
  const Scene = mode.scene;
  const activeFinding = mode.findings.find((finding) => finding.id === active);

  const selectMode = (index: number) => {
    setModeIndex(index);
    setActive(null);
  };

  return (
    <div className="mt-12" data-testid="vision-demo">
      <div className="flex flex-wrap items-center justify-between gap-4 border border-[#ff5500]/40 bg-[#ff5500]/[0.06] px-4 py-3">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#ff5500] sm:text-xs" data-testid="vision-demo-label">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ff5500]" aria-hidden="true" />
          Interactive concept demo · simulated results
        </p>
        <p className="text-xs text-zinc-500">Illustrations only. No images are uploaded and no camera is used.</p>
      </div>

      <div className="-mx-5 mt-6 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
        <div role="tablist" aria-label="Demo modes" className="flex min-w-max gap-2 lg:min-w-0">
          {modes.map((entry, index) => {
            const selected = index === modeIndex;
            return (
              <button
                key={entry.id}
                type="button"
                role="tab"
                id={`vision-mode-${entry.id}`}
                aria-selected={selected}
                aria-controls="vision-demo-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => selectMode(index)}
                onKeyDown={(event) => onTabKeyDown(event, index, modes.length, selectMode)}
                className={`flex items-center gap-3 border px-4 py-3 text-sm transition-colors ${focusRing} ${
                  selected ? "border-[#ff5500] text-zinc-100" : "border-white/10 text-zinc-500 hover:text-zinc-300"
                }`}
                data-testid={`vision-mode-${entry.id}`}
              >
                <span className={`font-mono text-[10px] ${selected ? "text-[#ff5500]" : "text-zinc-700"}`}>{String(index + 1).padStart(2, "0")}</span>
                {entry.name}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="vision-demo-panel"
        role="tabpanel"
        aria-labelledby={`vision-mode-${mode.id}`}
        className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-px border border-white/10 bg-white/10 lg:grid-cols-[1.4fr_0.6fr]"
      >
        {/* Workspace */}
        <div className="bg-[#0d0d0f] p-3 sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            <span className="truncate">{mode.caption}</span>
            <button
              type="button"
              onClick={() => setShowOverlay((value) => !value)}
              aria-pressed={showOverlay}
              className={`flex shrink-0 items-center gap-2 border border-white/15 px-2.5 py-1.5 text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-[#ff5500] ${focusRing}`}
              data-testid="vision-overlay-toggle"
            >
              {showOverlay ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              Annotations {showOverlay ? "on" : "off"}
            </button>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode.id}
              initial={reducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border border-white/10"
              data-testid="vision-demo-scene"
            >
              <Scene active={active} showOverlay={showOverlay} animate={!reducedMotion} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="flex flex-col bg-[#111113] p-5" data-testid="vision-demo-results">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Simulated result</p>
          <dl className="mt-3 grid grid-cols-3 gap-px border border-white/10 bg-white/10">
            {mode.summary.map(([term, value]) => (
              <div key={term} className="bg-[#111113] p-3">
                <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">{term}</dt>
                <dd className={`mt-1 text-sm font-medium ${value === "Fail" ? "text-[#ff5500]" : "text-zinc-100"}`}>{value}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Findings · select to highlight</p>
          <ul className="mt-2 space-y-1.5" data-testid="vision-demo-findings">
            {mode.findings.map((finding) => {
              const selected = finding.id === active;
              return (
                <li key={finding.id}>
                  <button
                    type="button"
                    onClick={() => setActive(selected ? null : finding.id)}
                    aria-pressed={selected}
                    className={`flex w-full items-start justify-between gap-3 border px-3 py-2.5 text-left transition-colors ${focusRing} ${
                      selected ? "border-[#ff5500] bg-[#ff5500]/[0.07]" : "border-white/10 hover:border-white/25"
                    }`}
                    data-testid={`vision-finding-${finding.id}`}
                  >
                    <span>
                      <span className="block text-sm text-zinc-100">{finding.label}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-zinc-500">{finding.detail}</span>
                    </span>
                    <span className={`shrink-0 border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em] ${statusStyle[finding.status]}`}>{finding.status}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Sample output</p>
          <pre className="mt-2 overflow-x-auto border border-white/10 bg-[#0d0d0f] p-3 font-mono text-[10.5px] leading-relaxed text-zinc-400" data-testid="vision-demo-output">
            {JSON.stringify(
              activeFinding
                ? { mode: mode.id, finding: activeFinding.label, status: activeFinding.status.toLowerCase(), detail: activeFinding.detail, simulated: true }
                : { mode: mode.id, ...Object.fromEntries(mode.summary.map(([k, v]) => [k.toLowerCase().replaceAll(" ", "_"), v])), simulated: true },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  );
}
