import { useState } from "react";
import { AppWindow, ArrowUpRight, BadgeCheck, Blocks, Cable, Check, FileCode, Layers, Plus } from "lucide-react";
import { Rise } from "@/components/estroc/MaskReveal";
import { web3Services } from "@/lib/web3Content";
import { focusRing } from "./shared";

const icons = {
  applications: Blocks,
  "smart-contracts": FileCode,
  dapps: AppWindow,
  nfts: BadgeCheck,
  tokenization: Layers,
  integrations: Cable,
} as const;

/**
 * The heart of the page. Each card leads with the problem and what we build;
 * the worked example sits one click deeper so the grid stays scannable.
 */
export default function ServiceCards({ onDiscuss }: { onDiscuss: (topic: string) => void }) {
  const [open, setOpen] = useState<string[]>([]);
  const toggle = (id: string) => setOpen((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));

  return (
    <div className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 xl:grid-cols-3" data-testid="web3-service-cards">
      {web3Services.map((service, index) => {
        const Icon = icons[service.id as keyof typeof icons];
        const expanded = open.includes(service.id);

        return (
          // Only the contents fade in; the card face stays solid so the grid lines never flash.
          <div key={service.id} className="group relative flex flex-col bg-[#0a0a0b] transition-colors hover:bg-[#0d0d0f]" data-testid={`web3-service-${service.id}`}>
            <span className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[#ff5500] transition-transform duration-500 group-hover:scale-x-100 group-focus-within:scale-x-100" aria-hidden="true" />

            <Rise delay={(index % 3) * 0.06} className="flex flex-1 flex-col p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-zinc-500 transition-colors group-hover:border-[#ff5500]/60 group-hover:text-[#ff5500]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-mono text-xs text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
              </div>

              <h3 className="mt-6 text-2xl font-semibold leading-tight tracking-[-0.04em] text-zinc-100" data-testid={`web3-service-${service.id}-title`}>
                {service.title}
              </h3>

              <p className="mt-3 text-sm leading-relaxed text-zinc-500">
                <span className="text-zinc-300">Solves: </span>
                {service.problem}
              </p>

              <p className="mt-6 text-[10px] font-mono uppercase tracking-[0.2em] text-[#ff5500]/80">What we build</p>
              <ul className="mt-3 space-y-2.5">
                {service.builds.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-snug text-zinc-300">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => toggle(service.id)}
                  aria-expanded={expanded}
                  aria-controls={`web3-service-${service.id}-example`}
                  className={`flex w-full items-center justify-between py-4 text-left text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 transition-colors hover:text-zinc-200 ${focusRing}`}
                  data-testid={`web3-service-${service.id}-toggle`}
                >
                  Example use
                  <Plus className={`h-4 w-4 transition-transform duration-300 ${expanded ? "rotate-45 text-[#ff5500]" : ""}`} />
                </button>
                {/* grid-rows 0fr → 1fr animates to the content's natural height without measuring it. */}
                <div
                  id={`web3-service-${service.id}-example`}
                  className={`grid transition-[grid-template-rows] duration-500 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  inert={!expanded}
                >
                  <p className="overflow-hidden text-sm leading-relaxed text-zinc-400" data-testid={`web3-service-${service.id}-example`}>
                    <span className="block pb-4">{service.example}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDiscuss(service.title)}
                className={`mt-auto inline-flex items-center gap-2 self-start pt-4 text-sm font-medium text-zinc-100 underline-offset-4 transition-colors hover:text-[#ff5500] hover:underline ${focusRing}`}
                data-testid={`web3-service-${service.id}-discuss`}
              >
                Discuss this project
                <ArrowUpRight className="h-4 w-4 text-[#ff5500]" />
              </button>
            </Rise>
          </div>
        );
      })}
    </div>
  );
}
