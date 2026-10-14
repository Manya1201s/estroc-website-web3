/**
 * ESTROC Blockchain Quest — a tiny canvas platformer. Everything here is plain
 * data plus two functions, `step` (fixed-timestep simulation) and `render`
 * (one canvas, logical pixels), so the React shell owns only the loop and DOM.
 *
 * Coins are simulated game rewards: nothing here touches a wallet or a chain.
 */

/** Logical screen height; width follows the panel's aspect ratio. */
export const H = 270;
export const GROUND = 232;
export const WORLD_W = 1400;
export const STEP = 1 / 120;
export const COINS_PER_TARGET = 5;

const GRAVITY = 1500;
const JUMP_V = 560;
const RUN = 140;
const ACCEL = 1100;
const FRICTION = 1300;
const STOMP_VY = 260;
const PW = 12;
const PH = 20;
/** Coin radius in logical px: drawn size and pickup box both use it. */
const COIN_R = 29;
const COIN_LIFE = 10;
const COIN_GRAVITY = 1100;
const MAX_COINS = 60;
const MAX_PARTICLES = 220;
const MAX_FRAGMENTS = 120;
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const GLYPHS = "#$%&@*+=01<>{}[]/\\|~^";
const ORANGE = "#ff5500";
const GOLD = "#ffc62e";

export interface Input {
  left: boolean;
  right: boolean;
  jump: boolean;
  hit: boolean;
}

export const noInput: Input = { left: false, right: false, jump: false, hit: false };

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Target extends Box {
  kind: "float" | "ground";
  glyphs: string[];
  alive: boolean;
  /** Waiting to appear because the player is standing where it spawns. */
  pending: boolean;
  phase: number;
}

interface Fragment {
  ch: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  life: number;
  max: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
}

interface Coin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  phase: number;
  resting: boolean;
}

interface Popup {
  x: number;
  y: number;
  text: string;
  age: number;
}

export interface Game {
  t: number;
  wave: number;
  reduced: boolean;
  camX: number;
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    face: 1 | -1;
    onGround: boolean;
    coyote: number;
    jumpBuf: number;
    jumpHeld: boolean;
    hitHeld: boolean;
    hitT: number;
    hitCd: number;
    runT: number;
  };
  targets: Target[];
  coins: Coin[];
  frags: Fragment[];
  parts: Particle[];
  rings: { x: number; y: number; age: number }[];
  popups: Popup[];
  banner: { text: string; age: number } | null;
  pickup: { n: number; t: number; popup: Popup } | null;
  flash: { box: Box; age: number }[];
  shake: number;
  clearT: number | null;
  /** Counters, also mirrored to the DOM for tests and the score readout. */
  score: number;
  destroyed: number;
  spawned: number;
  /** Demo controller memory. */
  ai: { lastX: number; stuck: number; jumpHold: number };
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const overlap = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
const playerBox = (g: Game): Box => ({ x: g.player.x, y: g.player.y, w: PW, h: PH });

/** One wave: floating blocks to head-bump or stomp, ground blocks to punch or stomp. */
const LAYOUT: ["float" | "ground", number, number][] = [
  ["float", 170, 140],
  ["ground", 300, 0],
  ["float", 430, 146],
  ["ground", 560, 0],
  ["float", 690, 136],
  ["float", 820, 146],
  ["ground", 950, 0],
  ["float", 1090, 140],
  ["ground", 1220, 0],
];

function spawnWave(g: Game) {
  const shift = (g.wave % 2) * 24;
  g.targets = LAYOUT.map(([kind, x, y]) => {
    const t: Target =
      kind === "float"
        ? { kind, x: x + shift, y, w: 30, h: 22, glyphs: [], alive: true, pending: false, phase: rand(0, 6) }
        : { kind, x: x - shift, y: GROUND - 24, w: 28, h: 24, glyphs: [], alive: true, pending: false, phase: 0 };
    t.glyphs = Array.from({ length: 6 }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]);
    if (overlap(t, playerBox(g))) {
      t.alive = false;
      t.pending = true;
    }
    return t;
  });
}

export function createGame(reduced: boolean): Game {
  const g: Game = {
    t: 0,
    wave: 1,
    reduced,
    camX: 0,
    player: { x: 40, y: GROUND - PH, vx: 0, vy: 0, face: 1, onGround: true, coyote: 0, jumpBuf: 0, jumpHeld: false, hitHeld: false, hitT: 0, hitCd: 0, runT: 0 },
    targets: [],
    coins: [],
    frags: [],
    parts: [],
    rings: [],
    popups: [],
    banner: null,
    pickup: null,
    flash: [],
    shake: 0,
    clearT: null,
    score: 0,
    destroyed: 0,
    spawned: 0,
    ai: { lastX: 40, stuck: 0, jumpHold: 0 },
  };
  spawnWave(g);
  return g;
}

export const aliveTargets = (g: Game) => g.targets.filter((t) => t.alive).length;

function burst(g: Game, x: number, y: number, n: number, colors: string[], speed: number, gravity = 700) {
  for (let i = 0; i < n; i++) {
    const a = rand(0, Math.PI * 2);
    const v = rand(speed * 0.35, speed);
    const life = rand(0.35, 0.7);
    g.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - speed * 0.3, life, max: life, size: Math.random() < 0.3 ? 2 : 1, color: colors[i % colors.length], gravity });
  }
  if (g.parts.length > MAX_PARTICLES) g.parts.splice(0, g.parts.length - MAX_PARTICLES);
}

/**
 * Break a target: its ASCII characters fly apart, then coins pop out. The
 * `alive` guard is the only way in, so a target can pay out exactly once.
 */
function destroy(g: Game, t: Target, how: "bump" | "stomp" | "punch") {
  if (!t.alive) return;
  t.alive = false;
  g.destroyed++;
  const cx = t.x + t.w / 2;
  const cy = t.y + t.h / 2;
  const calm = g.reduced ? 0.3 : 1;
  const push = how === "punch" ? g.player.face * 70 : 0;
  const lift = how === "stomp" ? 0.6 : 1;

  // The glyph grid (3 × 2) plus the block's own border, as characters.
  const pieces = t.glyphs.map((ch, i) => ({ ch, x: t.x + (t.w / 3) * ((i % 3) + 0.5), y: t.y + (t.h / 2) * (Math.floor(i / 3) + 0.5), color: "#e4e4e7" }));
  for (const [ch, px, py] of [["[", t.x, cy], ["]", t.x + t.w, cy], ["=", cx - 7, t.y], ["=", cx + 7, t.y + t.h]] as [string, number, number][]) {
    pieces.push({ ch, x: px, y: py, color: ORANGE });
  }
  for (const p of pieces) {
    const life = g.reduced ? 0.4 : rand(0.9, 1.25);
    g.frags.push({
      ch: p.ch,
      x: p.x,
      y: p.y,
      vx: ((p.x - cx) * 7 + rand(-50, 50) + push) * calm,
      vy: (rand(-280, -130) * lift + (p.y - cy) * 6) * calm,
      rot: 0,
      vr: rand(-12, 12) * calm,
      life,
      max: life,
      color: p.color,
    });
  }
  if (g.frags.length > MAX_FRAGMENTS) g.frags.splice(0, g.frags.length - MAX_FRAGMENTS);

  burst(g, cx, cy, g.reduced ? 4 : 14, [ORANGE, GOLD, "#ffffff", "#ff8a3d"], 170 * calm);
  g.rings.push({ x: cx, y: cy, age: 0 });
  g.flash.push({ box: { x: t.x, y: t.y, w: t.w, h: t.h }, age: 0 });
  if (!g.reduced) g.shake = 0.2;

  for (let i = 0; i < COINS_PER_TARGET; i++) {
    g.coins.push({
      x: cx,
      y: cy,
      vx: (i - (COINS_PER_TARGET - 1) / 2) * 72 + rand(-10, 10) + push * 0.3,
      vy: -rand(290, 360),
      age: 0,
      phase: rand(0, Math.PI),
      resting: false,
    });
    g.spawned++;
  }
  if (g.coins.length > MAX_COINS) g.coins.splice(0, g.coins.length - MAX_COINS);
}

function collect(g: Game, c: Coin) {
  g.score++;
  burst(g, c.x, c.y, g.reduced ? 2 : 6, [GOLD, "#fff3c4"], 90, 120);
  // Pickups close together merge into one "+N COINS" label.
  if (g.pickup && g.t - g.pickup.t < 0.45 && g.popups.includes(g.pickup.popup)) {
    g.pickup.n++;
    g.pickup.t = g.t;
    g.pickup.popup.text = `+${g.pickup.n} COINS`;
    g.pickup.popup.age = Math.min(g.pickup.popup.age, 0.15);
    g.pickup.popup.x = c.x;
  } else {
    const popup = { x: c.x, y: c.y - COIN_R - 4, text: "+1 BTC COIN", age: 0 };
    g.popups.push(popup);
    g.pickup = { n: 1, t: g.t, popup };
  }
}

/** Autopilot for demo mode: clear the nearest block, then sweep up its coins. */
export function demoInput(g: Game): Input {
  const p = g.player;
  const pc = p.x + PW / 2;
  const input: Input = { left: false, right: false, jump: false, hit: false };
  const moveTo = (x: number, slack: number) => {
    if (x < pc - slack) input.left = true;
    else if (x > pc + slack) input.right = true;
  };

  const coin = g.coins
    .filter((c) => c.age > 0.35 && Math.abs(c.x - pc) < 260)
    .sort((a, b) => Math.abs(a.x - pc) - Math.abs(b.x - pc))[0];
  const target = g.targets.filter((t) => t.alive).sort((a, b) => Math.abs(a.x + a.w / 2 - pc) - Math.abs(b.x + b.w / 2 - pc))[0];

  if (coin) {
    moveTo(coin.x, 3);
    // Only jump for a coin resting up on a block, above the player's head.
    if (Math.abs(coin.x - pc) < 14 && coin.y + COIN_R < p.y && coin.resting) input.jump = true;
  } else if (target) {
    const tc = target.x + target.w / 2;
    if (target.kind === "float") {
      moveTo(tc, 3);
      if (Math.abs(tc - pc) <= 5 && p.onGround) input.jump = true;
    } else {
      moveTo(tc, 0);
      if (Math.abs(tc - pc) <= target.w / 2 + PW / 2 + 3) {
        p.face = tc > pc ? 1 : -1;
        input.hit = true;
      }
    }
  } else {
    moveTo(WORLD_W / 2, 30);
  }

  // Walking into something that will not break: hop over it.
  const wantsMove = input.left || input.right;
  g.ai.stuck = wantsMove && Math.abs(p.x - g.ai.lastX) < 0.05 ? g.ai.stuck + STEP : 0;
  g.ai.lastX = p.x;
  if (g.ai.stuck > 0.4) g.ai.jumpHold = 0.2;
  if (g.ai.jumpHold > 0) {
    g.ai.jumpHold -= STEP;
    input.jump = true;
  }
  return input;
}

const solids = (g: Game) => g.targets.filter((t) => t.alive);

export function step(g: Game, input: Input, dt: number, viewW: number) {
  const p = g.player;
  g.t += dt;

  // --- Player: run, jump (buffered, with coyote time), punch.
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  if (dir) {
    p.vx = Math.max(-RUN, Math.min(RUN, p.vx + dir * ACCEL * dt));
    p.face = dir as 1 | -1;
  } else {
    const f = FRICTION * dt;
    p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
  }
  if (input.jump && !p.jumpHeld) p.jumpBuf = 0.12;
  p.jumpHeld = input.jump;
  p.jumpBuf -= dt;
  p.coyote = p.onGround ? 0.08 : p.coyote - dt;
  if (p.jumpBuf > 0 && p.coyote > 0) {
    p.vy = -JUMP_V;
    p.jumpBuf = 0;
    p.coyote = 0;
    p.onGround = false;
  }
  p.hitCd -= dt;
  p.hitT -= dt;
  if (input.hit && !p.hitHeld && p.hitCd <= 0) {
    p.hitT = 0.16;
    p.hitCd = 0.28;
  }
  p.hitHeld = input.hit;
  p.vy += GRAVITY * dt;
  p.runT += Math.abs(p.vx) * dt * 0.08;

  // Horizontal move, then resolve against unbroken blocks.
  p.x = Math.max(0, Math.min(WORLD_W - PW, p.x + p.vx * dt));
  for (const t of solids(g)) {
    if (!overlap(playerBox(g), t)) continue;
    p.x = p.x + PW / 2 < t.x + t.w / 2 ? t.x - PW : t.x + t.w;
    p.vx = 0;
  }

  // Vertical move: hitting a block from below bumps it, landing hard stomps it.
  const vy = p.vy;
  p.y += p.vy * dt;
  p.onGround = false;
  if (p.y + PH >= GROUND) {
    p.y = GROUND - PH;
    p.vy = 0;
    p.onGround = true;
  }
  for (const t of solids(g)) {
    if (!overlap(playerBox(g), t)) continue;
    if (vy > 0) {
      p.y = t.y - PH;
      if (vy > STOMP_VY) {
        destroy(g, t, "stomp");
        p.vy = -330;
      } else {
        p.vy = 0;
        p.onGround = true;
      }
    } else if (vy < 0) {
      p.y = t.y + t.h;
      p.vy = 40;
      destroy(g, t, "bump");
    }
  }

  if (p.hitT > 0) {
    const fist: Box = { x: p.face > 0 ? p.x + PW - 2 : p.x - 14, y: p.y + 4, w: 16, h: 13 };
    for (const t of solids(g)) if (overlap(fist, t)) destroy(g, t, "punch");
  }

  // Blocks that were waiting for the player to step aside.
  for (const t of g.targets) {
    if (t.pending && !overlap(playerBox(g), t)) {
      t.pending = false;
      t.alive = true;
    }
  }

  // --- Coins: pop, fall, bounce, rest on ground or unbroken blocks, expire.
  const pcx = p.x + PW / 2;
  const pcy = p.y + PH / 2;
  for (let i = g.coins.length - 1; i >= 0; i--) {
    const c = g.coins[i];
    c.age += dt;
    c.phase += dt * 7;
    if (c.resting) {
      const under = c.y + COIN_R < GROUND - 0.5 && !solids(g).some((t) => c.x > t.x && c.x < t.x + t.w && Math.abs(t.y - (c.y + COIN_R)) < 1);
      if (under) c.resting = false;
    }
    if (!c.resting) {
      const bottom = c.y + COIN_R;
      c.vy += COIN_GRAVITY * dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      if (c.x < COIN_R || c.x > WORLD_W - COIN_R) {
        c.x = Math.max(COIN_R, Math.min(WORLD_W - COIN_R, c.x));
        c.vx = -c.vx * 0.5;
      }
      let floor = GROUND;
      if (c.vy > 0) {
        for (const t of solids(g)) if (c.x > t.x && c.x < t.x + t.w && bottom <= t.y + 0.5 && c.y + COIN_R >= t.y) floor = Math.min(floor, t.y);
      }
      if (c.y + COIN_R >= floor) {
        c.y = floor - COIN_R;
        if (c.vy > 90) {
          c.vy = -c.vy * 0.42;
          c.vx *= 0.7;
        } else {
          c.vy = 0;
          c.vx = 0;
          c.resting = true;
        }
      }
    }
    // A short magnet makes touching a coin feel generous.
    const dx = pcx - c.x;
    const dy = pcy - c.y;
    if (c.age > 0.3 && Math.hypot(dx, dy) < COIN_R + 20) {
      c.x += dx * Math.min(1, dt * 10);
      c.y += dy * Math.min(1, dt * 10);
    }
    if (c.age > 0.25 && Math.abs(dx) < PW / 2 + COIN_R && Math.abs(dy) < PH / 2 + COIN_R) {
      collect(g, c);
      g.coins.splice(i, 1);
    } else if (c.age > COIN_LIFE) {
      burst(g, c.x, c.y, 3, ["#a1a1aa"], 40, 0);
      g.coins.splice(i, 1);
    }
  }

  // --- Effects.
  for (let i = g.frags.length - 1; i >= 0; i--) {
    const f = g.frags[i];
    f.life -= dt;
    f.vy += 900 * dt;
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    f.rot += f.vr * dt;
    if (f.y > GROUND - 3) {
      f.y = GROUND - 3;
      f.vy *= -0.3;
      f.vx *= 0.6;
      f.vr *= 0.6;
    }
    if (f.life <= 0) g.frags.splice(i, 1);
  }
  for (let i = g.parts.length - 1; i >= 0; i--) {
    const q = g.parts[i];
    q.life -= dt;
    q.vy += q.gravity * dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    if (q.life <= 0) g.parts.splice(i, 1);
  }
  for (let i = g.rings.length - 1; i >= 0; i--) if ((g.rings[i].age += dt) > 0.24) g.rings.splice(i, 1);
  for (let i = g.flash.length - 1; i >= 0; i--) if ((g.flash[i].age += dt) > 0.08) g.flash.splice(i, 1);
  for (let i = g.popups.length - 1; i >= 0; i--) {
    const u = g.popups[i];
    u.age += dt;
    u.y -= 26 * dt;
    if (u.age > 0.9) g.popups.splice(i, 1);
  }
  g.shake = Math.max(0, g.shake - dt);
  if (g.banner && (g.banner.age += dt) > 1.6) g.banner = null;

  // --- Waves: once every block is broken, a fresh set appears.
  if (!g.targets.some((t) => t.alive || t.pending)) {
    if (g.clearT === null) g.clearT = 1.8;
    g.clearT -= dt;
    if (g.clearT <= 0) {
      g.clearT = null;
      g.wave++;
      spawnWave(g);
      g.banner = { text: `WAVE ${g.wave}`, age: 0 };
    }
  }

  // --- Camera follows the player inside the level.
  const goal = Math.max(0, Math.min(WORLD_W - viewW, p.x + PW / 2 - viewW * 0.42));
  g.camX = g.reduced ? goal : g.camX + (goal - g.camX) * Math.min(1, dt * 8);
}

/* ------------------------------------------------------------------ render */

/** Coin art, drawn at the canvas's exact device-pixel size so every art pixel stays square. */
export interface CoinArt {
  scale: number;
  coin: HTMLCanvasElement;
  glow: HTMLCanvasElement;
}

/**
 * Coin face on a 21 × 21 pixel grid: dark rim, a reeded edge lit from the top
 * left, an inner groove and raised border, a shaded face, an embossed
 * three-pixel-stem ₿, and a small sparkle.
 */
const COIN_GRID = 21;
const COIN_SYMBOL = [
  "..#..#...",
  "..#..#...",
  "#######..",
  ".###..##.",
  ".###...##",
  ".###..##.",
  ".######..",
  ".###...##",
  ".###...##",
  ".###..##.",
  "#######..",
  "..#..#...",
  "..#..#...",
];
const SYMBOL_AT = [6, 4]; // column, row of the symbol's top-left on the grid
const GLOW_D = 104; // logical diameter of the halo behind each coin

const inSymbol = (i: number, j: number) => COIN_SYMBOL[j - SYMBOL_AT[1]]?.[i - SYMBOL_AT[0]] === "#";

function coinPixel(i: number, j: number): string | null {
  const c = COIN_GRID / 2;
  const dx = i + 0.5 - c;
  const dy = j + 0.5 - c;
  const d = Math.hypot(dx, dy);
  const lit = dx + dy < 0;
  if (d > c) return null;
  if (d > 9.6) return "#6b3f00"; // outer rim
  if (d > 8.6) {
    // Reeded edge: alternating ridges around the coin, lit top-left.
    const ridge = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2)) * 32) % 2 === 0;
    return lit ? (ridge ? "#ffe680" : "#f0b400") : ridge ? "#d79a00" : "#a86e00";
  }
  if (d > 7.8) return "#8a5600"; // groove
  if (d > 7) return lit ? "#ffe58a" : "#d49600"; // raised inner border
  if (inSymbol(i, j)) return "#5a2e00";
  if (inSymbol(i - 1, j - 1)) return "#ffe9a0"; // emboss: light catches the symbol's lower-right edge
  if ((i === 5 && j === 6) || (i === 5 && j === 5) || (i === 4 && j === 6)) return i === 5 && j === 6 ? "#ffffff" : "#fff6cc"; // sparkle
  if (dx + dy < -6) return "#fff1b0"; // highlight
  if (dx + dy > 6) return "#eaa300"; // shade
  return GOLD;
}

/** Gold ₿ coin and its halo, rebuilt only when the canvas scale changes. */
export function makeCoinArt(scale: number): CoinArt {
  const size = Math.max(COIN_GRID, Math.round(COIN_R * 2 * scale));
  const coin = document.createElement("canvas");
  coin.width = coin.height = size;
  const x = coin.getContext("2d")!;
  const edge = (k: number) => Math.round((k * size) / COIN_GRID);
  for (let j = 0; j < COIN_GRID; j++) {
    for (let i = 0; i < COIN_GRID; i++) {
      const color = coinPixel(i, j);
      if (!color) continue;
      x.fillStyle = color;
      x.fillRect(edge(i), edge(j), edge(i + 1) - edge(i), edge(j + 1) - edge(j));
    }
  }

  const g = Math.round(GLOW_D * scale);
  const glow = document.createElement("canvas");
  glow.width = glow.height = g;
  const y = glow.getContext("2d")!;
  const halo = y.createRadialGradient(g / 2, g / 2, g * 0.16, g / 2, g / 2, g / 2);
  halo.addColorStop(0, "rgba(255,205,70,0.55)");
  halo.addColorStop(0.45, "rgba(255,170,30,0.22)");
  halo.addColorStop(1, "rgba(255,150,0,0)");
  y.fillStyle = halo;
  y.fillRect(0, 0, g, g);
  return { scale, coin, glow };
}

function drawPlayer(ctx: CanvasRenderingContext2D, g: Game) {
  const p = g.player;
  const X = Math.round(p.x);
  const Y = Math.round(p.y);
  const r = (rx: number, ry: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(p.face > 0 ? X + rx : X + PW - rx - w, Y + ry, w, h);
  };
  const frame = p.onGround && Math.abs(p.vx) > 10 ? Math.floor(p.runT) % 2 : 0;
  if (p.onGround) {
    r(2, 15, 3, frame ? 4 : 5, "#d4d4d8");
    r(7, 15, 3, frame ? 5 : 4, "#d4d4d8");
  } else {
    r(2, 15, 3, 3, "#d4d4d8");
    r(7, 14, 3, 4, "#d4d4d8");
  }
  r(1, 7, 10, 8, ORANGE);
  r(1, 12, 10, 1, "#0a0a0b");
  r(2, 0, 8, 7, "#f5f5f7");
  r(6, 2, 4, 3, "#0a0a0b");
  r(8, 2, 1, 1, ORANGE);
  if (p.hitT > 0) {
    r(10, 9, 7, 3, "#f5f5f7");
    r(16, 8, 4, 5, "#ffffff");
    ctx.fillStyle = "rgba(255,85,0,0.5)";
    ctx.fillRect(p.face > 0 ? X + 21 : X - 10, Y + 7, 1, 7);
  } else {
    r(9, 9, 3, 4, "#e4e4e7");
  }
}

export function render(ctx: CanvasRenderingContext2D, g: Game, viewW: number, scale: number, art: CoinArt) {
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#0b0b0d";
  ctx.fillRect(0, 0, viewW, H);

  // Backdrop: faint grid and a far-off chain of blocks, both with parallax.
  ctx.fillStyle = "rgba(255,255,255,0.035)";
  const gx = -((g.camX * 0.5) % 24);
  for (let x = gx; x < viewW; x += 24) ctx.fillRect(Math.round(x), 0, 1, GROUND);
  for (let y = 12; y < GROUND; y += 24) ctx.fillRect(0, y, viewW, 1);
  const far = g.camX * 0.3;
  ctx.lineWidth = 1;
  for (let i = Math.floor(far / 110) - 1; i < (far + viewW) / 110 + 1; i++) {
    const bx = i * 110 - far;
    const by = 52 + Math.sin(i * 1.7) * 14;
    const nby = 52 + Math.sin((i + 1) * 1.7) * 14;
    ctx.strokeStyle = i % 4 === 0 ? "rgba(255,85,0,0.22)" : "rgba(255,255,255,0.08)";
    ctx.strokeRect(Math.round(bx) + 0.5, Math.round(by) + 0.5, 26, 18);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.moveTo(Math.round(bx + 26), Math.round(by + 9) + 0.5);
    ctx.lineTo(Math.round(bx + 110), Math.round(nby + 9) + 0.5);
    ctx.stroke();
  }

  ctx.save();
  const sx = g.shake > 0 ? Math.round(rand(-2, 2) * (g.shake / 0.2)) : 0;
  const sy = g.shake > 0 ? Math.round(rand(-2, 2) * (g.shake / 0.2)) : 0;
  ctx.translate(-Math.round(g.camX) + sx, sy);
  const left = g.camX - 4;
  const right = g.camX + viewW + 4;

  // Ground.
  ctx.fillStyle = "#121214";
  ctx.fillRect(left, GROUND, right - left, H - GROUND + 4);
  ctx.fillStyle = "rgba(255,85,0,0.6)";
  ctx.fillRect(left, GROUND, right - left, 2);
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  for (let x = Math.floor(left / 16) * 16; x < right; x += 16) ctx.fillRect(x + 4, GROUND + 9 + ((x / 16) % 2 ? 7 : 0), 2, 2);
  ctx.fillStyle = "rgba(255,85,0,0.35)";
  ctx.fillRect(0, GROUND - 40, 2, 40);
  ctx.fillRect(WORLD_W - 2, GROUND - 40, 2, 40);

  // ASCII blocks.
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold 8px ${MONO}`;
  for (const t of g.targets) {
    if (!t.alive && !t.pending) continue;
    if (t.x + t.w < left || t.x > right) continue;
    const bob = t.kind === "float" && !g.reduced ? Math.round(Math.sin(g.t * 2 + t.phase) * 1.5) : 0;
    ctx.globalAlpha = t.pending ? 0.25 : 1;
    ctx.fillStyle = "#16161a";
    ctx.fillRect(t.x, t.y + bob, t.w, t.h);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(t.x + 1, t.y + bob + 1, t.w - 2, 2);
    ctx.strokeStyle = "rgba(255,85,0,0.8)";
    ctx.strokeRect(t.x + 0.5, t.y + bob + 0.5, t.w - 1, t.h - 1);
    ctx.fillStyle = "#d4d4d8";
    t.glyphs.forEach((ch, i) => ctx.fillText(ch, t.x + (t.w / 3) * ((i % 3) + 0.5), t.y + bob + (t.h / 2) * (Math.floor(i / 3) + 0.5) + 0.5));
  }
  ctx.globalAlpha = 1;

  for (const f of g.flash) {
    ctx.fillStyle = `rgba(255,255,255,${0.85 * (1 - f.age / 0.08)})`;
    ctx.fillRect(f.box.x - 1, f.box.y - 1, f.box.w + 2, f.box.h + 2);
  }
  for (const r of g.rings) {
    const k = r.age / 0.24;
    ctx.strokeStyle = `rgba(255,85,0,${1 - k})`;
    ctx.lineWidth = 2 - k;
    ctx.beginPath();
    ctx.arc(r.x, r.y, 4 + k * 24, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.lineWidth = 1;

  // Coins: a steady halo, then the face squeezed horizontally to spin. The
  // drawn face is exactly 2 × COIN_R across, the same box used for pickup.
  const snap = (v: number) => Math.round(v * scale) / scale;
  const D = COIN_R * 2;
  for (const c of g.coins) {
    if (c.x < left - GLOW_D || c.x > right + GLOW_D) continue;
    if (c.age > COIN_LIFE - 2.5 && Math.floor(c.age * 8) % 2) continue;
    ctx.globalAlpha = g.reduced ? 0.8 : 0.72 + 0.18 * Math.sin(g.t * 5 + c.phase);
    ctx.drawImage(art.glow, snap(c.x - GLOW_D / 2), snap(c.y - GLOW_D / 2), GLOW_D, GLOW_D);
    ctx.globalAlpha = 1;
    const squeeze = g.reduced ? 1 : Math.max(0.16, Math.abs(Math.cos(c.phase)));
    const w = Math.max(3, snap(D * squeeze));
    ctx.drawImage(art.coin, snap(c.x - w / 2), snap(c.y - COIN_R), w, D);
    if (squeeze < 0.4) {
      // Edge-on: a bright rim line keeps the coin solid while it turns.
      ctx.fillStyle = "#ffe066";
      ctx.fillRect(snap(c.x - 1.5), snap(c.y - COIN_R + 3), 3, D - 6);
    }
  }

  drawPlayer(ctx, g);

  for (const f of g.frags) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, f.life / (f.max * 0.5));
    ctx.translate(f.x, f.y);
    ctx.rotate(f.rot);
    ctx.fillStyle = f.color;
    ctx.font = `bold 9px ${MONO}`;
    ctx.fillText(f.ch, 0, 0);
    ctx.restore();
  }
  for (const q of g.parts) {
    ctx.globalAlpha = Math.min(1, q.life / (q.max * 0.5));
    ctx.fillStyle = q.color;
    ctx.fillRect(Math.round(q.x), Math.round(q.y), q.size, q.size);
  }
  ctx.globalAlpha = 1;

  ctx.font = `bold 8px ${MONO}`;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#0b0b0d";
  for (const u of g.popups) {
    ctx.globalAlpha = Math.min(1, (0.9 - u.age) / 0.3);
    ctx.strokeText(u.text, Math.round(u.x), Math.round(u.y));
    ctx.fillStyle = "#ffd25a";
    ctx.fillText(u.text, Math.round(u.x), Math.round(u.y));
  }
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;
  ctx.restore();

  // HUD (screen space).
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.font = `bold 7px ${MONO}`;
  ctx.fillStyle = "rgba(255,85,0,0.9)";
  ctx.fillText("ESTROC // BLOCKCHAIN QUEST", 10, 13);
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.fillText(`WAVE ${g.wave}  ·  BLOCKS ${aliveTargets(g)}`, 10, 24);
  ctx.textAlign = "right";
  ctx.font = `bold 10px ${MONO}`;
  ctx.fillStyle = "#f5f5f7";
  ctx.fillText(String(g.score).padStart(3, "0"), viewW - 10, 15);
  // The counter icon stays small: smoothing keeps the downscaled ₿ even.
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(art.coin, viewW - 47, 8, 14, 14);
  ctx.imageSmoothingEnabled = false;
  if (g.banner) {
    const a = Math.min(1, (1.6 - g.banner.age) / 0.4, g.banner.age / 0.15);
    ctx.globalAlpha = Math.max(0, a);
    ctx.textAlign = "center";
    ctx.font = `bold 16px ${MONO}`;
    ctx.fillStyle = ORANGE;
    ctx.fillText(g.banner.text, viewW / 2, H * 0.36);
    ctx.globalAlpha = 1;
  }
}
