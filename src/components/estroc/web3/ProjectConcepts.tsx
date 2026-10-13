import type { ReactNode } from "react";
import { ArrowUpRight, Check, Lock } from "lucide-react";
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

function NftMock() {
  return (
    <div className="grid h-full grid-cols-[1.4fr_1fr] gap-2.5">
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`relative aspect-square overflow-hidden rounded-[3px] border ${i === 1 ? "border-[#ff5500]" : "border-white/10"} bg-[#0a0a0b]`}>
            <span
              className="absolute rounded-full border border-[#ff5500]/60"
              style={{ inset: `${18 + (i % 3) * 6}%`, opacity: 0.35 + (i % 2) * 0.4 }}
            />
            {i === 1 && <span className="absolute inset-[42%] rounded-full bg-[#ff5500]" />}
          </div>
        ))}
      </div>
      <div className="flex flex-col rounded-[3px] border border-white/10 bg-[#0a0a0b] p-2.5">
        <p className={caption}>Item #0012</p>
        <p className="mt-1 text-[11px] font-medium text-zinc-200">Founders Pass</p>
        <p className="mt-2 font-mono text-[9px] text-zinc-500">Owner 0xA1…demo</p>
        <div className="mt-auto space-y-1.5">
          <span className="block rounded-[3px] bg-[#ff5500] py-1 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#0a0a0b]">Mint</span>
          <span className="block rounded-[3px] border border-white/15 py-1 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-zinc-400">List</span>
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
            className="group flex h-full flex-col border border-white/10 bg-[#111113] transition-colors hover:border-[#ff5500]/50"
            data-testid={`web3-concept-${concept.id}`}
          >
            {/* The sketch sits in a minimal window frame so it reads as product UI. */}
            <div className="m-3 rounded-md border border-white/10 bg-[#0d0d0f]" aria-hidden="true">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/15" />
                <span className="ml-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-600">{concept.name}</span>
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
                className={`mt-auto inline-flex items-center gap-2 self-start pt-6 text-sm font-medium text-zinc-100 underline-offset-4 transition-colors hover:text-[#ff5500] hover:underline ${focusRing}`}
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
