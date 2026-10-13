import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowUp, Gamepad2, MonitorPlay, RotateCcw, Zap } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { focusRing } from "./shared";
import { H, STEP, aliveTargets, createGame, demoInput, makeCoinSprite, noInput, render, step } from "./questEngine";
import type { Game, Input } from "./questEngine";

/**
 * ESTROC Blockchain Quest: a small canvas platformer that sits in its own
 * panel. One requestAnimationFrame loop runs only while the panel is on screen
 * and the tab is visible; React re-renders only when the mode changes.
 */

type Mode = "demo" | "play" | "idle";

const KEYS: Record<string, keyof Input> = {
  ArrowLeft: "left",
  KeyA: "left",
  ArrowRight: "right",
  KeyD: "right",
  ArrowUp: "jump",
  KeyW: "jump",
  Space: "jump",
  KeyX: "hit",
  KeyJ: "hit",
  KeyF: "hit",
  KeyK: "hit",
};

/** After this long without input, manual play hands back to the demo. */
const IDLE_TO_DEMO = 20;

const touchButtons: [keyof Input, string, typeof ArrowLeft][] = [
  ["left", "Move left", ArrowLeft],
  ["right", "Move right", ArrowRight],
  ["jump", "Jump", ArrowUp],
  ["hit", "Hit", Zap],
];

function useTouchPad() {
  const query = "(pointer: coarse), (max-width: 767px)";
  const [show, setShow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setShow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return show;
}

export default function BlockchainQuest() {
  const reducedMotion = !!useReducedMotion();
  const showPad = useTouchPad();
  const [mode, setModeState] = useState<Mode>(reducedMotion ? "idle" : "demo");

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const gameRef = useRef<Game | null>(null);
  const modeRef = useRef<Mode>(mode);
  const keysRef = useRef<Input>({ ...noInput });
  const tapsRef = useRef({ jump: false, hit: false });
  const lastInputRef = useRef(0);
  const wakeRef = useRef<() => void>(() => {});

  const setMode = useCallback((next: Mode) => {
    modeRef.current = next;
    setModeState(next);
    wakeRef.current();
  }, []);

  // Reduced motion never auto-plays; the visitor starts the game themselves.
  useEffect(() => {
    if (gameRef.current) gameRef.current.reduced = reducedMotion;
    if (reducedMotion && modeRef.current === "demo") setMode("idle");
  }, [reducedMotion, setMode]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d")!;
    const coin = makeCoinSprite();
    const game = createGame(reducedMotion);
    gameRef.current = game;

    let raf = 0;
    let last = 0;
    let acc = 0;
    let inView = false;
    let scale = 1;
    let viewW = 480;
    let shown = "";

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      scale = canvas.height / H;
      viewW = canvas.width / scale;
    };

    /** Mirror the counters to the DOM (score readout + data attributes for tests). */
    const sync = () => {
      const g = gameRef.current!;
      const px = String(Math.round(g.player.x));
      if (wrap.dataset.px !== px) wrap.dataset.px = px;
      const key = `${g.score}|${g.destroyed}|${g.spawned}|${g.coins.length}|${aliveTargets(g)}`;
      if (key === shown) return;
      shown = key;
      if (scoreRef.current) scoreRef.current.textContent = String(g.score);
      wrap.dataset.score = String(g.score);
      wrap.dataset.destroyed = String(g.destroyed);
      wrap.dataset.spawned = String(g.spawned);
      wrap.dataset.coins = String(g.coins.length);
      wrap.dataset.targets = String(aliveTargets(g));
    };

    const draw = () => {
      render(ctx, gameRef.current!, viewW, scale, coin);
      sync();
    };

    const running = () => inView && !document.hidden && modeRef.current !== "idle";

    const frame = (now: number) => {
      raf = 0;
      const g = gameRef.current!;
      const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
      last = now;
      acc += dt;
      while (acc >= STEP) {
        let input: Input = keysRef.current;
        if (modeRef.current === "demo") input = demoInput(g);
        else if (tapsRef.current.jump || tapsRef.current.hit) {
          // A press shorter than a frame still counts once.
          input = { ...input, jump: input.jump || tapsRef.current.jump, hit: input.hit || tapsRef.current.hit };
          tapsRef.current = { jump: false, hit: false };
        }
        step(g, input, STEP, viewW);
        acc -= STEP;
      }
      if (modeRef.current === "play" && now - lastInputRef.current > IDLE_TO_DEMO * 1000 && !g.reduced) setMode("demo");
      draw();
      if (running()) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (running()) {
        if (!raf) {
          last = 0;
          acc = 0;
          raf = requestAnimationFrame(frame);
        }
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
        draw();
      }
    };
    wakeRef.current = wake;

    resize();
    draw();
    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      wake();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", wake);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", wake);
      wakeRef.current = () => {};
    };
    // The loop is created once; mode and motion preferences are read through refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const takeControl = useCallback(() => {
    lastInputRef.current = performance.now();
    if (modeRef.current !== "play") {
      keysRef.current = { ...noInput };
      setMode("play");
    }
  }, [setMode]);

  const press = (key: keyof Input, down: boolean) => {
    if (down && (key === "jump" || key === "hit") && !keysRef.current[key]) tapsRef.current = { ...tapsRef.current, [key]: true };
    keysRef.current = { ...keysRef.current, [key]: down };
    lastInputRef.current = performance.now();
  };

  const onKey = (event: KeyboardEvent<HTMLDivElement>, down: boolean) => {
    const key = KEYS[event.code];
    if (!key) return;
    event.preventDefault();
    if (down) takeControl();
    press(key, down);
  };

  const restart = () => {
    const g = createGame(reducedMotion);
    gameRef.current = g;
    keysRef.current = { ...noInput };
    tapsRef.current = { jump: false, hit: false };
    wakeRef.current();
  };

  const play = () => {
    takeControl();
    wrapRef.current?.focus({ preventScroll: true });
  };

  const padHandlers = (key: keyof Input) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      takeControl();
      press(key, true);
    },
    onPointerUp: () => press(key, false),
    onPointerCancel: () => press(key, false),
    onLostPointerCapture: () => press(key, false),
    onContextMenu: (event: { preventDefault: () => void }) => event.preventDefault(),
  });

  const status = mode === "play" ? "Playing" : mode === "demo" ? "Auto demo" : "Ready";

  return (
    <div
      className="flex flex-col border border-white/10 bg-[#0d0d0f] md:h-[min(50vh,480px)] md:min-h-[340px]"
      data-testid="quest-panel"
    >
      {/* One bar for status, score and controls keeps the height for the game itself. */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/10 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-4">
          <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400" role="status" data-testid="quest-status">
            <span className={`h-1.5 w-1.5 rounded-full ${mode === "play" ? "bg-[#ff5500]" : "bg-white/15"}`} aria-hidden="true" />
            {status}
          </p>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-600 lg:block">
            {showPad ? "Tap to jump into blocks · hit ground blocks" : "← → move · Space jump · X hit"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            Coins <span ref={scoreRef} className="ml-1 text-sm font-semibold text-zinc-100" data-testid="quest-score">0</span>
          </p>
          {mode === "play" ? (
            <Button type="button" size="sm" variant="outline" onClick={() => setMode(reducedMotion ? "idle" : "demo")} disabled={reducedMotion} data-testid="quest-demo-button">
              <MonitorPlay className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Demo
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={play} data-testid="quest-play-button">
              <Gamepad2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Play
            </Button>
          )}
          <Button type="button" size="sm" variant="outline" onClick={restart} aria-label="Restart" data-testid="quest-restart-button">
            <RotateCcw className="h-3.5 w-3.5 sm:mr-1.5" aria-hidden="true" />
            <span className="hidden sm:inline">Restart</span>
          </Button>
        </div>
      </div>

      <div
        ref={wrapRef}
        tabIndex={0}
        role="application"
        aria-roledescription="game"
        aria-label="ESTROC Blockchain Quest. Arrow keys or A and D to move, Space or up arrow to jump, X to hit. Break the ASCII blocks and collect the coins."
        onKeyDown={(event) => onKey(event, true)}
        onKeyUp={(event) => onKey(event, false)}
        onBlur={() => (keysRef.current = { ...noInput })}
        onPointerDown={() => {
          if (modeRef.current !== "play") play();
        }}
        data-mode={mode}
        className={`relative h-[clamp(210px,38svh,300px)] w-full touch-manipulation overflow-hidden bg-[#0b0b0d] md:h-auto md:min-h-0 md:flex-1 ${focusRing} focus-visible:outline-offset-[-2px]`}
        data-testid="quest-game"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full [image-rendering:pixelated]" aria-hidden="true" />
        {mode !== "play" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-1.5 flex justify-center px-3 sm:bottom-3">
            {/* Sits on the game screen, which stays dark in both themes. */}
            <span className="border border-[rgba(255,255,255,0.15)] bg-[rgba(10,10,11,0.8)] px-2 py-1 text-center font-mono text-[9px] uppercase tracking-[0.14em] text-[#d4d4d8] sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-[0.18em]">
              {mode === "demo" ? "Auto demo · press a key or tap to play" : "Press Play to start"}
            </span>
          </div>
        )}
      </div>

      {showPad && (
        <div className="grid shrink-0 grid-cols-4 gap-2 border-t border-white/10 p-2.5" data-testid="quest-touchpad">
          {touchButtons.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              {...padHandlers(key)}
              className={`flex h-12 touch-none select-none items-center justify-center border border-white/15 text-zinc-200 active:bg-[#ff5500] active:text-[#0a0a0b] ${focusRing}`}
              data-testid={`quest-pad-${key}`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
