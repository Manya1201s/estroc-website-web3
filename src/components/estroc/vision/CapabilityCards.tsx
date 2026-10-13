import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, Plus } from "lucide-react";
import { Rise } from "@/components/estroc/MaskReveal";
import { focusRing } from "@/components/estroc/web3/shared";
import { visionCapabilities } from "@/lib/visionContent";
import type { VisionCapability } from "@/lib/visionContent";
import { useScrollTo } from "@/lib/smoothScroll";

const O = "#ff5500";
const S = "currentColor";

/** Corner brackets — the page's detection-box motif at thumbnail scale. */
function Brackets({ x, y, w, h, color = O }: { x: number; y: number; w: number; h: number; color?: string }) {
  const c = Math.min(8, w / 3, h / 3);
  return (
    <path
      d={`M${x} ${y + c}V${y}H${x + c} M${x + w - c} ${y}H${x + w}V${y + c} M${x + w} ${y + h - c}V${y + h}H${x + w - c} M${x + c} ${y + h}H${x}V${y + h - c}`}
      fill="none"
      stroke={color}
      strokeWidth="1.8"
    />
  );
}

const visuals: Record<VisionCapability["id"], ReactNode> = {
  detection: (
    <>
      <rect x="34" y="40" width="44" height="38" className="cv-fill-3" stroke={S} />
      <circle cx="140" cy="62" r="20" className="cv-fill-3" stroke={S} />
      <Brackets x={28} y={34} w={56} h={50} />
      <Brackets x={114} y={36} w={52} h={52} />
      <path d="M20 100 C 60 96, 90 92, 120 92" fill="none" stroke={O} strokeDasharray="3 4" />
      {[20, 54, 88].map((x, i) => <circle key={x} cx={x} cy={100 - i * 3} r="2.5" fill={O} opacity={0.4 + i * 0.3} />)}
    </>
  ),
  inspection: (
    <>
      <path d="M50 30h100v26h-36v44h-28v-44h-36z" className="cv-fill-3" stroke={S} />
      <circle cx="68" cy="43" r="5" fill="none" stroke={S} />
      <Brackets x={120} y={32} w={24} h={22} />
      <rect x="120" y="32" width="24" height="22" fill="rgba(255,85,0,0.15)" />
      <path d="M126 38l12 10M138 38l-12 10" stroke={O} strokeWidth="1.5" />
    </>
  ),
  ocr: (
    <>
      <rect x="28" y="14" width="86" height="86" className="cv-paper" stroke={S} strokeOpacity="0.4" />
      {[30, 44, 58, 72, 86].map((y, i) => <rect key={y} x="38" y={y} width={i === 2 ? 52 : 66} height="4" fill={S} opacity="0.35" />)}
      <Brackets x={34} y={53} w={60} h={14} />
      <path d="M118 60h22" stroke={O} strokeWidth="1.4" />
      <path d="M134 55l6 5-6 5" fill="none" stroke={O} strokeWidth="1.4" />
      <rect x="146" y="40" width="40" height="40" fill="none" stroke={S} />
      <text x="156" y="65" fontSize="14" fontFamily="JetBrains Mono Variable, monospace" fill={O}>{"{ }"}</text>
    </>
  ),
  video: (
    <>
      <rect x="20" y="16" width="160" height="80" className="cv-fill-2" stroke={S} />
      <path d="M90 16v80M20 56h160" stroke={S} strokeWidth="0.6" opacity="0.6" />
      <path d="M20 40h160" stroke={O} strokeDasharray="5 4" strokeWidth="1.4" />
      <rect x="40" y="60" width="22" height="14" rx="3" className="cv-fill-3" stroke={S} />
      <rect x="112" y="26" width="22" height="14" rx="3" className="cv-fill-3" stroke={S} />
      <Brackets x={36} y={56} w={30} h={22} />
      {[16, 26, 20, 32].map((h, i) => <rect key={i} x={150 + i * 7} y={92 - h} width="5" height={h} fill={O} opacity={i === 3 ? 1 : 0.4} />)}
    </>
  ),
  recognition: (
    <>
      <rect x="18" y="32" width="46" height="46" className="cv-fill-3" stroke={S} />
      <circle cx="41" cy="55" r="12" fill="none" stroke={S} />
      <path d="M72 55h20" stroke={O} strokeWidth="1.4" />
      <path d="M86 50l6 5-6 5" fill="none" stroke={O} strokeWidth="1.4" />
      {[100, 134, 168].map((x, i) => (
        <g key={x}>
          <rect x={x} y="38" width="28" height="34" className="cv-fill-3" stroke={S} />
          <circle cx={x + 14} cy="55" r={i === 1 ? 8 : 6} fill="none" stroke={i === 1 ? O : S} />
        </g>
      ))}
      <Brackets x={130} y={34} w={36} h={42} />
    </>
  ),
  custom: (
    <>
      {[["CAM", 20], ["MODEL", 80], ["ALERT", 140]].map(([label, x]) => (
        <g key={label}>
          <rect x={x as number} y="38" width="44" height="32" className="cv-fill-3" stroke={label === "MODEL" ? O : S} />
          <text x={(x as number) + 22} y="58" textAnchor="middle" fontSize="7.5" fontFamily="JetBrains Mono Variable, monospace" fill={S}>{label}</text>
        </g>
      ))}
      <path d="M64 54h16M124 54h16" stroke={O} strokeWidth="1.4" />
      <path d="M102 70v20h60v-20" fill="none" stroke={S} strokeDasharray="2 3" opacity="0.6" />
      <text x="104" y="100" fontSize="7" fontFamily="JetBrains Mono Variable, monospace" fill={S} opacity="0.7">RULES</text>
    </>
  ),
};

export default function CapabilityCards() {
  const [open, setOpen] = useState<string | null>(null);
  const scrollToId = useScrollTo();

  return (
    <div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3" data-testid="vision-capability-cards">
      {visionCapabilities.map((capability, index) => {
        const expanded = open === capability.id;
        return (
          <div key={capability.id} className="group relative flex flex-col bg-[#0a0a0b]" data-testid={`vision-cap-${capability.id}`}>
            <span className="absolute inset-x-0 top-0 z-10 h-px origin-left scale-x-0 bg-[#ff5500] transition-transform duration-500 group-hover:scale-x-100 group-focus-within:scale-x-100" aria-hidden="true" />
            <Rise delay={(index % 3) * 0.06} className="flex flex-1 flex-col">
              <div className="relative border-b border-white/10 bg-[#0d0d0f] px-6 py-5 text-zinc-600">
                <svg viewBox="0 0 200 110" className="mx-auto h-28 w-full max-w-[240px] transition-transform duration-500 group-hover:scale-[1.04]" aria-hidden="true">
                  {visuals[capability.id]}
                </svg>
                <span className="absolute left-4 top-4 font-mono text-[10px] text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-xl font-semibold leading-tight tracking-[-0.03em] text-zinc-100" data-testid={`vision-cap-${capability.id}-title`}>{capability.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-500">{capability.copy}</p>

                <div className="mt-auto pt-5">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : capability.id)}
                    aria-expanded={expanded}
                    aria-controls={`vision-cap-${capability.id}-example`}
                    className={`flex w-full items-center justify-between border-t border-white/10 pt-4 text-left text-sm font-medium text-zinc-200 transition-colors hover:text-[#ff5500] ${focusRing}`}
                    data-testid={`vision-cap-${capability.id}-toggle`}
                  >
                    Explore Example
                    <Plus className={`h-4 w-4 text-[#ff5500] transition-transform duration-300 ${expanded ? "rotate-45" : ""}`} />
                  </button>
                  <div
                    id={`vision-cap-${capability.id}-example`}
                    className={`grid transition-[grid-template-rows] duration-500 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    inert={!expanded}
                  >
                    <div className="overflow-hidden">
                      <p className="pt-3 text-sm leading-relaxed text-zinc-300" data-testid={`vision-cap-${capability.id}-example-text`}>{capability.example}</p>
                      <button
                        type="button"
                        onClick={() => scrollToId(capability.related.target)}
                        className={`mt-3 inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.16em] text-[#ff5500] hover:underline ${focusRing}`}
                        data-testid={`vision-cap-${capability.id}-related`}
                      >
                        {capability.related.label}
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Rise>
          </div>
        );
      })}
    </div>
  );
}
