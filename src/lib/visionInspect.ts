/**
 * VisionInspect demo: the simulation behind the conveyor on the Computer
 * Vision page. Nothing here runs a model. Each product's result comes from an
 * `Inspector` — today a fixed, repeating sample sequence; later, a function
 * that calls a real computer-vision service can take its place without
 * changing the conveyor or the results panel.
 */

export type ProductKind = "Gear" | "Bracket" | "Housing";
export type DefectKind = "Surface Scratch" | "Crack Detected" | "Alignment Error";
export type Verdict = { status: "pass" } | { status: "defect"; defect: DefectKind };

export interface Product {
  serial: number;
  kind: ProductKind;
  verdict?: Verdict;
}

export interface InspectionEvent {
  serial: number;
  kind: ProductKind;
  verdict: Verdict;
}

/** Produces a verdict for a product. Swap for a real model call later. */
export type Inspector = (product: Product) => Verdict;

const KINDS: ProductKind[] = ["Gear", "Bracket", "Housing"];
export const kindFor = (serial: number): ProductKind => KINDS[(serial - 1) % KINDS.length];

/** A fixed sample run: mostly passes, with each defect type appearing. */
const SAMPLE: (DefectKind | null)[] = [
  null, null, "Surface Scratch", null, null, null, "Crack Detected", null,
  null, "Alignment Error", null, null, null, "Surface Scratch", null, null,
  "Crack Detected", null, null, null, "Alignment Error", null, null, null,
];

export const simulatedInspector: Inspector = ({ serial }) => {
  const defect = SAMPLE[(serial - 1) % SAMPLE.length];
  return defect ? { status: "defect", defect } : { status: "pass" };
};

export const serialLabel = (serial: number) => `#${String(serial).padStart(4, "0")}`;

/* ------------------------------------------------------------- belt layout */

/** Belt positions run along the loop; the scanner sits at SCAN_AT. */
export const SLOTS = 6;
export const SPACING = 190;
export const LOOP = SLOTS * SPACING; // 1140
export const SCAN_AT = 580; // loop position of the camera (x = 500 on screen)
export const ZONE = 75; // the camera starts "seeing" a product this far ahead
export const OFFSET = 80; // screen x = loop position − OFFSET
export const START_D = -30;

/** Where slot `i` sits on the loop for belt travel `d`. */
export const loopPos = (i: number, d: number) => (((i * SPACING + d) % LOOP) + LOOP) % LOOP;

/* ------------------------------------------------------------------- state */

export type RunState = "idle" | "running" | "paused";

export interface InspectState {
  run: RunState;
  slots: (Product | null)[];
  nextSerial: number;
  /** Every inspection, oldest first. All counters are derived from this log. */
  events: InspectionEvent[];
  /** Slot currently under the camera, before its verdict. */
  scanning: number | null;
}

export type InspectAction =
  | { type: "start" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "reset" }
  | { type: "enter"; slot: number }
  | { type: "inspect"; slot: number; inspector: Inspector }
  | { type: "recycle"; slot: number };

/** Belt at rest: products only upstream of the camera, nearest one first in line. */
export function initialInspectState(): InspectState {
  const upstream = Array.from({ length: SLOTS }, (_, i) => i)
    .filter((i) => loopPos(i, START_D) < SCAN_AT)
    .sort((a, b) => loopPos(b, START_D) - loopPos(a, START_D));
  const slots: (Product | null)[] = Array(SLOTS).fill(null);
  upstream.forEach((slot, n) => {
    slots[slot] = { serial: n + 1, kind: kindFor(n + 1) };
  });
  return { run: "idle", slots, nextSerial: upstream.length + 1, events: [], scanning: null };
}

export function inspectReducer(state: InspectState, action: InspectAction): InspectState {
  switch (action.type) {
    case "start":
      return state.run === "idle" ? { ...state, run: "running" } : state;
    case "pause":
      return state.run === "running" ? { ...state, run: "paused" } : state;
    case "resume":
      return state.run === "paused" ? { ...state, run: "running" } : state;
    case "reset":
      return initialInspectState();
    case "enter":
      return state.slots[action.slot] && !state.slots[action.slot]!.verdict ? { ...state, scanning: action.slot } : state;
    case "inspect": {
      const product = state.slots[action.slot];
      // An empty spot, or a product already judged, never produces a second event.
      if (!product || product.verdict) return state;
      const verdict = action.inspector(product);
      const slots = state.slots.slice();
      slots[action.slot] = { ...product, verdict };
      return {
        ...state,
        slots,
        scanning: state.scanning === action.slot ? null : state.scanning,
        events: [...state.events, { serial: product.serial, kind: product.kind, verdict }],
      };
    }
    case "recycle": {
      const slots = state.slots.slice();
      slots[action.slot] = { serial: state.nextSerial, kind: kindFor(state.nextSerial) };
      return { ...state, slots, nextSerial: state.nextSerial + 1 };
    }
  }
}

export function tally(events: InspectionEvent[]) {
  const defective = events.filter((e) => e.verdict.status === "defect").length;
  return { total: events.length, passed: events.length - defective, defective };
}
