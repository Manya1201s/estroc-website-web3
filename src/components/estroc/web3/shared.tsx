import type { KeyboardEvent, ReactNode } from "react";
import { MaskLines, Rise } from "@/components/estroc/MaskReveal";

/** Visible keyboard focus on custom controls, in the brand orange. */
export const focusRing =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff5500]";

/**
 * Arrow / Home / End handling for a WAI-ARIA tablist with automatic
 * activation: the key both selects the tab and moves focus to it.
 */
export function onTabKeyDown(
  event: KeyboardEvent<HTMLElement>,
  index: number,
  count: number,
  select: (next: number) => void,
) {
  const keys: Record<string, number> = {
    ArrowRight: index + 1,
    ArrowDown: index + 1,
    ArrowLeft: index - 1,
    ArrowUp: index - 1,
    Home: 0,
    End: count - 1,
  };
  if (!(event.key in keys)) return;
  event.preventDefault();
  const next = (keys[event.key] + count) % count;
  select(next);
  const tabs = event.currentTarget
    .closest('[role="tablist"]')
    ?.querySelectorAll<HTMLElement>('[role="tab"]');
  tabs?.[next]?.focus();
}

/** Section opener: an indexed mono kicker over the site's standard heading scale. */
export function SectionIntro({
  index,
  kicker,
  title,
  copy,
  testId,
}: {
  index: string;
  kicker: string;
  title: ReactNode[];
  copy: string;
  testId: string;
}) {
  return (
    <div className="max-w-3xl" data-testid={`${testId}-heading-block`}>
      <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#ff5500]">
        {index} / {kicker}
      </p>
      <MaskLines
        as="h2"
        lines={title}
        className="mt-4 text-5xl font-semibold tracking-[-0.065em] text-zinc-100 sm:text-7xl"
        testId={`${testId}-heading`}
      />
      <Rise delay={0.12}>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-zinc-500 sm:text-xl">{copy}</p>
      </Rise>
    </div>
  );
}

/** The "fictional data" stamp used wherever the page shows sample chain data. */
export function DemoBadge({ label = "Demo data · fictional" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 border border-[#ff5500]/40 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-[#ff5500]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#ff5500]" aria-hidden="true" />
      {label}
    </span>
  );
}
