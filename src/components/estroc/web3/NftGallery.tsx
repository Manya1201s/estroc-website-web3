import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, PointerEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { useLenis } from "@/lib/smoothScroll";
import { focusRing } from "./shared";

/**
 * The NFT Platform concept as a floating gallery: the six sample items hang at
 * different depths inside one CSS perspective, drift on CSS keyframes (no JS
 * loop), tilt toward the pointer, and open an enlarged preview on click.
 *
 * The depth is CSS 3D transforms on flat artwork — not modelled geometry.
 * Item types come from the asset kinds the NFT service lists (memberships,
 * passes, collectibles, certificates); numbers and the owner are demo
 * placeholders, and nothing here is a real token or marketplace action.
 */

export const nftItems = ["Access Pass", "Founders Pass", "Event Ticket", "Certificate", "Collectible", "Member Badge"].map((name, i) => ({
  name,
  number: `#${String(11 + i).padStart(4, "0")}`,
}));

/** Orange, violet and cyan, as RGB channels for the per-card aura. */
const TINTS = ["255 85 0", "150 110 255", "80 200 255"];

/**
 * Where each card hangs on the desktop stage:
 * left %, top %, width %, rotation°, depth (translateZ px), float period s, delay s, rise px.
 * Item #0012 (the original highlighted "Founders Pass") is the centrepiece.
 */
const PLACES: [number, number, number, number, number, number, number, number][] = [
  [3, 8, 21, -7, -70, 6.4, -1.2, 7],
  [36, 5, 28, -1.5, 30, 7.2, -3.1, 9],
  [76, 6, 21, 6, -50, 5.8, -0.4, 6],
  [13, 54, 19, 5, -20, 6.9, -2.2, 8],
  [68, 52, 19, -5, -10, 6.1, -4.0, 7],
  [41.5, 63, 17, 3, -90, 7.8, -1.7, 5],
];

const MAX_TILT = 12; // degrees, either axis — enough for depth, never unreadable

/** The original ring artwork, given a soft tinted aura, a holographic sweep and a glare layer. */
function Art({ i, large = false }: { i: number; large?: boolean }) {
  return (
    <span className="nftg-art" style={{ "--tint": TINTS[i % 3] } as CSSProperties}>
      <span className="nftg-ring" style={{ inset: `${18 + (i % 3) * 6}%`, opacity: (large ? 0.65 : 0.5) + (i % 2) * 0.35 }} />
      {i === 1 && <span className="nftg-core" />}
      <span className="nftg-holo" />
      <span className="nftg-glare" />
    </span>
  );
}

/** Pointer tilt, relative to the element's own bounds, written to CSS variables (no re-render). */
function tiltTo(event: PointerEvent<HTMLElement>) {
  if (event.pointerType === "touch") return;
  const el = event.currentTarget;
  const r = el.getBoundingClientRect();
  const x = Math.min(1, Math.max(0, (event.clientX - r.left) / r.width));
  const y = Math.min(1, Math.max(0, (event.clientY - r.top) / r.height));
  el.style.setProperty("--ry", `${((x - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
  el.style.setProperty("--rx", `${(-(y - 0.5) * 2 * MAX_TILT).toFixed(2)}deg`);
  el.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
  el.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  el.classList.add("is-tilting");
}

function untilt(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  for (const name of ["--rx", "--ry", "--gx", "--gy"]) el.style.removeProperty(name);
  el.classList.remove("is-tilting");
}

export default function NftGallery({ onDiscuss, summary }: { onDiscuss: () => void; summary: string }) {
  const reducedMotion = !!useReducedMotion();
  const lenis = useLenis();
  const [open, setOpen] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const lockedRef = useRef<string | null>(null);

  // Entrance: the cards rise in once, the first time the gallery is on screen.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /** Page scroll lock for the preview; Lenis owns scrolling, so it is paused too. */
  const unlock = useCallback(() => {
    if (lockedRef.current === null) return;
    document.documentElement.style.overflow = lockedRef.current;
    lockedRef.current = null;
    lenis?.start();
  }, [lenis]);

  const isOpen = open !== null;
  useEffect(() => {
    if (!isOpen) return;
    lockedRef.current = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    closeRef.current?.focus({ preventScroll: true });
    return unlock;
  }, [isOpen, lenis, unlock]);

  const show = (i: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setOpen(i);
  };

  const close = () => {
    unlock();
    setOpen(null);
    const trigger = triggerRef.current;
    if (trigger?.isConnected) trigger.focus({ preventScroll: true });
  };

  const discuss = () => {
    // Resume scrolling before the enquiry hand-off scrolls to the form.
    unlock();
    setOpen(null);
    onDiscuss();
  };

  /** Escape closes; Tab stays inside the dialog while it is open. */
  const onDialogKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>("button, a[href]");
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const item = open === null ? null : nftItems[open];

  return (
    <>
      <div
        ref={stageRef}
        className={`nftg-stage ${shown ? "nftg-in" : ""}`}
        role="list"
        aria-label="Sample NFT items, concept demo"
        data-testid="nft-gallery"
      >
        {nftItems.map((entry, i) => {
          const [left, top, width, rot, depth, period, delay, rise] = PLACES[i];
          return (
            <div
              key={entry.number}
              role="listitem"
              className="nftg-slot"
              style={
                {
                  "--l": `${left}%`,
                  "--t": `${top}%`,
                  "--w": `${width}%`,
                  "--rot": `${rot}deg`,
                  "--z": `${depth}px`,
                  "--period": `${period}s`,
                  "--delay": `${delay}s`,
                  "--rise": `${-rise}px`,
                  "--sway": `${i % 2 ? 0.7 : -0.7}deg`,
                  "--i": i,
                } as CSSProperties
              }
              data-testid={`nft-slot-${i}`}
            >
              <div className="nftg-float">
                <button
                  type="button"
                  className={`nftg-card ${focusRing}`}
                  onPointerMove={reducedMotion ? undefined : tiltTo}
                  onPointerLeave={untilt}
                  onPointerCancel={untilt}
                  onClick={(event) => show(i, event.currentTarget)}
                  aria-haspopup="dialog"
                  aria-label={`${entry.name}, item ${entry.number}, sample item. Open preview`}
                  data-testid={`nft-card-${i}`}
                >
                  <Art i={i} />
                  <span className="nftg-caption">
                    <span className="nftg-num">Item {entry.number}</span>
                    <span className="nftg-name">{entry.name}</span>
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-600" aria-hidden="true">
        <span className="hidden md:inline">Hover to tilt · click to preview</span>
        <span className="md:hidden">Swipe · tap to preview</span>
      </p>

      {createPortal(
        <AnimatePresence>
          {item && open !== null && (
            <motion.div
              key="nft-preview"
              className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.12 : 0.28 }}
              data-testid="nft-preview-layer"
            >
              <div className="absolute inset-0 bg-[rgba(4,4,6,0.78)] backdrop-blur-[3px]" onClick={close} data-testid="nft-preview-backdrop" />
              <motion.div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="nft-preview-title"
                onKeyDown={onDialogKey}
                className="nftg-modal relative grid max-h-[calc(100svh-2rem)] w-full max-w-3xl gap-5 overflow-y-auto rounded-xl p-4 sm:p-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-7"
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 14 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
                transition={{ duration: reducedMotion ? 0.12 : 0.34, ease: [0.2, 0.7, 0.2, 1] }}
                data-testid="nft-preview"
              >
                <button
                  ref={closeRef}
                  type="button"
                  onClick={close}
                  aria-label="Close preview"
                  className={`nftg-close absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full ${focusRing}`}
                  data-testid="nft-preview-close"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="nftg-modal-stage">
                  <div
                    className="nftg-card nftg-card-large"
                    onPointerMove={reducedMotion ? undefined : tiltTo}
                    onPointerLeave={untilt}
                    onPointerCancel={untilt}
                  >
                    <Art i={open} large />
                  </div>
                </div>

                <div className="flex min-w-0 flex-col pr-2 md:py-2">
                  <p className="nftg-badge">
                    <span aria-hidden="true" />
                    Concept · sample data
                  </p>
                  <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#8b8b93]">Item {item.number}</p>
                  <h4 id="nft-preview-title" className="mt-1.5 text-3xl font-semibold tracking-[-0.04em] text-[#f4f4f6]" data-testid="nft-preview-name">
                    {item.name}
                  </h4>
                  <p className="mt-2 font-mono text-[10px] text-[#8b8b93]">Owner 0xA1…demo</p>
                  <p className="mt-4 text-sm leading-relaxed text-[#b4b4bb]">{summary}</p>
                  <div className="mt-5" aria-hidden="true">
                    <div className="flex gap-2">
                      <span className="nftg-chip nftg-chip-solid">Mint</span>
                      <span className="nftg-chip">List</span>
                    </div>
                    <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[#6b6b73]">Interface labels · illustrative</p>
                  </div>
                  <button
                    type="button"
                    onClick={discuss}
                    className={`nftg-cta mt-6 inline-flex items-center gap-2 self-start rounded-[4px] bg-[#ff5500] px-4 py-2.5 text-sm font-medium text-[#0a0a0b] ${focusRing}`}
                    data-testid="nft-preview-discuss"
                  >
                    Discuss a similar project
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
