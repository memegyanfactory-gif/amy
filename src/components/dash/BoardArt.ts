/**
 * The board's look, shared by the panel on screen and its JPG downloads: the chalkboard,
 * the sticky-note colours from the landing page, the mind map layout, and a canvas painter
 * for each download. Painting on a canvas keeps the files sharp and needs no extra library.
 */
import {
  Add01Icon,
  Atom01Icon,
  BulbIcon,
  Calculator01Icon,
  CellsIcon,
  ChartIncreaseIcon,
  CheckListIcon,
  DashboardSpeed01Icon,
  DropletIcon,
  FunctionIcon,
  Leaf01Icon,
  PlusMinusIcon,
  Shield01Icon,
  TaskDone01Icon,
  TextIcon,
  WeightScaleIcon
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import type { LessonContent } from '../../lessons';

/* ------------------------------------------------------------------ */
/* Shared look                                                          */
/* ------------------------------------------------------------------ */

export const STEP_ICONS: Record<string, IconSvgElement> = {
  speed: DashboardSpeed01Icon,
  formula: FunctionIcon,
  sign: PlusMinusIcon,
  chart: ChartIncreaseIcon,
  atom: Atom01Icon,
  scale: WeightScaleIcon,
  count: CheckListIcon,
  add: Add01Icon,
  cells: CellsIcon,
  shield: Shield01Icon,
  leaf: Leaf01Icon,
  drop: DropletIcon,
  text: TextIcon,
  calc: Calculator01Icon,
  check: TaskDone01Icon
};
export const stepIcon = (key: string): IconSvgElement => STEP_ICONS[key] ?? BulbIcon;

/** The four sticky notes on the landing page's chalkboard, each with a deeper ink of its colour for lines. */
export const NOTES = [
  { paper: '#ffe27a', ink: '#d09612' },
  { paper: '#ffb7a1', ink: '#e5643d' },
  { paper: '#a9dcff', ink: '#3a8bd0' },
  { paper: '#b9ecc4', ink: '#2f9a5c' }
] as const;
/** A slight lean for each note, so they look stuck on by hand. */
export const TILT = [-1.4, 1.1, 0.9, -1.2];
/** Pencil-dark ink for writing on paper. */
export const INK = '#2a1f10';
export const CHALK = '#f4f1e6';
export const CHALK_YELLOW = '#ffd06a';
export const SLATE =
  'radial-gradient(120% 80% at 20% 10%, rgba(255,255,255,.07), transparent 60%), radial-gradient(90% 70% at 85% 90%, rgba(255,255,255,.05), transparent 60%), linear-gradient(160deg, #245a45, #1a4334 60%, #163a2d)';
export const WOOD = 'linear-gradient(180deg, #c99561, #b98552 45%, #a8743f)';
export const SANS_FAMILY = '"Geist Variable", "Segoe UI", system-ui, sans-serif';
export const HAND_FAMILY = 'Caveat, "Segoe Print", cursive';

/** A short line with an equals sign is working, so the board writes it by hand. */
export const isFormula = (p: string) => p.includes('=') && p.length <= 34 && !/[.!?]$/.test(p);

/** Split text into lines of at most `max` characters, keeping words whole. */
export function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    if ((line + ' ' + w).trim().length > max && line) {
      out.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  // Don't leave a tiny word on its own line: "Brakes, a ball going / up" reads better as "Brakes, a ball / going up".
  const n = out.length;
  if (n > 1 && out[n - 1].length < 4) {
    const prev = out[n - 2].split(' ');
    if (prev.length > 1 && prev[prev.length - 1].length + 1 + out[n - 1].length <= max) {
      out[n - 1] = `${prev.pop()} ${out[n - 1]}`;
      out[n - 2] = prev.join(' ');
    }
  }
  return out.length ? out : [''];
}

/** A sticky note's outline: nearly square corners, with the bottom right one curling up. */
export const notePath = (x: number, y: number, w: number, h: number, r = 3, curl = 14) =>
  `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - curl} Q${x + w} ${y + h} ${x + w - curl} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;

/* ------------------------------------------------------------------ */
/* Mind map layout: the topic in the middle, a sticky note per branch   */
/* ------------------------------------------------------------------ */

export const MIND = {
  noteW: 172,
  gapX: 36,
  rowGap: 26,
  rootGap: 34,
  padX: 14,
  padTop: 12,
  titleSize: 23,
  titleLH: 24,
  titleGap: 8,
  pointSize: 13,
  lineH: 17,
  pointGap: 5,
  padBottom: 14,
  titleChars: 14,
  pointChars: 20
};

export interface MindNote {
  title: string[];
  points: string[][];
  x: number;
  y: number;
  w: number;
  h: number;
  color: number;
  tilt: number;
  /** The line from the topic to this note, as SVG path data. */
  link: string;
}
export interface MindLayout {
  W: number;
  H: number;
  root: { x: number; y: number; w: number; h: number; lines: string[] };
  notes: MindNote[];
}

/** Two columns of notes, half above the topic and half below, so it reads at the width of the side panel. */
export function mindLayout(map: LessonContent['map']): MindLayout {
  const M = MIND;
  const W = M.noteW * 2 + M.gapX;
  const sized = map.branches.map((b, i) => {
    const title = wrap(b.title, M.titleChars);
    const points = b.points.map(p => wrap(p, M.pointChars));
    const body = points.reduce((n, l) => n + l.length * M.lineH, 0) + Math.max(0, points.length - 1) * M.pointGap;
    return { title, points, h: M.padTop + title.length * M.titleLH + M.titleGap + body + M.padBottom, color: i % NOTES.length, tilt: TILT[i % TILT.length] };
  });
  const rows: (typeof sized)[] = [];
  for (let i = 0; i < sized.length; i += 2) rows.push(sized.slice(i, i + 2));
  const above = Math.ceil(rows.length / 2);

  const rootLines = wrap(map.center, 16);
  const rootW = Math.min(W - 40, Math.max(150, Math.max(...rootLines.map(l => l.length)) * 12 + 56));
  const rootH = 24 + rootLines.length * 28;

  type Placed = (typeof sized)[number] & { x: number; y: number; w: number; above: boolean; near: boolean; side: -1 | 0 | 1 };
  const placed: Placed[] = [];
  let y = 12; // room for the tape on the top row
  const put = (row: typeof sized, isAbove: boolean, near: boolean) => {
    const rowH = Math.max(...row.map(n => n.h));
    row.forEach((n, k) => {
      const single = row.length === 1;
      placed.push({
        ...n,
        w: M.noteW,
        x: single ? (W - M.noteW) / 2 : k * (M.noteW + M.gapX),
        // Above the topic the notes line up at the bottom, below it at the top, so every link is the same length.
        y: isAbove ? y + rowH - n.h : y,
        above: isAbove,
        near,
        side: single ? 0 : k === 0 ? -1 : 1
      });
    });
    y += rowH;
  };
  rows.slice(0, above).forEach((row, r) => {
    if (r) y += M.rowGap;
    put(row, true, r === above - 1);
  });
  if (above) y += M.rootGap;
  const root = { x: (W - rootW) / 2, y, w: rootW, h: rootH, lines: rootLines };
  y += rootH;
  rows.slice(above).forEach((row, r) => {
    y += r ? M.rowGap : M.rootGap;
    put(row, false, r === 0);
  });

  const cx = W / 2;
  const mid = root.y + root.h / 2;
  const notes: MindNote[] = placed.map(n => {
    let link: string;
    if (n.near && n.side !== 0) {
      // Out of the topic's side, into the middle of the note's nearest edge.
      const sx = n.side < 0 ? root.x + 14 : root.x + root.w - 14;
      const ax = n.x + n.w / 2;
      const ay = n.above ? n.y + n.h : n.y;
      const back = n.above ? 34 : -34;
      link = `M${sx} ${mid} C ${sx + n.side * 44} ${mid}, ${ax} ${ay + back}, ${ax} ${ay}`;
    } else if (n.side === 0) {
      link = `M${cx} ${mid} L${cx} ${n.above ? n.y + n.h : n.y}`;
    } else {
      // A far row: up the gap between the columns, then into the note's inner edge.
      const sx = cx + n.side * 8;
      const sy = n.above ? root.y + 6 : root.y + root.h - 6;
      const ax = n.side < 0 ? n.x + n.w : n.x;
      const ay = n.y + n.h / 2;
      link = `M${sx} ${sy} C ${sx} ${ay}, ${ax - n.side * 18} ${ay}, ${ax} ${ay}`;
    }
    return { title: n.title, points: n.points, x: n.x, y: n.y, w: n.w, h: n.h, color: n.color, tilt: n.tilt, link };
  });

  return { W, H: y + 16, root, notes };
}

/* ------------------------------------------------------------------ */
/* Downloads: each one painted on a canvas and saved as a JPG           */
/* ------------------------------------------------------------------ */

export type ExportKind = 'slide' | 'slides' | 'info' | 'map' | 'table';
export interface ExportMeta {
  lesson: string;
  course?: string;
  slide: number;
  dark: boolean;
}

type Ctx = CanvasRenderingContext2D;
type Slide = LessonContent['slides'][number];

interface Pal {
  dark: boolean;
  bg: string;
  card: string;
  card2: string;
  line: string;
  fg: string;
  fg2: string;
  muted: string;
  accent: string;
  shadow: string;
}
const LIGHT: Pal = { dark: false, bg: '#fffaf0', card: '#fffdf8', card2: '#f6ecd8', line: 'rgba(10,10,11,0.1)', fg: '#0a0a0b', fg2: '#3f3f46', muted: '#71717a', accent: '#f0702f', shadow: 'rgba(90,60,20,0.2)' };
const DARK: Pal = { dark: true, bg: '#0b0d12', card: '#151821', card2: '#1d212c', line: 'rgba(255,255,255,0.1)', fg: '#f5f5f4', fg2: '#d4d4d8', muted: '#a1a1aa', accent: '#ffa048', shadow: 'rgba(0,0,0,0.55)' };

const font = (size: number, weight = 400, family = SANS_FAMILY) => `${weight} ${size}px ${family}`;
const rad = (deg: number) => (deg * Math.PI) / 180;

function box(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const k = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + k, y);
  ctx.arcTo(x + w, y, x + w, y + h, k);
  ctx.arcTo(x + w, y + h, x, y + h, k);
  ctx.arcTo(x, y + h, x, y, k);
  ctx.arcTo(x, y, x + w, y, k);
  ctx.closePath();
}

/** Shadows ignore the canvas scale, so size them by it to look the same at any resolution. */
function shade(ctx: Ctx, color: string, blur: number, dy: number) {
  const t = ctx.getTransform();
  const s = Math.hypot(t.a, t.b);
  ctx.shadowColor = color;
  ctx.shadowBlur = blur * s;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = dy * s;
}

/** Split text into lines that fit `max` pixels in the current font. */
function lines(ctx: Ctx, text: string, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${w}` : w;
    if (line && ctx.measureText(next).width > max) {
      out.push(line);
      line = w;
    } else line = next;
  }
  if (line) out.push(line);
  return out.length ? out : [''];
}

function clip(ctx: Ctx, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

function icon(ctx: Ctx, svg: IconSvgElement, x: number, y: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [tag, a] of svg) {
    const filled = a.fill !== undefined && a.fill !== 'none';
    if (tag === 'path' && a.d) {
      const p = new Path2D(String(a.d));
      if (filled) ctx.fill(p);
      if (a.stroke !== undefined) ctx.stroke(p);
    } else if (tag === 'circle') {
      ctx.beginPath();
      ctx.arc(Number(a.cx), Number(a.cy), Number(a.r), 0, Math.PI * 2);
      if (filled) ctx.fill();
      if (a.stroke !== undefined) ctx.stroke();
    }
  }
  ctx.restore();
}

/** A strip of tape holding a note on. */
function tape(ctx: Ctx, cx: number, top: number, w: number, h: number) {
  ctx.save();
  ctx.translate(cx, top);
  ctx.rotate(rad(-2.5));
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.restore();
}

/** A sticky note leaning at `tilt` degrees, with its shadow and tape. `paint` writes on it, in the note's own space. */
function sticky(ctx: Ctx, pal: Pal, x: number, y: number, w: number, h: number, paper: string, tilt: number, paint: () => void) {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rad(tilt));
  ctx.translate(-w / 2, -h / 2);
  ctx.save();
  shade(ctx, pal.dark ? 'rgba(0,0,0,0.5)' : 'rgba(70,45,10,0.22)', 26, 12);
  ctx.fillStyle = paper;
  ctx.fill(new Path2D(notePath(0, 0, w, h, 5, 26)));
  ctx.restore();
  tape(ctx, w / 2, 0, Math.min(120, w * 0.28), 28);
  ctx.fillStyle = INK;
  paint();
  ctx.restore();
}

/** The eyebrow, the title and a line under it, as on the site's own pages. Returns where the content starts. */
function head(ctx: Ctx, pal: Pal, eyebrow: string, title: string, sub: string | undefined, W: number, P: number) {
  let y = P;
  ctx.save();
  ctx.translate(P, y + 22);
  ctx.rotate(rad(-1));
  ctx.font = font(40, 600, HAND_FAMILY);
  ctx.fillStyle = pal.accent;
  ctx.fillText(eyebrow, 0, 0);
  ctx.restore();
  y += 52;
  ctx.font = font(52, 600);
  ctx.fillStyle = pal.fg;
  for (const l of lines(ctx, title, W - 2 * P)) {
    ctx.fillText(l, P, y + 30);
    y += 62;
  }
  if (sub) {
    y += 2;
    ctx.font = font(26);
    ctx.fillStyle = pal.muted;
    for (const l of lines(ctx, sub, W - 2 * P)) {
      ctx.fillText(l, P, y + 18);
      y += 38;
    }
  }
  return y + 40;
}

/** Amy's mark and where the page came from. Returns the full height of the image. */
function foot(ctx: Ctx, pal: Pal, y: number, W: number, P: number, meta: ExportMeta) {
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(P, y);
  ctx.lineTo(W - P, y);
  ctx.stroke();
  const mid = y + 40;
  const g = ctx.createLinearGradient(P, mid - 9, P + 18, mid + 9);
  g.addColorStop(0, '#ffd06a');
  g.addColorStop(1, '#ff6b3d');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(P + 9, mid, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = font(24, 600);
  ctx.fillStyle = pal.fg;
  ctx.fillText('Amy', P + 28, mid);
  ctx.font = font(20);
  ctx.fillStyle = pal.muted;
  ctx.textAlign = 'right';
  ctx.fillText(clip(ctx, [meta.course, meta.lesson].filter(Boolean).join(' · '), W - 2 * P - 140), W - P, mid);
  ctx.textAlign = 'left';
  return mid + 24 + P * 0.6;
}

/** A chalkboard in its wooden frame, with the chalk tray, drawn at W x H. */
function paintBoard(ctx: Ctx, slide: Slide, n: number, total: number, label: string, W: number, H: number, round: number) {
  const u = W / 1280;
  const F = 22 * u;
  const T = 44 * u;

  const wood = ctx.createLinearGradient(0, 0, 0, H);
  wood.addColorStop(0, '#c99561');
  wood.addColorStop(0.45, '#b98552');
  wood.addColorStop(1, '#a8743f');
  box(ctx, 0, 0, W, H, round);
  ctx.fillStyle = wood;
  ctx.fill();
  ctx.save();
  box(ctx, 0, 0, W, H, round);
  ctx.clip();
  ctx.strokeStyle = 'rgba(90,50,20,0.13)';
  ctx.lineWidth = 1.4 * u;
  for (let i = 0; i < 9; i++) {
    const gy = (H / 9) * i + 6 * u;
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.bezierCurveTo(W * 0.3, gy + 5 * u, W * 0.62, gy - 6 * u, W, gy + 3 * u);
    ctx.stroke();
  }
  ctx.restore();

  // The slate.
  const sx = F, sy = F, sw = W - 2 * F, sh = H - 2 * F - T;
  ctx.save();
  box(ctx, sx, sy, sw, sh, Math.max(6 * u, round * 0.45));
  ctx.clip();
  const g = ctx.createLinearGradient(sx + sw * 0.35, sy, sx + sw * 0.65, sy + sh);
  g.addColorStop(0, '#245a45');
  g.addColorStop(0.6, '#1a4334');
  g.addColorStop(1, '#163a2d');
  ctx.fillStyle = g;
  ctx.fillRect(sx, sy, sw, sh);
  const smudge = (cx: number, cy: number, rx: number, ry: number, a: number) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rx / ry, 1);
    const r = ctx.createRadialGradient(0, 0, 0, 0, 0, ry);
    r.addColorStop(0, `rgba(255,255,255,${a})`);
    r.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = r;
    ctx.beginPath();
    ctx.arc(0, 0, ry, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };
  smudge(sx + sw * 0.2, sy + sh * 0.1, sw * 0.6, sh * 0.55, 0.07);
  smudge(sx + sw * 0.85, sy + sh * 0.9, sw * 0.45, sh * 0.4, 0.05);
  smudge(sx + sw * 0.62, sy + sh * 0.42, sw * 0.22, sh * 0.12, 0.025);
  const v = ctx.createRadialGradient(sx + sw / 2, sy + sh / 2, Math.min(sw, sh) * 0.35, sx + sw / 2, sy + sh / 2, Math.max(sw, sh) * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = v;
  ctx.fillRect(sx, sy, sw, sh);

  // Chalk: soft at the edges.
  ctx.shadowColor = 'rgba(244,241,230,0.3)';
  ctx.shadowBlur = 2 * u * Math.hypot(ctx.getTransform().a, ctx.getTransform().b);
  const px = sx + 64 * u;
  const maxW = sw - 128 * u;
  ctx.font = font(30 * u, 600, HAND_FAMILY);
  ctx.fillStyle = 'rgba(244,241,230,0.55)';
  ctx.fillText(`Slide ${n} of ${total}`, px, sy + 58 * u);
  if (label) {
    ctx.font = font(20 * u, 500);
    ctx.fillStyle = 'rgba(244,241,230,0.4)';
    ctx.textAlign = 'right';
    ctx.fillText(clip(ctx, label, sw * 0.45), sx + sw - 64 * u, sy + 58 * u);
    ctx.textAlign = 'left';
  }

  // Shrink the writing until it fits the slate.
  const top = sy + 104 * u;
  const room = sy + sh - 70 * u - top;
  const lay = (k: number) => {
    ctx.font = font(88 * k * u, 600, HAND_FAMILY);
    const title = lines(ctx, slide.title, maxW);
    const titleLH = 90 * k * u;
    let h = title.length * titleLH + 52 * k * u;
    const items = slide.points.map(p => {
      const f = isFormula(p);
      ctx.font = f ? font(60 * k * u, 600, HAND_FAMILY) : font(34 * k * u);
      const ls = lines(ctx, p, f ? maxW : maxW - 36 * u);
      const lh = (f ? 66 : 50) * k * u;
      h += ls.length * lh;
      return { f, ls, lh };
    });
    h += Math.max(0, items.length - 1) * 22 * k * u;
    return { k, title, titleLH, items, h };
  };
  let L = lay(1);
  for (let k = 0.95; L.h > room && k > 0.5; k -= 0.05) L = lay(k);

  let y = top;
  ctx.fillStyle = CHALK;
  ctx.font = font(88 * L.k * u, 600, HAND_FAMILY);
  let widest = 0;
  for (const l of L.title) {
    ctx.fillText(l, px, y + L.titleLH / 2);
    widest = Math.max(widest, ctx.measureText(l).width);
    y += L.titleLH;
  }
  // The wobbly line under the title.
  const ul = Math.min(widest, maxW, 640 * u);
  const uy = y + 8 * L.k * u;
  ctx.strokeStyle = 'rgba(244,241,230,0.55)';
  ctx.lineWidth = 4 * L.k * u;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px, uy + 4 * u);
  ctx.bezierCurveTo(px + ul * 0.22, uy - 3 * u, px + ul * 0.42, uy + 6 * u, px + ul * 0.62, uy + 1 * u);
  ctx.bezierCurveTo(px + ul * 0.8, uy - 4 * u, px + ul * 0.93, uy + 4 * u, px + ul, uy - 1 * u);
  ctx.stroke();
  y += 52 * L.k * u;

  L.items.forEach((it, i) => {
    if (i) y += 22 * L.k * u;
    if (it.f) {
      ctx.font = font(60 * L.k * u, 600, HAND_FAMILY);
      ctx.fillStyle = CHALK_YELLOW;
      for (const l of it.ls) {
        ctx.fillText(l, px, y + it.lh / 2);
        y += it.lh;
      }
    } else {
      ctx.fillStyle = CHALK_YELLOW;
      ctx.beginPath();
      ctx.arc(px + 7 * u, y + it.lh / 2, 6 * L.k * u, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = font(34 * L.k * u);
      ctx.fillStyle = 'rgba(244,241,230,0.92)';
      for (const l of it.ls) {
        ctx.fillText(l, px + 36 * u, y + it.lh / 2);
        y += it.lh;
      }
    }
  });

  // The teacher's signature.
  ctx.font = font(32 * u, 600, HAND_FAMILY);
  ctx.fillStyle = 'rgba(244,241,230,0.32)';
  ctx.textAlign = 'right';
  ctx.fillText('Amy', sx + sw - 48 * u, sy + sh - 34 * u);
  ctx.textAlign = 'left';
  ctx.restore();

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 2 * u;
  box(ctx, sx, sy, sw, sh, Math.max(6 * u, round * 0.45));
  ctx.stroke();

  // The chalk tray, with chalk and the duster.
  const ty = sy + sh + 12 * u;
  const th = H - ty - 12 * u;
  const tray = ctx.createLinearGradient(0, ty, 0, ty + th);
  tray.addColorStop(0, '#9a683a');
  tray.addColorStop(1, '#7f5129');
  box(ctx, F * 0.6, ty, W - F * 1.2, th, 8 * u);
  ctx.fillStyle = tray;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.5 * u;
  ctx.beginPath();
  ctx.moveTo(F, ty + th - 1 * u);
  ctx.lineTo(W - F, ty + th - 1 * u);
  ctx.stroke();
  const cy = ty + th / 2;
  ctx.save();
  shade(ctx, 'rgba(0,0,0,0.35)', 3 * u, 2 * u);
  [
    ['rgba(244,241,230,0.95)', 92],
    [CHALK_YELLOW, 64],
    ['#a9dcff', 78]
  ].reduce((x, [c, w]) => {
    box(ctx, x, cy - 7 * u, Number(w) * u, 14 * u, 7 * u);
    ctx.fillStyle = String(c);
    ctx.fill();
    return x + (Number(w) + 22) * u;
  }, sx + 60 * u);
  box(ctx, sx + sw - 180 * u, cy - 15 * u, 120 * u, 26 * u, 5 * u);
  ctx.fillStyle = '#d9c7a3';
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#6f5f4b';
  ctx.fillRect(sx + sw - 180 * u, cy + 3 * u, 120 * u, 8 * u);
}

function paintSlides(ctx: Ctx, H: number, c: LessonContent, meta: ExportMeta, pal: Pal) {
  const W = 1440, P = 64, gap = 32;
  if (H) {
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);
  }
  let y = head(ctx, pal, 'Slides', meta.lesson, [meta.course, `${c.slides.length} slides`].filter(Boolean).join(' · '), W, P);
  const cw = (W - 2 * P - gap) / 2;
  const ch = (cw * 9) / 16;
  c.slides.forEach((s, i) => {
    const alone = i === c.slides.length - 1 && c.slides.length % 2 === 1;
    const x = alone ? (W - cw) / 2 : P + (i % 2) * (cw + gap);
    const top = y + Math.floor(i / 2) * (ch + gap);
    ctx.save();
    shade(ctx, pal.shadow, 30, 14);
    box(ctx, x, top, cw, ch, 14);
    ctx.fillStyle = '#a8743f';
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.translate(x, top);
    ctx.scale(cw / 1280, cw / 1280);
    paintBoard(ctx, s, i + 1, c.slides.length, '', 1280, 720, 28);
    ctx.restore();
  });
  y += Math.ceil(c.slides.length / 2) * (ch + gap) - gap;
  return foot(ctx, pal, y + 56, W, P, meta);
}

function paintInfo(ctx: Ctx, H: number, c: LessonContent, meta: ExportMeta, pal: Pal) {
  const W = 1080, P = 64, gap = 40, pad = 30;
  if (H) {
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);
  }
  let y = head(ctx, pal, 'Step by step', c.info.title, c.info.summary, W, P);
  const cw = (W - 2 * P - gap) / 2;
  const inner = cw - 2 * pad;
  const notes = c.info.steps.map((st, i) => {
    ctx.font = font(44, 600, HAND_FAMILY);
    const title = lines(ctx, st.title, inner - 112);
    ctx.font = font(24);
    const text = lines(ctx, st.text, inner);
    ctx.font = font(19, 600);
    const tags: { t: string; x: number; row: number; w: number }[] = [];
    let tx = 0, row = 0;
    for (const t of st.tags) {
      const w = ctx.measureText(t).width + 28;
      if (tx && tx + w > inner) {
        tx = 0;
        row++;
      }
      tags.push({ t, x: tx, row, w });
      tx += w + 8;
    }
    const titleH = Math.max(60, title.length * 46);
    const h = pad + titleH + 12 + text.length * 36 + (tags.length ? 20 + (row + 1) * 42 : 0) + pad;
    return { st, i, title, titleH, text, tags, h };
  });
  for (let r = 0; r < notes.length; r += 2) {
    const row = notes.slice(r, r + 2);
    const rh = Math.max(...row.map(n => n.h));
    row.forEach((n, k) => {
      const note = NOTES[n.i % NOTES.length];
      sticky(ctx, pal, P + k * (cw + gap), y, cw, rh, note.paper, TILT[n.i % TILT.length], () => {
        ctx.globalAlpha = 0.4;
        ctx.font = font(72, 600, HAND_FAMILY);
        ctx.fillText(String(n.i + 1), pad, pad + 30);
        ctx.globalAlpha = 0.55;
        icon(ctx, stepIcon(n.st.icon), cw - pad - 34, pad + 2, 34, INK);
        ctx.globalAlpha = 1;
        ctx.font = font(44, 600, HAND_FAMILY);
        n.title.forEach((l, j) => ctx.fillText(l, pad + 54, pad + 30 + j * 46));
        let ty = pad + n.titleH + 12;
        ctx.font = font(24);
        ctx.fillStyle = 'rgba(42,31,16,0.78)';
        for (const l of n.text) {
          ctx.fillText(l, pad, ty + 18);
          ty += 36;
        }
        ty += 20;
        ctx.font = font(19, 600);
        for (const t of n.tags) {
          box(ctx, pad + t.x, ty + t.row * 42, t.w, 34, 17);
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.fill();
          ctx.fillStyle = 'rgba(42,31,16,0.8)';
          ctx.fillText(t.t, pad + t.x + 14, ty + t.row * 42 + 17);
        }
      });
    });
    y += rh + 48;
  }

  // Remember: the one line worth keeping, under a highlighter.
  ctx.font = font(30, 500);
  const rl = lines(ctx, c.info.remember, W - 2 * P - 64);
  const rh = 32 + 50 + 8 + rl.length * 46 + 28;
  box(ctx, P, y, W - 2 * P, rh, 28);
  ctx.fillStyle = 'rgba(255,160,72,0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,160,72,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = font(44, 600, HAND_FAMILY);
  ctx.fillStyle = pal.accent;
  ctx.fillText('Remember', P + 32, y + 32 + 24);
  let ly = y + 32 + 50 + 8;
  ctx.font = font(30, 500);
  for (const l of rl) {
    ctx.fillStyle = pal.dark ? 'rgba(255,160,72,0.3)' : 'rgba(255,208,106,0.55)';
    ctx.fillRect(P + 29, ly + 27, ctx.measureText(l).width + 6, 16);
    ctx.fillStyle = pal.fg;
    ctx.fillText(l, P + 32, ly + 23);
    ly += 46;
  }
  y += rh;
  return foot(ctx, pal, y + 56, W, P, meta);
}

/** The mind map at its own size; scale the context to draw it bigger. */
function paintMind(ctx: Ctx, L: MindLayout, pal: Pal) {
  const M = MIND;
  ctx.lineCap = 'round';
  ctx.lineWidth = 2.6;
  for (const n of L.notes) {
    ctx.strokeStyle = NOTES[n.color].ink;
    ctx.stroke(new Path2D(n.link));
  }
  for (const n of L.notes) {
    const cx = n.x + n.w / 2, cy = n.y + n.h / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rad(n.tilt));
    ctx.translate(-cx, -cy);
    ctx.save();
    shade(ctx, pal.dark ? 'rgba(0,0,0,0.45)' : 'rgba(70,45,10,0.18)', 12, 6);
    ctx.fillStyle = NOTES[n.color].paper;
    ctx.fill(new Path2D(notePath(n.x, n.y, n.w, n.h)));
    ctx.restore();
    tape(ctx, cx, n.y, 48, 14);
    ctx.fillStyle = INK;
    ctx.font = font(M.titleSize, 600, HAND_FAMILY);
    ctx.textBaseline = 'alphabetic';
    n.title.forEach((l, j) => ctx.fillText(l, n.x + M.padX, n.y + M.padTop + 18 + j * M.titleLH));
    let py = n.y + M.padTop + n.title.length * M.titleLH + M.titleGap;
    ctx.font = font(M.pointSize);
    for (const ls of n.points) {
      ctx.fillStyle = NOTES[n.color].ink;
      ctx.beginPath();
      ctx.arc(n.x + M.padX + 3, py + M.lineH - 8.5, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(42,31,16,0.82)';
      ls.forEach((l, k) => ctx.fillText(l, n.x + M.padX + 12, py + (k + 1) * M.lineH - 4));
      py += ls.length * M.lineH + M.pointGap;
    }
    ctx.textBaseline = 'middle';
    ctx.restore();
  }
  const r = L.root;
  const radius = Math.min(r.h / 2, 26);
  const g = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
  g.addColorStop(0, '#ffd06a');
  g.addColorStop(0.55, '#ffa048');
  g.addColorStop(1, '#ff6b3d');
  ctx.save();
  shade(ctx, 'rgba(255,138,61,0.55)', 22, 4);
  box(ctx, r.x, r.y, r.w, r.h, radius);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
  box(ctx, r.x + 10, r.y + 5, r.w - 20, r.h / 2 - 5, Math.max(4, radius - 8));
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fill();
  ctx.font = font(28, 600, HAND_FAMILY);
  ctx.fillStyle = '#2a1406';
  ctx.textAlign = 'center';
  r.lines.forEach((l, j) => ctx.fillText(l, r.x + r.w / 2, r.y + r.h / 2 + (j - (r.lines.length - 1) / 2) * 28 + 1));
  ctx.textAlign = 'left';
}

function paintMap(ctx: Ctx, H: number, c: LessonContent, meta: ExportMeta, pal: Pal) {
  const W = 1200, P = 64;
  if (H) {
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);
  }
  let y = head(ctx, pal, 'The big picture', c.map.center, undefined, W, P);
  const L = mindLayout(c.map);
  const k = Math.min((W - 2 * P - 64) / L.W, 3);
  const mw = L.W * k, mh = L.H * k;
  const cardH = mh + 72;
  const ox = (W - mw) / 2, oy = y + 36;
  box(ctx, P, y, W - 2 * P, cardH, 28);
  ctx.fillStyle = pal.card;
  ctx.fill();
  ctx.save();
  box(ctx, P, y, W - 2 * P, cardH, 28);
  ctx.clip();
  ctx.fillStyle = pal.dark ? 'rgba(255,255,255,0.08)' : 'rgba(10,10,11,0.09)';
  for (let gx = P + 14; gx < W - P; gx += 26) for (let gy = y + 14; gy < y + cardH; gy += 26) ctx.fillRect(gx, gy, 2.4, 2.4);
  const rx = ox + (L.root.x + L.root.w / 2) * k, ry = oy + (L.root.y + L.root.h / 2) * k;
  const glow = ctx.createRadialGradient(rx, ry, 0, rx, ry, 420);
  glow.addColorStop(0, pal.dark ? 'rgba(255,138,61,0.16)' : 'rgba(255,160,72,0.2)');
  glow.addColorStop(1, 'rgba(255,160,72,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(P, y, W - 2 * P, cardH);
  ctx.restore();
  box(ctx, P, y, W - 2 * P, cardH, 28);
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(k, k);
  paintMind(ctx, L, pal);
  ctx.restore();
  y += cardH;
  return foot(ctx, pal, y + 56, W, P, meta);
}

function paintTable(ctx: Ctx, H: number, c: LessonContent, meta: ExportMeta, pal: Pal) {
  const t = c.table;
  const W = Math.min(1400, Math.max(960, t.columns.length * 300 + 128)), P = 64;
  if (H) {
    ctx.fillStyle = pal.bg;
    ctx.fillRect(0, 0, W, H);
  }
  let y = head(ctx, pal, 'Side by side', t.title, undefined, W, P);
  const tw = W - 2 * P, padX = 26, padY = 18, LH = 38, HLH = 34;
  const strong = (i: number) => i === 0 || i === t.highlight;
  const nat = t.columns.map((col, i) => {
    ctx.font = font(30, 600, HAND_FAMILY);
    let w = ctx.measureText(col).width;
    for (const row of t.rows) {
      ctx.font = font(26, strong(i) ? 600 : 400);
      w = Math.max(w, ctx.measureText(row[i] ?? '').width);
    }
    return w + 2 * padX;
  });
  const sum = nat.reduce((a, b) => a + b, 0);
  const cols = nat.map(w => (w * tw) / sum);
  ctx.font = font(30, 600, HAND_FAMILY);
  const heads = t.columns.map((col, i) => lines(ctx, col, cols[i] - 2 * padX));
  const headH = Math.max(...heads.map(l => l.length)) * HLH + 2 * padY;
  const body = t.rows.map(row =>
    row.map((cell, i) => {
      ctx.font = font(26, strong(i) ? 600 : 400);
      return lines(ctx, cell, cols[i] - 2 * padX);
    })
  );
  const rowH = body.map(r => Math.max(...r.map(l => l.length)) * LH + 2 * padY);
  const th = headH + rowH.reduce((a, b) => a + b, 0);

  ctx.save();
  shade(ctx, pal.shadow, 30, 12);
  box(ctx, P, y, tw, th, 24);
  ctx.fillStyle = pal.card;
  ctx.fill();
  ctx.restore();
  ctx.save();
  box(ctx, P, y, tw, th, 24);
  ctx.clip();
  ctx.fillStyle = pal.card2;
  ctx.fillRect(P, y, tw, headH);
  if (t.highlight !== undefined) {
    const hx = P + cols.slice(0, t.highlight).reduce((a, b) => a + b, 0);
    ctx.fillStyle = 'rgba(255,160,72,0.18)';
    ctx.fillRect(hx, y, cols[t.highlight], headH);
    ctx.fillStyle = 'rgba(255,160,72,0.08)';
    ctx.fillRect(hx, y + headH, cols[t.highlight], th - headH);
  }
  let x = P;
  heads.forEach((ls, i) => {
    ctx.font = font(30, 600, HAND_FAMILY);
    ctx.fillStyle = i === t.highlight ? pal.accent : pal.fg2;
    ls.forEach((l, j) => ctx.fillText(l, x + padX, y + padY + HLH / 2 + j * HLH));
    x += cols[i];
  });
  let ry = y + headH;
  body.forEach((r, ri) => {
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(P, ry);
    ctx.lineTo(P + tw, ry);
    ctx.stroke();
    let cx = P;
    r.forEach((ls, i) => {
      ctx.font = font(26, strong(i) ? 600 : 400);
      ctx.fillStyle = strong(i) ? pal.fg : pal.fg2;
      ls.forEach((l, j) => ctx.fillText(l, cx + padX, ry + padY + LH / 2 + j * LH));
      cx += cols[i];
    });
    ry += rowH[ri];
  });
  ctx.restore();
  box(ctx, P, y, tw, th, 24);
  ctx.strokeStyle = pal.line;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  y += th;

  if (t.note) {
    y += 48;
    ctx.font = font(26);
    const nl = lines(ctx, t.note, tw - 100);
    const nh = 40 + nl.length * 40 + 32;
    sticky(ctx, pal, P + 10, y, tw - 20, nh, NOTES[0].paper, -0.8, () => {
      ctx.font = font(26);
      nl.forEach((l, j) => ctx.fillText(l, 40, 40 + j * 40 + 20));
    });
    y += nh;
  }
  return foot(ctx, pal, y + 56, W, P, meta);
}

/** Paint twice: once to measure the height, then for real at twice the size for sharp text. */
function render(W: number, paint: (ctx: Ctx, H: number) => number, scale = 2) {
  const probe = document.createElement('canvas').getContext('2d');
  if (!probe) throw new Error('This browser cannot draw pictures.');
  probe.textBaseline = 'middle';
  const H = Math.ceil(paint(probe, 0));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('This browser cannot draw pictures.');
  ctx.scale(scale, scale);
  ctx.textBaseline = 'middle';
  paint(ctx, H);
  return canvas;
}

function save(canvas: HTMLCanvasElement, file: string) {
  return new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('The picture could not be made.'));
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        resolve();
      },
      'image/jpeg',
      0.92
    );
  });
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
    .replace(/-+$/, '') || 'lesson';

/** The fonts have to be in before painting, or the canvas quietly falls back to another one. */
async function fontsReady(sample: string) {
  if (!document.fonts) return;
  const faces = ['600 40px Caveat', '400 20px "Geist Variable"', '500 20px "Geist Variable"', '600 20px "Geist Variable"'];
  await Promise.all(faces.map(f => document.fonts.load(f, sample))).catch(() => undefined);
}

/** Paint one view of the board and save it as a JPG, in the light or dark look the student is using. */
export async function downloadBoard(kind: ExportKind, c: LessonContent, meta: ExportMeta) {
  const pal = meta.dark ? DARK : LIGHT;
  const name = slug(meta.lesson);
  const i = Math.min(Math.max(meta.slide, 0), c.slides.length - 1);
  const sample =
    kind === 'table'
      ? [c.table.title, ...c.table.columns, ...c.table.rows.flat(), c.table.note ?? ''].join(' ')
      : kind === 'map'
        ? [c.map.center, ...c.map.branches.flatMap(b => [b.title, ...b.points])].join(' ')
        : kind === 'info'
          ? [c.info.title, c.info.summary, c.info.remember, ...c.info.steps.flatMap(s => [s.title, s.text, ...s.tags])].join(' ')
          : c.slides.flatMap(s => [s.title, ...s.points]).join(' ');
  await fontsReady(`${meta.lesson} ${meta.course ?? ''} ${sample}`.slice(0, 2000));

  let canvas: HTMLCanvasElement;
  let file: string;
  if (kind === 'slide') {
    canvas = render(1280, ctx => {
      paintBoard(ctx, c.slides[i], i + 1, c.slides.length, meta.lesson, 1280, 720, 0);
      return 720;
    });
    file = `${name}-slide-${i + 1}`;
  } else if (kind === 'slides') {
    canvas = render(1440, (ctx, H) => paintSlides(ctx, H, c, meta, pal));
    file = `${name}-slides`;
  } else if (kind === 'info') {
    canvas = render(1080, (ctx, H) => paintInfo(ctx, H, c, meta, pal));
    file = `${name}-infographic`;
  } else if (kind === 'map') {
    canvas = render(1200, (ctx, H) => paintMap(ctx, H, c, meta, pal));
    file = `${name}-mind-map`;
  } else {
    const t = c.table;
    canvas = render(Math.min(1400, Math.max(960, t.columns.length * 300 + 128)), (ctx, H) => paintTable(ctx, H, c, meta, pal));
    file = `${name}-table`;
  }
  await save(canvas, `${file}.jpg`);
}
