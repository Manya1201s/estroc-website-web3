import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCases } from "@/lib/web3Content";
import { focusRing, onTabKeyDown } from "./shared";

export default function UseCaseExplorer() {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const useCase = useCases[active];

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-14" data-testid="use-case-explorer">
      <div role="tablist" aria-label="Real-world application areas" aria-orientation="vertical" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-col lg:gap-0 lg:border-t lg:border-white/10">
        {useCases.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`usecase-tab-${item.id}`}
              aria-selected={selected}
              aria-controls="usecase-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(index)}
              onKeyDown={(event) => onTabKeyDown(event, index, useCases.length, setActive)}
              className={`group flex items-center justify-between gap-3 border p-3 text-left text-sm transition-colors lg:border-x-0 lg:border-t-0 lg:px-0 lg:py-5 lg:text-lg ${focusRing} ${
                selected ? "border-[#ff5500] text-zinc-100 lg:border-white/10" : "border-white/10 text-zinc-500 hover:text-zinc-300"
              }`}
              data-testid={`usecase-tab-${item.id}`}
            >
              <span className="flex items-baseline gap-4">
                <span className={`hidden font-mono text-xs lg:inline ${selected ? "text-[#ff5500]" : "text-zinc-700"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {item.name}
              </span>
              <ArrowRight className={`hidden h-4 w-4 shrink-0 transition-transform lg:block ${selected ? "translate-x-1 text-[#ff5500]" : "text-zinc-700"}`} />
            </button>
          );
        })}
      </div>

      <div id="usecase-panel" role="tabpanel" aria-labelledby={`usecase-tab-${useCase.id}`} data-testid="usecase-panel">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={useCase.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="border border-white/10 bg-[#111113] p-6 sm:p-10"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff5500]">Application area</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.045em] text-zinc-100 sm:text-4xl" data-testid="usecase-title">{useCase.name}</h3>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">{useCase.copy}</p>

            <p className="mt-10 text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">Typical workflow</p>
            <ol className="relative mt-5 grid gap-5 sm:grid-cols-4 sm:gap-3" data-testid="usecase-workflow">
              {/* The rail behind the stages: down on mobile, across from sm up. */}
              <span className="absolute bottom-3 left-[11px] top-3 w-px bg-[#ff5500]/40 sm:bottom-auto sm:left-3 sm:right-3 sm:top-[11px] sm:h-px sm:w-auto" aria-hidden="true" />
              {useCase.workflow.map((stage, index) => (
                <motion.li
                  key={stage}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: reducedMotion ? 0 : 0.08 * index + 0.1 }}
                  className="relative flex items-start gap-4 sm:flex-col sm:gap-3"
                >
                  <span className="relative flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-full border border-[#ff5500] bg-[#111113] font-mono text-[10px] text-[#ff5500]">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-snug text-zinc-300">{stage}</span>
                </motion.li>
              ))}
            </ol>

            <div className="mt-10 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2">
              <div className="bg-[#0d0d0f] p-5">
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">Example application · illustrative</p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-200" data-testid="usecase-example">{useCase.example}</p>
              </div>
              <div className="bg-[#0d0d0f] p-5">
                <p className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">
                  <Info className="h-3.5 w-3.5 text-[#ff5500]" aria-hidden="true" /> Keep in mind
                </p>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400" data-testid="usecase-caveat">{useCase.caveat}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
