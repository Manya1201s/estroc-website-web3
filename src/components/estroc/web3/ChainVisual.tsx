import { useEffect } from "react";
import type { MotionValue } from "motion/react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

/**
 * The hero: a blockchain application drawn as connected parts — ledger,
 * contracts, APIs, dashboard and the app people use — linked by fine orange
 * lines, with a new module being added. Layers drift at different depths with
 * the pointer and the scroll, so it reads as an object in space rather than a
 * diagram. It illustrates an architecture; it is not a live system.
 */

const W = 120;
const H = 84;

const blocks: { x: number; y: number; title: string; sub: string; txs: number }[] = [
  { x: 24, y: 352, title: "LEDGER", sub: "verified records", txs: 4 },
  { x: 118, y: 214, title: "SMART CONTRACT", sub: "business rules", txs: 6 },
  { x: 246, y: 300, title: "API LAYER", sub: "integrations", txs: 3 },
  { x: 318, y: 138, title: "DASHBOARD", sub: "admin & reports", txs: 5 },
  { x: 424, y: 262, title: "WEB APP", sub: "your users", txs: 7 },
];
const pending = { x: 432, y: 30 };

const centre = (b: { x: number; y: number }) => [b.x + W / 2, b.y + H / 2] as const;
const chainPath = blocks.map((b, i) => `${i ? "L" : "M"}${centre(b).join(" ")}`).join(" ");

/** Peers around the chain — the network that holds copies of it. */
const peers: [number, number][] = [
  [60, 120], [210, 60], [90, 470], [330, 470], [520, 410], [540, 180], [250, 190],
];

export default function ChainVisual({ scrollProgress }: { scrollProgress?: MotionValue<number> }) {
  const reducedMotion = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.6 });
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.6 });

  const fallback = useMotionValue(0);
  const progress = scrollProgress ?? fallback;

  // Three depths: grid at the back, chain in the middle, the forming block nearest.
  const backX = useTransform(sx, (v) => v * -6);
  const backY = useTransform(() => sy.get() * -6 + progress.get() * 30);
  const midX = useTransform(sx, (v) => v * 10);
  const midY = useTransform(() => sy.get() * 10 - progress.get() * 40);
  const nearX = useTransform(sx, (v) => v * 18);
  const nearY = useTransform(() => sy.get() * 18 - progress.get() * 90);

  useEffect(() => {
    if (reducedMotion || !matchMedia("(pointer: fine)").matches) return;
    const onMove = (event: PointerEvent) => {
      px.set((event.clientX / window.innerWidth) * 2 - 1);
      py.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion, px, py]);

  const layer = (x: MotionValue<number>, y: MotionValue<number>) => (reducedMotion ? undefined : { x, y });
  const draw = reducedMotion
    ? {}
    : { initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 1.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] as const } };

  return (
    <div className="relative mx-auto w-full max-w-[600px]" data-testid="chain-visual">
      <svg
        viewBox="0 0 580 520"
        className="h-auto w-full overflow-visible"
        role="img"
        aria-label="Illustration: a blockchain application as connected components — ledger, smart contract, API layer, dashboard and web app — with a new module being added"
      >
        <defs>
          <pattern id="w3-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
          <radialGradient id="w3-glow">
            <stop offset="0%" stopColor="#ff5500" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ff5500" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Back layer: dot field and the peer network. */}
        <motion.g style={layer(backX, backY)}>
          <rect x="-40" y="-40" width="660" height="600" fill="url(#w3-dots)" className="text-zinc-800" opacity="0.7" />
          {peers.map(([x, y], index) => {
            const [cx, cy] = centre(blocks[index % blocks.length]);
            return <line key={`p${index}`} x1={x} y1={y} x2={cx} y2={cy} stroke="currentColor" className="text-zinc-800" strokeWidth="1" strokeDasharray="2 5" />;
          })}
          {peers.map(([x, y], index) => (
            <circle key={`n${index}`} cx={x} cy={y} r="4" fill="none" stroke="currentColor" className="text-zinc-600" strokeWidth="1" />
          ))}
        </motion.g>

        {/* Middle layer: the committed chain. */}
        <motion.g style={layer(midX, midY)}>
          <circle cx={centre(blocks[4])[0]} cy={centre(blocks[4])[1]} r="130" fill="url(#w3-glow)" />

          <motion.path d={chainPath} fill="none" stroke="#ff5500" strokeWidth="1.2" strokeOpacity="0.85" {...draw} />
          {!reducedMotion && (
            <circle r="3.5" fill="#ff5500">
              <animateMotion dur="5.5s" repeatCount="indefinite" path={chainPath} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
            </circle>
          )}

          {blocks.map((block, index) => {
            const latest = index === blocks.length - 1;
            return (
              <motion.g
                key={block.title}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 + index * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <rect
                  x={block.x}
                  y={block.y}
                  width={W}
                  height={H}
                  rx="6"
                  className={`w3-block ${latest ? "" : "text-zinc-700"}`}
                  stroke={latest ? "#ff5500" : "currentColor"}
                  strokeWidth={latest ? 1.4 : 1}
                />
                <text x={block.x + 12} y={block.y + 22} className={`font-mono ${latest ? "text-zinc-100" : "text-zinc-400"}`} fill="currentColor" fontSize="10" letterSpacing="0.6">
                  {block.title}
                </text>
                <text x={block.x + 12} y={block.y + 40} className="font-mono text-zinc-600" fill="currentColor" fontSize="9" letterSpacing="0.3">
                  {block.sub}
                </text>
                {Array.from({ length: block.txs }, (_, tx) => (
                  <rect
                    key={tx}
                    x={block.x + 12 + tx * 13}
                    y={block.y + 58}
                    width="9"
                    height="12"
                    rx="1.5"
                    fill={latest && tx === block.txs - 1 ? "#ff5500" : "currentColor"}
                    className="text-zinc-700"
                  />
                ))}
              </motion.g>
            );
          })}
        </motion.g>

        {/* Near layer: the block still forming, joined by a dashed, unconfirmed link. */}
        <motion.g style={layer(nearX, nearY)}>
          <line
            x1={centre(blocks[4])[0]}
            y1={blocks[4].y}
            x2={pending.x + W / 2}
            y2={pending.y + H}
            stroke="#ff5500"
            strokeOpacity="0.55"
            strokeDasharray="3 5"
            className={reducedMotion ? undefined : "w3-dash"}
          />
          <rect x={pending.x} y={pending.y} width={W} height={H} rx="6" className="w3-block text-zinc-500" stroke="currentColor" strokeDasharray="4 4" />
          <text x={pending.x + 12} y={pending.y + 22} className="font-mono text-zinc-400" fill="currentColor" fontSize="11" letterSpacing="0.6">
            NEW MODULE
          </text>
          <text x={pending.x + 12} y={pending.y + 40} className="font-mono text-[#ff5500]" fill="currentColor" fontSize="9" letterSpacing="0.5">
            IN DEVELOPMENT…
          </text>
          {[0, 1, 2].map((tx) => (
            <rect
              key={tx}
              x={pending.x + 12 + tx * 13}
              y={pending.y + 58}
              width="9"
              height="12"
              rx="1.5"
              fill="currentColor"
              className={reducedMotion ? "text-zinc-600" : "w3-tx-pulse text-zinc-600"}
              style={{ animationDelay: `${tx * 0.4}s` }}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}
