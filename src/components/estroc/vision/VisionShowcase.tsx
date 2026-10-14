import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Rise } from "@/components/estroc/MaskReveal";
import { DemoBadge, focusRing } from "@/components/estroc/web3/shared";
import { DocumentScene, InspectionScene, WarehouseMapScene, trackedObjects } from "./VisionGraphics";
import type { BoardDefects, TrackKind } from "./VisionGraphics";

/**
 * The page's centrepiece: three products ESTROC could build, each drawn as a
 * working app screen. Every control changes what the screen shows; every
 * figure is illustrative, and each one is labelled as a concept.
 */

const chip = (selected: boolean) =>
  `border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors ${focusRing} ${
    selected ? "border-[#ff5500] bg-[#ff5500] text-[#0a0a0b]" : "border-white/15 text-zinc-400 hover:text-zinc-200"
  }`;

const row = (selected: boolean) =>
  `flex w-full items-center justify-between gap-3 border px-3 py-2 text-left text-xs transition-colors ${focusRing} ${
    selected ? "border-[#ff5500] bg-[#ff5500]/[0.07] text-zinc-100" : "border-white/10 text-zinc-400 hover:border-white/25"
  }`;

const panelLabel = "font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600";

function AppFrame({ app, context, status, children }: { app: string; context: string; status: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#111113] shadow-2xl shadow-black/50">
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-[#ff5500]" />
        </span>
        <span className="text-sm font-semibold tracking-tight text-zinc-100">{app}</span>
        <span className="hidden truncate font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600 sm:block">/ {context}</span>
        <span className="ml-auto flex shrink-0 items-center gap-2">{status}</span>
      </div>
      {children}
    </div>
  );
}

function StatusPill({ tone, children, testId }: { tone: "ok" | "warn"; children: ReactNode; testId?: string }) {
  return (
    <span
      className={`px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] ${tone === "warn" ? "bg-[#ff5500] text-[#0a0a0b]" : "border border-white/20 text-zinc-300"}`}
      data-testid={testId}
    >
      {children}
    </span>
  );
}

/* ───────────── VisionInspect ───────────── */

const inspections: { board: string; time: string; defects: BoardDefects }[] = [
  { board: "PCB-A12", time: "10:42", defects: { missing: true, scratch: true, bridge: true } },
  { board: "PCB-A13", time: "10:41", defects: { missing: false, scratch: false, bridge: false } },
  { board: "PCB-A14", time: "10:40", defects: { missing: false, scratch: true, bridge: false } },
  { board: "PCB-A15", time: "10:39", defects: { missing: false, scratch: false, bridge: false } },
  { board: "PCB-A16", time: "10:38", defects: { missing: true, scratch: false, bridge: false } },
];
const defectCount = (d: BoardDefects) => Number(d.missing) + Number(d.scratch) + Number(d.bridge);

function VisionInspectApp() {
  const [selected, setSelected] = useState(0);
  const current = inspections[selected];
  const review = defectCount(current.defects) > 0;
  const summary: [string, number][] = [
    ["Missing component", inspections.filter((i) => i.defects.missing).length],
    ["Surface scratch", inspections.filter((i) => i.defects.scratch).length],
    ["Solder bridge", inspections.filter((i) => i.defects.bridge).length],
  ];
  const max = Math.max(...summary.map(([, n]) => n));

  return (
    <AppFrame
      app="VisionInspect"
      context="Line 2 · Station B"
      status={<StatusPill tone={review ? "warn" : "ok"} testId="inspect-status">{review ? "Review" : "Pass"}</StatusPill>}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-px bg-white/10 md:grid-cols-[1.45fr_0.55fr]">
        <div className="bg-[#0d0d0f] p-3">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-500">
            <span>{current.board} · {current.time}</span>
            <span>{review ? `${defectCount(current.defects)} finding${defectCount(current.defects) > 1 ? "s" : ""}` : "No defects found"}</span>
          </div>
          <div className="overflow-hidden border border-white/10" data-testid="inspect-scene">
            <InspectionScene active={null} showOverlay animate={false} defects={current.defects} board={current.board} />
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-[#111113] p-3">
          <div>
            <p className={panelLabel}>Inspection history</p>
            <ul className="mt-2 space-y-1.5" data-testid="inspect-history">
              {inspections.map((item, index) => {
                const flag = defectCount(item.defects) > 0;
                return (
                  <li key={item.board}>
                    <button type="button" onClick={() => setSelected(index)} aria-pressed={index === selected} className={row(index === selected)} data-testid={`inspect-item-${item.board}`}>
                      <span className="font-mono">{item.board}<span className="ml-2 text-zinc-600">{item.time}</span></span>
                      <span className={`font-mono text-[10px] uppercase ${flag ? "text-[#ff5500]" : "text-zinc-500"}`}>{flag ? "Review" : "Pass"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className={panelLabel}>Defect summary · last 5</p>
            <ul className="mt-2 space-y-2">
              {summary.map(([name, n]) => (
                <li key={name} className="text-xs text-zinc-400">
                  <div className="flex justify-between"><span>{name}</span><span className="font-mono text-zinc-200">{n}</span></div>
                  <div className="mt-1 h-1 bg-white/10"><div className="h-1 bg-[#ff5500]" style={{ width: `${(n / max) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

/* ───────────── VisionTrack ───────────── */

const trackEvents: { id: string; time: string; text: string; alert?: boolean }[] = [
  { id: "f07", time: "10:42", text: "Forklift F-07 entered Zone C", alert: true },
  { id: "p214", time: "10:40", text: "Pallet P-214 left Dock D1" },
  { id: "f11", time: "10:39", text: "Forklift F-11 moving in aisle 2" },
  { id: "p219", time: "10:35", text: "Pallet P-219 staged at bay 4" },
  { id: "w1", time: "10:33", text: "Person entered walkway (anonymous)" },
];
const filters: { id: TrackKind | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "forklift", label: "Forklifts" },
  { id: "pallet", label: "Pallets" },
  { id: "person", label: "People" },
];

function VisionTrackApp() {
  const [filter, setFilter] = useState<TrackKind | "all">("all");
  const [active, setActive] = useState<string | null>("f07");
  const reducedMotion = useReducedMotion();
  const visible = trackedObjects.filter((o) => filter === "all" || o.kind === filter);
  const count = (kind: TrackKind) => trackedObjects.filter((o) => o.kind === kind).length;

  // An event for an object the filter is hiding brings it back and selects it;
  // otherwise a second click on the same event clears the highlight.
  const pickEvent = (id: string) => {
    const kind = trackedObjects.find((o) => o.id === id)?.kind;
    const hidden = kind !== undefined && filter !== "all" && filter !== kind;
    if (hidden) setFilter("all");
    setActive(hidden || active !== id ? id : null);
  };

  return (
    <AppFrame app="VisionTrack" context="Warehouse A · floor map" status={<StatusPill tone="warn">1 zone alert</StatusPill>}>
      <div className="grid grid-cols-[minmax(0,1fr)] gap-px bg-white/10 md:grid-cols-[1.45fr_0.55fr]">
        <div className="bg-[#0d0d0f] p-3">
          <div className="mb-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Show objects">
            {filters.map((f) => (
              <button key={f.id} type="button" onClick={() => setFilter(f.id)} aria-pressed={filter === f.id} className={chip(filter === f.id)} data-testid={`track-filter-${f.id}`}>
                {f.label}
              </button>
            ))}
            <span className="ml-auto font-mono text-[10px] text-zinc-600" data-testid="track-visible">{visible.length} in view</span>
          </div>
          <div className="overflow-hidden border border-white/10" data-testid="track-scene">
            <WarehouseMapScene active={active} showOverlay animate={!reducedMotion} filter={filter} />
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-[#111113] p-3">
          <dl className="grid grid-cols-3 gap-px border border-white/10 bg-white/10">
            {([["Forklifts", count("forklift")], ["Pallets", count("pallet")], ["People", count("person")]] as [string, number][]).map(([k, v]) => (
              <div key={k} className="bg-[#111113] p-2">
                <dt className="font-mono text-[9px] uppercase tracking-[0.12em] text-zinc-600">{k}</dt>
                <dd className="mt-0.5 text-lg font-semibold text-zinc-100">{v}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className={panelLabel}>Events · select to locate</p>
            <ul className="mt-2 space-y-1.5" data-testid="track-events">
              {trackEvents.map((event) => (
                <li key={event.id}>
                  <button type="button" onClick={() => pickEvent(event.id)} aria-pressed={active === event.id} className={row(active === event.id)} data-testid={`track-event-${event.id}`}>
                    <span className="text-left leading-snug">{event.text}</span>
                    <span className={`shrink-0 font-mono text-[10px] ${event.alert ? "text-[#ff5500]" : "text-zinc-600"}`}>{event.time}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

/* ───────────── DocuVision ───────────── */

const fields: { id: string; name: string; value: string; confidence: string; flagged?: boolean }[] = [
  { id: "vendor", name: "Vendor", value: "Sample Vendor Pvt Ltd", confidence: "0.97" },
  { id: "number", name: "Invoice no.", value: "INV-20418", confidence: "0.96" },
  { id: "date", name: "Date", value: "2026-08-14", confidence: "0.95" },
  { id: "tax", name: "Tax ID", value: "29AAB•••1Z5", confidence: "0.71", flagged: true },
  { id: "total", name: "Total", value: "₹ 48,260.20", confidence: "0.98" },
];

function DocuVisionApp() {
  const [active, setActive] = useState<string | null>("tax");
  const [reviewed, setReviewed] = useState(false);

  return (
    <AppFrame
      app="DocuVision"
      context="Inbox · 1 of 3"
      status={<StatusPill tone={reviewed ? "ok" : "warn"} testId="docu-status">{reviewed ? "Ready to export" : "Needs review"}</StatusPill>}
    >
      <div className="grid grid-cols-[minmax(0,1fr)] gap-px bg-white/10 md:grid-cols-[1.3fr_0.7fr]">
        <div className="bg-[#0d0d0f] p-3">
          <div className="mb-2 flex gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]" role="group" aria-label="Document queue">
            <span className="border border-[#ff5500] px-2 py-1 text-zinc-100">Invoice INV-20418</span>
            <span className="border border-white/10 px-2 py-1 text-zinc-600">Receipt · queued</span>
            <span className="hidden border border-white/10 px-2 py-1 text-zinc-600 sm:inline">Delivery note · queued</span>
          </div>
          <div className="overflow-hidden border border-white/10" data-testid="docu-scene">
            <DocumentScene active={active} showOverlay animate={false} />
          </div>
        </div>
        <div className="flex flex-col gap-3 bg-[#111113] p-3">
          <p className={panelLabel}>Extracted fields · select to locate</p>
          <ul className="space-y-1.5" data-testid="docu-fields">
            {fields.map((field) => {
              const needsReview = field.flagged && !reviewed;
              return (
                <li key={field.id}>
                  <button type="button" onClick={() => setActive(active === field.id ? null : field.id)} aria-pressed={active === field.id} className={row(active === field.id)} data-testid={`docu-field-${field.id}`}>
                    <span>
                      <span className="block font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-600">{field.name}</span>
                      <span className="mt-0.5 block text-zinc-100">{field.value}</span>
                    </span>
                    <span className={`shrink-0 font-mono text-[10px] ${needsReview ? "text-[#ff5500]" : "text-zinc-500"}`}>
                      {needsReview ? `${field.confidence} · review` : field.flagged ? "reviewed" : field.confidence}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setReviewed((value) => !value)}
            className={`mt-auto flex items-center justify-center gap-2 border px-3 py-2 text-xs font-medium transition-colors ${focusRing} ${
              reviewed ? "border-white/15 text-zinc-300 hover:border-white/25" : "border-[#ff5500] bg-[#ff5500] text-[#0a0a0b] hover:bg-[#ff5500]/85"
            }`}
            data-testid="docu-review-button"
          >
            {reviewed ? "Undo review" : <><Check className="h-3.5 w-3.5" /> Confirm Tax ID</>}
          </button>
        </div>
      </div>
    </AppFrame>
  );
}

/* ───────────── Showcase layout ───────────── */

const projects = [
  {
    id: "project-inspect",
    number: "01",
    name: "VisionInspect",
    tagline: "AI-powered quality inspection",
    value: "Identify visible product defects and streamline quality inspection workflows.",
    features: ["Annotated defects on every image", "Pass / Review status per part", "Inspection history and defect trends"],
    topic: "an AI-powered quality inspection system like VisionInspect",
    app: <VisionInspectApp />,
  },
  {
    id: "project-track",
    number: "02",
    name: "VisionTrack",
    tagline: "Real-time object and movement analytics",
    value: "Track movement, count objects and turn visual activity into useful operational insights.",
    features: ["Object IDs and movement paths", "Counts by object type", "Zone events and alerts"],
    topic: "object and movement analytics like VisionTrack",
    app: <VisionTrackApp />,
  },
  {
    id: "project-docu",
    number: "03",
    name: "DocuVision",
    tagline: "Intelligent document processing",
    value: "Extract structured information from documents and connect it to existing business workflows.",
    features: ["Highlighted fields on the source document", "Confidence scores and review queue", "Structured output ready for your systems"],
    topic: "intelligent document processing like DocuVision",
    app: <DocuVisionApp />,
  },
];

export default function VisionShowcase({ onDiscuss }: { onDiscuss: (topic: string) => void }) {
  return (
    <div className="mt-14 space-y-24 lg:space-y-32" data-testid="vision-showcase">
      {projects.map((project, index) => (
        <article
          key={project.id}
          id={project.id}
          className={`grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:gap-14 ${index % 2 ? "lg:grid-cols-[0.5fr_1.5fr]" : "lg:grid-cols-[1.5fr_0.5fr]"}`}
          data-testid={project.id}
        >
          {/* Phones read the name first, then the app; wide screens alternate sides. */}
          <Rise className={`order-2 ${index % 2 ? "lg:order-2" : "lg:order-1"}`}>{project.app}</Rise>
          <Rise delay={0.1} className={`order-1 ${index % 2 ? "lg:order-1" : "lg:order-2"}`}>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">Project {project.number}</p>
            <h3 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-zinc-100 sm:text-5xl">{project.name}</h3>
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-[#ff5500]">{project.tagline}</p>
            <p className="mt-5 text-base leading-relaxed text-zinc-400">{project.value}</p>
            <ul className="mt-5 space-y-2">
              {project.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <DemoBadge label="ESTROC concept project · illustrative demo" />
            </div>
            <button
              type="button"
              onClick={() => onDiscuss(project.topic)}
              className={`mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-100 underline-offset-4 transition-colors hover:text-[#ff5500] hover:underline ${focusRing}`}
              data-testid={`${project.id}-discuss`}
            >
              Discuss a similar project
              <ArrowUpRight className="h-4 w-4 text-[#ff5500]" />
            </button>
          </Rise>
        </article>
      ))}
    </div>
  );
}
