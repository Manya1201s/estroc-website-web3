import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { ArrowUpRight, Check, Lock, X } from "lucide-react";
import { Rise } from "@/components/estroc/MaskReveal";
import { concepts } from "@/lib/web3Content";
import type { Concept } from "@/lib/web3Content";
import { DemoBadge, focusRing } from "./shared";

/**
 * Three hypothetical products, drawn as interface sketches in markup rather
 * than images so they cost no requests and follow the theme. They are labelled
 * as concepts everywhere they appear — none of them is a client deployment.
 */

const caption = "font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600";

/**
 * Item types for the six sample tiles, taken from the asset kinds the NFT
 * service already lists (memberships, passes, collectibles, certificates).
 * Numbers and the owner are demo placeholders; nothing here is a real token.
 */
const nftItems = ["Access Pass", "Founders Pass", "Event Ticket", "Certificate", "Collectible", "Member Badge"].map((name, i) => ({
  name,
  number: `#${String(11 + i).padStart(4, "0")}`,
}));

/** The original ring artwork for tile `i`, at any size. */
function NftArt({ i, large = false }: { i: number; large?: boolean }) {
  return (
    <>
      <span className="absolute rounded-full border border-[#ff5500]/60" style={{ inset: `${18 + (i % 3) * 6}%`, opacity: (large ? 0.6 : 0.35) + (i % 2) * 0.4 }} />
      {i === 1 && <span className="absolute inset-[42%] rounded-full bg-[#ff5500]" />}
      {/* Iridescent sweep, kept faint so the artwork stays the subject. */}
      <span className="nft-holo pointer-events-none absolute inset-0" />
    </>
  );
}

/** Pointer-driven tilt, written to CSS variables so React never re-renders on move. */
function tilt(event: PointerEvent<HTMLElement>, strength: number) {
  if (event.pointerType !== "mouse") return;
  const el = event.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (event.clientX - r.left) / r.width - 0.5;
  const y = (event.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--rx", `${(-y * strength).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${(x * strength).toFixed(2)}deg`);
  el.style.setProperty("--gx", `${((x + 0.5) * 100).toFixed(1)}%`);
}

function untilt(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  el.style.removeProperty("--rx");
  el.style.removeProperty("--ry");
  el.style.removeProperty("--gx");
}

function NftMock() {
  const [selected, setSelected] = useState(1);
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Reveal the artwork once, when the card first scrolls into view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (open) closeRef.current?.focus({ preventScroll: true });
  }, [open]);

  const close = () => {
    setOpen(false);
    tileRefs.current[selected]?.focus({ preventScroll: true });
  };
  const item = nftItems[selected];

  return (
    <div
      ref={rootRef}
      className={`relative grid h-full grid-cols-[1.4fr_1fr] gap-2.5 ${shown ? "nft-in" : ""}`}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.stopPropagation();
          close();
        }
      }}
      data-testid="nft-showcase"
    >
      <div className="grid grid-cols-3 gap-1.5" role="group" aria-label="Sample NFT items, concept demo">
        {nftItems.map((entry, i) => (
          <button
            key={entry.number}
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
            type="button"
            onClick={() => {
              setSelected(i);
              setOpen(true);
            }}
            onPointerMove={(event) => tilt(event, 16)}
            onPointerLeave={untilt}
            aria-label={`${entry.name} ${entry.number}, sample item. Open preview`}
            aria-pressed={i === selected}
            className={`nft-reveal nft-tile nft-glow relative aspect-square overflow-hidden rounded-[3px] border bg-[#0a0a0b] ${
              i === selected ? "border-[#ff5500]" : "border-white/10"
            } ${focusRing}`}
            style={{ "--i": i } as CSSProperties}
            data-testid={`nft-tile-${i}`}
          >
            <span className="nft-art absolute inset-0">
              <NftArt i={i} />
            </span>
          </button>
        ))}
      </div>

      <div className="nft-reveal flex flex-col rounded-[3px] border border-white/10 bg-[#0a0a0b] p-2.5" style={{ "--i": 3 } as CSSProperties} data-testid="nft-detail">
        <p className={caption}>Item {item.number}</p>
        <p className="mt-1 text-[11px] font-medium text-zinc-200">{item.name}</p>
        <p className="mt-2 font-mono text-[9px] text-zinc-500">Owner 0xA1…demo</p>
        <div className="mt-auto space-y-1.5" aria-hidden="true">
          <span className="block rounded-[3px] bg-[#ff5500] py-1 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#0a0a0b]">Mint</span>
          <span className="block rounded-[3px] border border-white/15 py-1 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">List</span>
        </div>
      </div>

      {/* Enlarged preview of the chosen item, inside the same concept window. */}
      <div
        className="nft-preview absolute -inset-1 z-10 grid grid-cols-[auto_1fr] gap-3 rounded-[4px] border border-[#ff5500]/40 bg-[#0a0a0b] p-2"
        data-open={open}
        inert={!open}
        aria-hidden={!open}
        role="dialog"
        aria-label={`${item.name} ${item.number}, enlarged preview`}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        data-testid="nft-preview"
      >
        <div
          className="nft-tile nft-float relative aspect-square h-full overflow-hidden rounded-[3px] border border-[#ff5500]/60 bg-[#0a0a0b]"
          onPointerMove={(event) => tilt(event, 12)}
          onPointerLeave={untilt}
        >
          <span className="nft-art absolute inset-0">
            <NftArt i={selected} large />
          </span>
        </div>
        <div className="flex min-w-0 flex-col py-1">
          <p className={caption}>Item {item.number}</p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-zinc-100" data-testid="nft-preview-name">
            {item.name}
          </p>
          <p className="mt-1.5 font-mono text-[9px] text-zinc-500">Owner 0xA1…demo</p>
          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#ff5500]">Concept · sample data</p>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className={`nft-btn mt-auto inline-flex items-center gap-1.5 self-start rounded-[3px] border border-white/15 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-300 hover:border-[#ff5500] hover:text-[#ff5500] ${focusRing}`}
            data-testid="nft-preview-close"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkflowMock() {
  const rows: [string, string, "done" | "wait" | "lock"][] = [
    ["Milestone 1", "Released", "done"],
    ["Milestone 2", "Awaiting approval", "wait"],
    ["Milestone 3", "Locked", "lock"],
  ];
  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i < 2 ? "bg-[#ff5500]" : "bg-white/10"}`} />
        ))}
      </div>
      <p className={caption}>Contract status · step 2 of 4</p>
      <div className="flex-1 divide-y divide-white/10 rounded-[3px] border border-white/10 bg-[#0a0a0b]">
        {rows.map(([label, status, state]) => (
          <div key={label} className="flex items-center justify-between px-2.5 py-2 text-[10px]">
            <span className="text-zinc-300">{label}</span>
            <span className={`flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] ${state === "done" ? "text-[#ff5500]" : state === "wait" ? "text-zinc-300" : "text-zinc-600"}`}>
              {state === "done" && <Check className="h-3 w-3" />}
              {state === "wait" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff5500]" />}
              {state === "lock" && <Lock className="h-3 w-3" />}
              {status}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-1.5">
        <span className="flex-1 rounded-[3px] bg-[#ff5500] py-1 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#0a0a0b]">Approve</span>
        <span className="flex-1 rounded-[3px] border border-white/15 py-1 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">Dispute</span>
      </div>
    </div>
  );
}

function EnergyMock() {
  const bars = [38, 52, 46, 70, 64, 82, 58, 74, 90, 68];
  return (
    <div className="grid h-full grid-cols-[1.2fr_1fr] gap-2.5">
      <div className="flex flex-col rounded-[3px] border border-white/10 bg-[#0a0a0b] p-2.5">
        <p className={caption}>Generation recorded</p>
        <div className="mt-2 flex flex-1 items-end gap-1">
          {bars.map((h, i) => (
            <span key={i} className={`flex-1 rounded-t-[2px] ${i === bars.length - 2 ? "bg-[#ff5500]" : "bg-[#ff5500]/35"}`} style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className={caption}>Certificates</p>
        {["REC-0142 · Solar", "REC-0143 · Wind", "REC-0144 · Solar"].map((cert, i) => (
          <div key={cert} className="flex items-center justify-between rounded-[3px] border border-white/10 bg-[#0a0a0b] px-2 py-1.5">
            <span className="font-mono text-[9px] text-zinc-300">{cert}</span>
            <span className={`h-1.5 w-1.5 rounded-full ${i < 2 ? "bg-[#ff5500]" : "bg-zinc-600"}`} />
          </div>
        ))}
        <p className="mt-auto font-mono text-[9px] text-zinc-600">History · 3 transfers</p>
      </div>
    </div>
  );
}

const mocks: Record<Concept["id"], ReactNode> = {
  nft: <NftMock />,
  workflow: <WorkflowMock />,
  energy: <EnergyMock />,
};

export default function ProjectConcepts({ onDiscuss }: { onDiscuss: (topic: string) => void }) {
  return (
    <div className="mt-12 grid gap-6 lg:grid-cols-3" data-testid="web3-concepts">
      {concepts.map((concept, index) => (
        <Rise key={concept.id} delay={index * 0.08} className="h-full">
          <article
            className={`group flex h-full flex-col border border-white/10 bg-[#111113] transition-colors hover:border-[#ff5500]/50 ${concept.id === "nft" ? "nft-card" : ""}`}
            data-testid={`web3-concept-${concept.id}`}
          >
            {/* The sketch sits in a minimal window frame so it reads as product UI. */}
            {/* The NFT sketch is interactive (selectable items); the others are decoration. */}
            <div className="m-3 rounded-md border border-white/10 bg-[#0d0d0f]" aria-hidden={concept.id === "nft" ? undefined : true}>
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600" aria-hidden="true">{concept.name}</span>
              </div>
              <div className="h-[178px] p-3 transition-transform duration-500 group-hover:scale-[1.015]">{mocks[concept.id]}</div>
            </div>

            <div className="flex flex-1 flex-col px-6 pb-6 pt-3">
              <DemoBadge label="Concept · not a client project" />
              <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-zinc-100">{concept.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{concept.summary}</p>
              <ul className="mt-5 space-y-2 border-t border-white/10 pt-4">
                {concept.deliverables.map((deliverable) => (
                  <li key={deliverable} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" />
                    {deliverable}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onDiscuss(`a ${concept.name.toLowerCase()}`)}
                className={`mt-auto inline-flex items-center gap-2 self-start pt-6 text-sm font-medium text-zinc-100 underline-offset-4 transition-colors hover:text-[#ff5500] hover:underline ${concept.id === "nft" ? "nft-cta" : ""} ${focusRing}`}
                data-testid={`web3-concept-${concept.id}-discuss`}
              >
                Discuss a similar project
                <ArrowUpRight className="h-4 w-4 text-[#ff5500]" />
              </button>
            </div>
          </article>
        </Rise>
      ))}
    </div>
  );
}
