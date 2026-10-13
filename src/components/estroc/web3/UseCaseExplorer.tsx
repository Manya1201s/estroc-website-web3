import { useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Info } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { applications } from "@/lib/web3Content";
import { focusRing, onTabKeyDown } from "./shared";

export default function UseCaseExplorer({ onDiscuss }: { onDiscuss: (topic: string) => void }) {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const item = applications[active];

  return (
    <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14" data-testid="use-case-explorer">
      <div role="tablist" aria-label="Industry applications" aria-orientation="vertical" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-col lg:gap-0 lg:border-t lg:border-white/10">
        {applications.map((entry, index) => {
          const selected = index === active;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              id={`usecase-tab-${entry.id}`}
              aria-selected={selected}
              aria-controls="usecase-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onTabKeyDown(event, index, applications.length, setActive)}
              className={`group flex items-center justify-between gap-3 border p-3 text-left text-sm transition-colors lg:border-x-0 lg:border-t-0 lg:px-0 lg:py-5 lg:text-lg ${focusRing} ${
                selected ? "border-[#ff5500] text-zinc-100 lg:border-white/10" : "border-white/10 text-zinc-500 hover:text-zinc-300"
              }`}
              data-testid={`usecase-tab-${entry.id}`}
            >
              <span className="flex items-baseline gap-4">
                <span className={`hidden font-mono text-xs lg:inline ${selected ? "text-[#ff5500]" : "text-zinc-700"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {entry.name}
              </span>
              <ArrowRight className={`hidden h-4 w-4 shrink-0 transition-transform lg:block ${selected ? "translate-x-1 text-[#ff5500]" : "text-zinc-700"}`} />
            </button>
          );
        })}
      </div>

      <div id="usecase-panel" role="tabpanel" aria-labelledby={`usecase-tab-${item.id}`} data-testid="usecase-panel">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={item.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="border border-white/10 bg-[#111113] p-6 sm:p-10"
          >
            <h3 className="text-3xl font-semibold tracking-[-0.045em] text-zinc-100 sm:text-4xl" data-testid="usecase-title">{item.name}</h3>

            <div className="mt-8 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2">
              <div className="bg-[#0d0d0f] p-5">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">The challenge</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300" data-testid="usecase-challenge">{item.challenge}</p>
              </div>
              <div className="bg-[#0d0d0f] p-5">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff5500]">A blockchain-based solution</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300" data-testid="usecase-solution">{item.solution}</p>
              </div>
            </div>

            <p className="mt-8 text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">What ESTROC could develop</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3" data-testid="usecase-deliverables">
              {item.deliverables.map((deliverable, index) => (
                <motion.li
                  key={deliverable}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: reducedMotion ? 0 : 0.08 * index + 0.1 }}
                  className="flex items-start gap-3 border-t border-[#ff5500]/40 pt-3 text-sm leading-snug text-zinc-200"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" />
                  {deliverable}
                </motion.li>
              ))}
            </ul>

            {item.note && (
              <p className="mt-8 flex gap-3 text-xs leading-relaxed text-zinc-500" data-testid="usecase-note">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]/80" aria-hidden="true" />
                {item.note}
              </p>
            )}

            <button
              type="button"
              onClick={() => onDiscuss(`a ${item.name.toLowerCase()} solution`)}
              className={`mt-8 inline-flex items-center gap-2 text-sm font-medium text-zinc-100 underline-offset-4 transition-colors hover:text-[#ff5500] hover:underline ${focusRing}`}
              data-testid="usecase-discuss"
            >
              Discuss a project in this area
              <ArrowUpRight className="h-4 w-4 text-[#ff5500]" />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
