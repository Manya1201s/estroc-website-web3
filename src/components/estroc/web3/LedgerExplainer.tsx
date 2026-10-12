import { useState } from "react";
import type { CSSProperties } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { consensusModels, ledgerSteps } from "@/lib/web3Content";
import { DemoBadge, focusRing, onTabKeyDown } from "./shared";

/**
 * One illustration that changes state, rather than four separate pictures: the
 * same transaction is signed, checked by peers, packed into a block, and that
 * block joins the chain. Moves are CSS transitions in viewBox units, which the
 * site-wide reduced-motion rule already collapses to an instant change.
 */

const ease = "cubic-bezier(0.16, 1, 0.3, 1)";
const move = (ms = 700): CSSProperties => ({ transition: `transform ${ms}ms ${ease}, opacity ${ms}ms ${ease}` });

const nodes: [number, number][] = [[72, 44], [56, 132], [150, 176], [488, 44], [504, 132], [410, 176]];
const chain = [24, 132, 240];
const CHAIN_Y = 238;
const CARD = { w: 84, h: 32 };
const slots: [number, number][] = [[192, 56], [284, 56], [192, 100], [284, 100]];

function LedgerStage({ step }: { step: number }) {
  const validated = step >= 1;
  const grouped = step >= 2;
  const committed = step >= 3;

  // The transaction sits centred until it is grouped, then takes the first slot.
  const [txX, txY] = grouped ? slots[0] : [238, 74];
  // Committing shrinks the block frame (centre 280,85) onto the next chain slot.
  const blockTransform = committed ? "translate(110px, 176px) scale(0.42)" : "translate(0px, 0px) scale(1)";

  return (
    <svg viewBox="0 0 560 300" className="h-auto w-full" role="img" aria-label={`Illustration of step ${step + 1}: ${ledgerSteps[step].title}`}>
      {/* Existing chain */}
      <g>
        {chain.map((x, index) => (
          <g key={x}>
            <rect x={x} y={CHAIN_Y} width="84" height="46" rx="4" className="w3-block text-zinc-700" stroke="currentColor" />
            <text x={x + 9} y={CHAIN_Y + 19} className="font-mono text-zinc-500" fill="currentColor" fontSize="9">#{18202 + index}</text>
            <rect x={x + 9} y={CHAIN_Y + 28} width="40" height="5" rx="1" className="text-zinc-800" fill="currentColor" />
          </g>
        ))}
        {chain.slice(1).map((x) => (
          <line key={`l${x}`} x1={x - 24} y1={CHAIN_Y + 23} x2={x} y2={CHAIN_Y + 23} stroke="#ff5500" strokeWidth="1.2" />
        ))}
        <line
          x1="324" y1={CHAIN_Y + 23} x2="348" y2={CHAIN_Y + 23}
          stroke="#ff5500" strokeWidth="1.2" pathLength={1} strokeDasharray="1"
          style={{ strokeDashoffset: committed ? 0 : 1, transition: `stroke-dashoffset 500ms ${ease} 450ms` }}
        />
        <rect x="348" y={CHAIN_Y} width="84" height="46" rx="4" fill="none" stroke="currentColor" strokeDasharray="3 4" className="text-zinc-800" style={{ opacity: committed ? 0 : 1, transition: "opacity 300ms" }} />
        <text x="20" y="296" className="font-mono text-zinc-600" fill="currentColor" fontSize="9" letterSpacing="1">LEDGER</text>
      </g>

      {/* Validating peers */}
      <g style={{ opacity: grouped ? 0.25 : 1, ...move(500) }}>
        {nodes.map(([x, y], index) => (
          <g key={index}>
            <line
              x1="280" y1="90" x2={x} y2={y}
              stroke={validated ? "#ff5500" : "currentColor"}
              strokeOpacity={validated ? 0.6 : 1}
              className="text-zinc-800"
              strokeDasharray="3 4"
              style={{ opacity: validated && !grouped ? 1 : 0.35, transition: `opacity 500ms ${ease} ${index * 60}ms` }}
            />
            <circle cx={x} cy={y} r="13" className="w3-block text-zinc-700" stroke={validated ? "#ff5500" : "currentColor"} strokeWidth="1.2" style={{ transition: "stroke 400ms" }} />
            <path
              d={`M${x - 5} ${y} l3.5 3.5 l6.5 -7`}
              fill="none" stroke="#ff5500" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              style={{ opacity: validated ? 1 : 0, transition: `opacity 300ms ${ease} ${200 + index * 80}ms` }}
            />
          </g>
        ))}
      </g>

      {/* The block: frame, the pooled transactions, and ours */}
      <g style={{ transform: blockTransform, transformOrigin: "280px 85px", ...move(800) }}>
        <rect
          x="180" y="30" width="200" height="110" rx="6"
          className="w3-block text-zinc-600"
          stroke={committed ? "#ff5500" : "currentColor"}
          strokeWidth={committed ? 2.4 : 1}
          style={{ opacity: grouped ? 1 : 0, ...move(500) }}
        />
        <text x="192" y="47" className="font-mono text-zinc-400" fill="currentColor" fontSize="10" letterSpacing="0.8" style={{ opacity: grouped ? 1 : 0, ...move(500) }}>
          BLOCK #18205
        </text>
        {slots.slice(1).map(([x, y], index) => (
          <g key={index} style={{ opacity: grouped ? 1 : 0, transition: `opacity 400ms ${ease} ${250 + index * 90}ms` }}>
            <rect x={x} y={y} width={CARD.w} height={CARD.h} rx="3" fill="none" stroke="currentColor" className="text-zinc-700" />
            <text x={x + 8} y={y + 20} className="font-mono text-zinc-500" fill="currentColor" fontSize="9">TX 0x{["8c2", "1fa", "d40"][index]}…</text>
          </g>
        ))}
        <g style={{ transform: `translate(${txX - 238}px, ${txY - 74}px)`, ...move() }}>
          <rect x="238" y="74" width={CARD.w} height={CARD.h} rx="3" className="w3-block" stroke="#ff5500" strokeWidth="1.2" />
          <text x="246" y="94" className="font-mono text-zinc-100" fill="currentColor" fontSize="9">TX 0x3f7…</text>
        </g>
      </g>

      {/* Step 1 annotation: who signed it */}
      <text
        x="280" y="128" textAnchor="middle" className="font-mono text-zinc-500" fill="currentColor" fontSize="9" letterSpacing="0.5"
        style={{ opacity: step === 0 ? 1 : 0, ...move(300) }}
      >
        signed by 0xA1C3…demo · 0.25 units
      </text>
    </svg>
  );
}

export default function LedgerExplainer() {
  const [step, setStep] = useState(0);
  const reducedMotion = useReducedMotion();
  const current = ledgerSteps[step];
  const last = ledgerSteps.length - 1;

  return (
    <div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16" data-testid="ledger-explainer">
      <div>
        <div role="tablist" aria-label="Blockchain transaction steps" aria-orientation="vertical" className="border-t border-white/10">
          {ledgerSteps.map((item, index) => {
            const selected = index === step;
            return (
              <button
                key={item.title}
                type="button"
                role="tab"
                id={`ledger-tab-${index}`}
                aria-selected={selected}
                aria-controls="ledger-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setStep(index)}
                onKeyDown={(event) => onTabKeyDown(event, index, ledgerSteps.length, setStep)}
                className={`group flex w-full items-center gap-5 border-b border-white/10 py-5 text-left transition-colors ${focusRing} ${
                  selected ? "text-zinc-100" : "text-zinc-500 hover:text-zinc-300"
                }`}
                data-testid={`ledger-step-${index + 1}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-mono transition-colors ${
                  index < step ? "border-[#ff5500] bg-[#ff5500] text-[#0a0a0b]" : selected ? "border-[#ff5500] text-[#ff5500]" : "border-white/15 text-zinc-600"
                }`}>
                  {index < step ? <Check className="h-3.5 w-3.5" /> : String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-lg font-medium tracking-tight sm:text-xl">{item.title}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-[#ff5500] disabled:pointer-events-none disabled:opacity-30 ${focusRing}`}
            aria-label="Previous step"
            data-testid="ledger-prev-button"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setStep((s) => Math.min(last, s + 1))}
            disabled={step === last}
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition-colors hover:border-[#ff5500] hover:text-[#ff5500] disabled:pointer-events-none disabled:opacity-30 ${focusRing}`}
            aria-label="Next step"
            data-testid="ledger-next-button"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="ml-2 flex-1">
            <div className="h-px w-full bg-white/10" role="progressbar" aria-label="Step progress" aria-valuemin={1} aria-valuemax={ledgerSteps.length} aria-valuenow={step + 1}>
              <div className="h-px origin-left bg-[#ff5500] transition-transform duration-500" style={{ transform: `scaleX(${(step + 1) / ledgerSteps.length})` }} />
            </div>
            <p className="mt-3 text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500" data-testid="ledger-progress-label">
              Step {String(step + 1).padStart(2, "0")} / {String(ledgerSteps.length).padStart(2, "0")} · {current.short}
            </p>
          </div>
        </div>
      </div>

      <div
        id="ledger-panel"
        role="tabpanel"
        aria-labelledby={`ledger-tab-${step}`}
        className="border border-white/10 bg-[#111113] p-5 sm:p-8"
        data-testid="ledger-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">Simplified model</p>
          <DemoBadge label="Illustrative values" />
        </div>
        <div className="mt-6">
          <LedgerStage step={step} />
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="mt-6 border-t border-white/10 pt-6"
            aria-live="polite"
          >
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-zinc-100 sm:text-3xl">{current.title}</h3>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-zinc-400">{current.copy}</p>
            <p className="mt-4 flex max-w-xl gap-3 text-sm leading-relaxed text-zinc-500">
              <span className="mt-2.5 h-px w-5 shrink-0 bg-[#ff5500]" aria-hidden="true" />
              {current.detail}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="lg:col-span-2" data-testid="consensus-note">
        <div className="grid gap-px border border-white/10 bg-white/10 md:grid-cols-[1.1fr_repeat(3,1fr)]">
          <div className="bg-[#0a0a0b] p-6">
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff5500]">Not one design</p>
            <p className="mt-3 text-lg font-medium leading-snug tracking-tight text-zinc-100">
              Blockchains differ in who validates and how they agree.
            </p>
          </div>
          {consensusModels.map(([name, copy]) => (
            <div key={name} className="bg-[#0a0a0b] p-6">
              <p className="text-sm font-medium text-zinc-200">{name}</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
