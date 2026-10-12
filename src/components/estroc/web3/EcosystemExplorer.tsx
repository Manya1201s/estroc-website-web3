import { useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ecosystem } from "@/lib/web3Content";
import type { EcosystemId } from "@/lib/web3Content";
import { focusRing, onTabKeyDown } from "./shared";

/** Shared stroke vocab for the glyphs: muted structure, one orange idea each. */
const muted = { stroke: "currentColor", className: "text-zinc-600", fill: "none", strokeWidth: 1.2 } as const;
const accent = { stroke: "#ff5500", fill: "none", strokeWidth: 1.4 } as const;
const label = { className: "font-mono text-zinc-500", fill: "currentColor", fontSize: 10, letterSpacing: 0.8 } as const;

const glyphs: Record<EcosystemId, ReactNode> = {
  // Two parties, one direct line, and the chain that settles it.
  bitcoin: (
    <>
      <circle cx="40" cy="60" r="18" {...muted} />
      <circle cx="200" cy="60" r="18" {...muted} />
      <text x="35" y="64" {...label}>A</text>
      <text x="195" y="64" {...label}>B</text>
      <line x1="58" y1="60" x2="182" y2="60" {...accent} />
      <path d="M170 54 l12 6 l-12 6" {...accent} />
      {[44, 92, 140].map((x) => <rect key={x} x={x} y="112" width="40" height="26" rx="3" {...muted} />)}
      <line x1="84" y1="125" x2="92" y2="125" {...accent} />
      <line x1="132" y1="125" x2="140" y2="125" {...accent} />
      <line x1="120" y1="68" x2="120" y2="108" {...muted} strokeDasharray="3 4" />
    </>
  ),
  // A shared machine with programs deployed onto it, and layer-2s beside it.
  ethereum: (
    <>
      <rect x="40" y="104" width="160" height="38" rx="3" {...accent} />
      <text x="104" y="127" {...label}>EVM</text>
      {[48, 100, 152].map((x, i) => (
        <g key={x}>
          <rect x={x} y="48" width="40" height="30" rx="3" {...muted} />
          <text x={x + 8} y="67" {...label} fontSize={8}>{["ERC20", "DEX", "NFT"][i]}</text>
          <line x1={x + 20} y1="78" x2={x + 20} y2="104" {...muted} />
        </g>
      ))}
      <rect x="208" y="70" width="26" height="20" rx="2" {...muted} strokeDasharray="3 3" />
      <rect x="208" y="98" width="26" height="20" rx="2" {...muted} strokeDasharray="3 3" />
      <text x="206" y="62" {...label} fontSize={8}>L2</text>
    </>
  ),
  // One line wanders, one holds its peg — and the peg is only a target.
  stablecoins: (
    <>
      <line x1="20" y1="140" x2="230" y2="140" {...muted} />
      <line x1="20" y1="20" x2="20" y2="140" {...muted} />
      <polyline points="20,100 45,70 65,92 90,40 115,85 140,55 160,110 185,62 210,90 230,48" {...muted} className="text-zinc-500" />
      <line x1="20" y1="80" x2="230" y2="80" {...accent} />
      <path d="M150 80 q4 6 8 0" {...accent} />
      <text x="168" y="74" {...label} className="font-mono text-[#ff5500]">PEG 1.00</text>
    </>
  ),
  // Two assets meet in a pool and trade against it.
  defi: (
    <>
      <circle cx="120" cy="80" r="44" {...accent} />
      <text x="96" y="84" {...label}>POOL</text>
      <circle cx="34" cy="50" r="16" {...muted} />
      <circle cx="206" cy="110" r="16" {...muted} />
      <text x="28" y="54" {...label}>A</text>
      <text x="200" y="114" {...label}>B</text>
      <path d="M50 50 Q70 40 84 56" {...muted} />
      <path d="M156 104 Q176 120 190 110" {...muted} />
      <path d="M150 100 Q140 140 100 132" {...accent} strokeDasharray="3 4" />
    </>
  ),
  // A grid of tokens, one of which is this one.
  nfts: (
    <>
      {[0, 1, 2].flatMap((row) =>
        [0, 1, 2, 3].map((col) => {
          const on = row === 1 && col === 2;
          return <rect key={`${row}${col}`} x={40 + col * 42} y={14 + row * 44} width="34" height="36" rx="3" {...(on ? accent : muted)} />;
        }),
      )}
      <circle cx="141" cy="76" r="7" {...accent} />
      <text x="128" y="152" {...label} className="font-mono text-[#ff5500]">#0007</text>
    </>
  ),
  // If the condition holds, the contract acts; if not, nothing moves.
  "smart-contracts": (
    <>
      <path d="M60 30 L96 66 L60 102 L24 66 Z" {...accent} />
      <text x="50" y="70" {...label}>IF</text>
      <line x1="96" y1="66" x2="140" y2="66" {...accent} />
      <rect x="140" y="48" width="84" height="36" rx="3" {...accent} />
      <text x="150" y="70" {...label}>RELEASE</text>
      <line x1="60" y1="102" x2="60" y2="128" {...muted} />
      <rect x="22" y="128" width="76" height="26" rx="3" {...muted} />
      <text x="34" y="145" {...label}>HOLD</text>
    </>
  ),
  // One asset, divided into units that can each be held and moved.
  tokenization: (
    <>
      <rect x="20" y="40" width="70" height="80" rx="3" {...muted} />
      <path d="M20 66 H90 M20 92 H90 M55 40 V120" {...muted} strokeDasharray="2 3" />
      <line x1="96" y1="80" x2="124" y2="80" {...accent} />
      <path d="M116 74 l8 6 l-8 6" {...accent} />
      {[0, 1].flatMap((row) =>
        [0, 1, 2].map((col) => (
          <rect key={`${row}${col}`} x={134 + col * 32} y={52 + row * 32} width="24" height="24" rx="3" {...(row === 0 && col === 0 ? accent : muted)} />
        )),
      )}
    </>
  ),
};

export default function EcosystemExplorer() {
  const [active, setActive] = useState(0);
  const reducedMotion = useReducedMotion();
  const entry = ecosystem[active];

  return (
    <div className="mt-12" data-testid="ecosystem-explorer">
      {/* Scrolls sideways on narrow screens; the feathered edge says there is more. */}
      <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
        <div role="tablist" aria-label="Blockchain ecosystem topics" className="flex min-w-max gap-2 border-b border-white/10 lg:min-w-0 lg:flex-wrap">
          {ecosystem.map((item, index) => {
            const selected = index === active;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`eco-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="eco-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onTabKeyDown(event, index, ecosystem.length, setActive)}
                className={`relative -mb-px whitespace-nowrap border-b px-4 py-4 text-sm font-mono uppercase tracking-[0.12em] transition-colors ${focusRing} ${
                  selected ? "border-[#ff5500] text-zinc-100" : "border-transparent text-zinc-500 hover:text-zinc-300"
                }`}
                data-testid={`eco-tab-${item.id}`}
              >
                {item.tab}
              </button>
            );
          })}
        </div>
      </div>

      <div id="eco-panel" role="tabpanel" aria-labelledby={`eco-tab-${entry.id}`} className="mt-10" data-testid="eco-panel">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={entry.id}
            initial={reducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16"
          >
            <div>
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff5500]">{entry.kicker}</p>
              <h3 className="mt-3 max-w-xl text-3xl font-semibold tracking-[-0.045em] text-zinc-100 sm:text-5xl" data-testid="eco-title">
                {entry.title}
              </h3>
              {entry.copy.map((paragraph) => (
                <p key={paragraph} className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">{paragraph}</p>
              ))}

              <dl className="mt-8 grid max-w-xl grid-cols-3 border-y border-white/10">
                {entry.facts.map(([term, value]) => (
                  <div key={term} className="border-r border-white/10 py-4 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
                    <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-600">{term}</dt>
                    <dd className="mt-1.5 text-sm text-zinc-200">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col gap-6">
              <div className="border border-white/10 bg-[#111113] p-6">
                <svg viewBox="0 0 240 160" className="h-auto w-full" role="img" aria-label={`Diagram: ${entry.title}`}>
                  {glyphs[entry.id]}
                </svg>
              </div>

              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">Practical use cases</p>
                <ul className="mt-4 space-y-3">
                  {entry.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-3 border-b border-white/[0.07] pb-3 text-sm text-zinc-300">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#ff5500]" />
                      {useCase}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="flex gap-3 border-l border-[#ff5500]/50 pl-4 text-sm leading-relaxed text-zinc-500" data-testid="eco-caveat">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#ff5500]/80" aria-hidden="true" />
                <span><span className="text-zinc-300">Worth knowing — </span>{entry.caveat}</span>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
