import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RotateCcw, ScanLine } from "lucide-react";
import { demoAssets } from "@/lib/web3Content";
import { DemoBadge, focusRing, onTabKeyDown } from "./shared";

/**
 * A sample asset per category, drawn rather than photographed so it costs no
 * requests. Flipping the card shows the kind of record a token carries.
 * Everything on it is invented: no wallet is read, nothing is verified.
 */

const art: Record<string, ReactNode> = {
  art: (
    <>
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx="150" cy="150" r={18 + i * 14} fill="none" stroke={i === 5 ? "#ff5500" : "currentColor"} strokeWidth={i === 5 ? 2 : 1} strokeDasharray={i % 2 ? "2 6" : undefined} className="text-zinc-700" />
      ))}
      <circle cx="150" cy="150" r="6" fill="#ff5500" />
      <line x1="40" y1="260" x2="260" y2="40" stroke="#ff5500" strokeOpacity="0.5" />
    </>
  ),
  game: (
    <>
      <path d="M150 34 L176 150 L150 236 L124 150 Z" fill="none" stroke="#ff5500" strokeWidth="1.6" />
      <path d="M150 60 L150 214" stroke="currentColor" className="text-zinc-600" />
      <path d="M98 236 H202 M150 236 V270" stroke="currentColor" strokeWidth="2" className="text-zinc-500" />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={70 + i * 34} y="282" width="24" height="4" fill={i < 4 ? "#ff5500" : "currentColor"} className="text-zinc-700" />)}
    </>
  ),
  pass: (
    <>
      <rect x="54" y="80" width="192" height="122" rx="10" fill="none" stroke="currentColor" className="text-zinc-600" />
      <circle cx="104" cy="140" r="26" fill="none" stroke="#ff5500" strokeWidth="1.6" />
      <circle cx="104" cy="140" r="12" fill="none" stroke="#ff5500" strokeOpacity="0.5" />
      <path d="M146 124 H220 M146 140 H200 M146 156 H210" stroke="currentColor" className="text-zinc-700" />
      <text x="70" y="226" className="font-mono text-zinc-500" fill="currentColor" fontSize="10" letterSpacing="2">MEMBER · ANNUAL</text>
    </>
  ),
  ticket: (
    <>
      <path d="M50 96 H250 V132 a14 14 0 0 0 0 28 V196 H50 V160 a14 14 0 0 0 0 -28 Z" fill="none" stroke="currentColor" className="text-zinc-600" />
      <line x1="190" y1="100" x2="190" y2="192" stroke="#ff5500" strokeDasharray="3 4" />
      <text x="70" y="136" className="font-mono text-zinc-300" fill="currentColor" fontSize="14" letterSpacing="1">BUILD SUMMIT</text>
      <text x="70" y="160" className="font-mono text-zinc-500" fill="currentColor" fontSize="10" letterSpacing="1">DAY 2 · HALL B</text>
      <text x="202" y="152" className="font-mono text-[#ff5500]" fill="currentColor" fontSize="12">2290</text>
    </>
  ),
  certificate: (
    <>
      <rect x="64" y="50" width="172" height="210" rx="4" fill="none" stroke="currentColor" className="text-zinc-600" />
      <path d="M88 86 H212 M88 106 H190 M88 126 H200" stroke="currentColor" className="text-zinc-700" />
      <circle cx="150" cy="196" r="32" fill="none" stroke="#ff5500" strokeWidth="1.6" />
      <circle cx="150" cy="196" r="24" fill="none" stroke="#ff5500" strokeDasharray="2 4" />
      <path d="M138 196 l8 8 l16 -18" fill="none" stroke="#ff5500" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
};

export default function AssetShowcase() {
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const asset = demoAssets[active];

  // The face being turned away becomes inert, so keyboard focus follows the
  // flip to the control on the face that is now showing.
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const focusAfterFlip = useRef(false);

  useEffect(() => {
    if (!focusAfterFlip.current) return;
    focusAfterFlip.current = false;
    (flipped ? backButton : frontButton).current?.focus({ preventScroll: true });
  }, [flipped]);

  const flip = (next: boolean) => {
    focusAfterFlip.current = true;
    setFlipped(next);
  };

  const select = (index: number) => {
    setActive(index);
    setFlipped(false);
  };

  const face = "absolute inset-0 flex flex-col border bg-[#111113] p-6 sm:p-8 [backface-visibility:hidden]";

  return (
    <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16" data-testid="asset-showcase">
      <div>
        <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:-mx-8 sm:px-8 lg:mx-0 lg:overflow-visible lg:px-0">
          <div role="tablist" aria-label="Sample digital assets" aria-orientation="vertical" className="flex min-w-max gap-2 lg:min-w-0 lg:flex-col lg:gap-0 lg:border-t lg:border-white/10">
            {demoAssets.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`asset-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls="asset-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(index)}
                  onKeyDown={(event) => onTabKeyDown(event, index, demoAssets.length, select)}
                  className={`flex items-center gap-4 whitespace-nowrap border px-4 py-3 text-left text-sm transition-colors lg:border-x-0 lg:border-t-0 lg:px-0 lg:py-5 lg:text-lg ${focusRing} ${
                    selected ? "border-[#ff5500] text-zinc-100 lg:border-white/10" : "border-white/10 text-zinc-500 hover:text-zinc-300"
                  }`}
                  data-testid={`asset-tab-${item.id}`}
                >
                  <span className={`hidden font-mono text-xs lg:inline ${selected ? "text-[#ff5500]" : "text-zinc-700"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {item.category}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-8 hidden max-w-xs text-sm leading-relaxed text-zinc-500 lg:block">
          Select an asset, then flip it to see the record a token typically carries — its standard, ID, attributes and transfer history.
        </p>
      </div>

      <div id="asset-panel" role="tabpanel" aria-labelledby={`asset-tab-${asset.id}`} className="[perspective:1600px]" data-testid="asset-panel">
        <div
          className="relative h-[620px] transition-transform duration-700 [transform-style:preserve-3d] sm:h-[540px]"
          style={{ transform: flipped ? "rotateY(180deg)" : "none", transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        >
          {/* Front: the asset as people would see it. */}
          <div className={`${face} border-white/10`} inert={flipped} aria-hidden={flipped}>
            <div className="flex items-start justify-between gap-4">
              <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">{asset.category}</p>
              <DemoBadge />
            </div>

            <div className="relative my-4 flex flex-1 items-center justify-center overflow-hidden">
              <div className="absolute h-48 w-48 rounded-full bg-[#ff5500]/[0.07] blur-3xl" aria-hidden="true" />
              <svg viewBox="0 0 300 300" className="relative h-full max-h-[300px] w-auto" role="img" aria-label={`Artwork for ${asset.name}`}>
                {art[asset.id]}
              </svg>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-5">
              <div>
                <h3 className="text-2xl font-semibold tracking-[-0.04em] text-zinc-100 sm:text-3xl" data-testid="asset-name">{asset.name}</h3>
                <p className="mt-1 font-mono text-xs text-zinc-500">{asset.standard} · Token {asset.tokenId}</p>
              </div>
              <button
                ref={frontButton}
                type="button"
                onClick={() => flip(true)}
                className={`inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-sm text-zinc-100 transition-colors hover:border-[#ff5500] hover:text-[#ff5500] ${focusRing}`}
                data-testid="asset-flip-button"
              >
                <ScanLine className="h-4 w-4" />
                View token record
              </button>
            </div>
          </div>

          {/* Back: the record. */}
          <div
            className={`${face} border-[#ff5500]/40`}
            style={{ transform: "rotateY(180deg)" }}
            inert={!flipped}
            aria-hidden={!flipped}
            data-testid="asset-record"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff5500]">Token record</p>
                <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-zinc-100 sm:text-2xl">{asset.name}</h3>
              </div>
              <DemoBadge />
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-white/10 py-5 sm:grid-cols-3">
              {([["Token ID", asset.tokenId], ["Standard", asset.standard], ["Contract", asset.contract], ...asset.attributes] as [string, string][]).map(([term, value]) => (
                <div key={term}>
                  <dt className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-600">{term}</dt>
                  <dd className="mt-1 break-words font-mono text-xs text-zinc-200 sm:text-sm">{value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500">Illustrative ownership history</p>
            <ol className="mt-3 space-y-2.5">
              {asset.history.map(([event, party, date], index) => (
                <li key={`${event}-${date}`} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 font-mono text-xs">
                  <span className={`h-2 w-2 rounded-full ${index === asset.history.length - 1 ? "bg-[#ff5500]" : "border border-zinc-600"}`} aria-hidden="true" />
                  <span className="text-zinc-300">{event} <span className="text-zinc-600">→</span> {party}</span>
                  <span className="text-zinc-600">{date}</span>
                </li>
              ))}
            </ol>

            <p className="mt-auto border-l border-[#ff5500]/50 pl-3 pt-1 text-xs leading-relaxed text-zinc-500">
              {asset.note} Sample data only — no wallet is connected and nothing on this card is verified on any blockchain.
            </p>

            <button
              ref={backButton}
              type="button"
              onClick={() => flip(false)}
              className={`mt-5 inline-flex items-center gap-2 self-start text-sm text-zinc-300 transition-colors hover:text-[#ff5500] ${focusRing}`}
              data-testid="asset-flip-back-button"
            >
              <RotateCcw className="h-4 w-4" />
              Back to asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
