import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Add01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  Atom01Icon,
  BulbIcon,
  Calculator01Icon,
  Cancel01Icon,
  CellsIcon,
  ChartIncreaseIcon,
  CheckListIcon,
  DashboardSpeed01Icon,
  Download04Icon,
  DropletIcon,
  FullScreenIcon,
  FunctionIcon,
  HierarchyIcon,
  Leaf01Icon,
  LeftToRightListBulletIcon,
  Maximize01Icon,
  Minimize01Icon,
  MinusSignIcon,
  PlusMinusIcon,
  PlusSignIcon,
  PresentationBarChart01Icon,
  Shield01Icon,
  SidebarRightIcon,
  Table01Icon,
  TaskDone01Icon,
  TextIcon,
  WeightScaleIcon
} from '@hugeicons/core-free-icons';
import { Icon } from '../ui';
import { useTheme } from '../../theme';
import type { LessonContent } from '../../lessons';

const EASE = [0.23, 1, 0.32, 1] as const;

export type BoardTab = 'slides' | 'info' | 'map' | 'table';
export const BOARD_TABS: [BoardTab, string, typeof BulbIcon][] = [
  ['slides', 'Slides', PresentationBarChart01Icon],
  ['info', 'Infographic', LeftToRightListBulletIcon],
  ['map', 'Mind map', HierarchyIcon],
  ['table', 'Table', Table01Icon]
];

const STEP_ICONS: Record<string, typeof BulbIcon> = {
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

/* ------------------------------------------------------------------ */
/* Mind map: a tree drawn in SVG, so it can be zoomed and downloaded    */
/* ------------------------------------------------------------------ */

const BRANCH = ['#f59e0b', '#10b981', '#6366f1', '#f43f5e'];

function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  let line = '';
  for (const w of text.split(' ')) {
    if ((line + ' ' + w).trim().length > max && line) {
      out.push(line);
      line = w;
    } else line = (line + ' ' + w).trim();
  }
  if (line) out.push(line);
  return out;
}

/** The map's own size at scale 1, so the panel can fit it to the space it has. */
const MAP_W = 170 + 70 + 220 + 70 + 230 + 20;
/** Width with every branch closed: no detail column. */
const MAP_W_CLOSED = 170 + 70 + 220 + 24;

function MindMap({ map, scale, open, setOpen, svgRef }: { map: LessonContent['map']; scale: number; open: boolean[]; setOpen: (i: number) => void; svgRef?: React.Ref<SVGSVGElement> }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const ink = dark ? '#f7f4ee' : '#1d1a15';
  const soft = dark ? '#b9b2a8' : '#5f594f';
  const tint = dark ? 0.16 : 0.1;

  const ROOT_W = 170, B_W = 220, C_W = 230, GAP = 70, B_H = 62, ROW_GAP = 18, C_GAP = 10;
  const X_B = ROOT_W + GAP, X_C = X_B + B_W + GAP;
  const W = open.some(Boolean) ? MAP_W : MAP_W_CLOSED;

  const layout = useMemo(() => {
    let y = 16;
    const rows = map.branches.map((b, i) => {
      const kids = b.points.slice(1).map(p => {
        const lines = wrap(p, 27);
        return { text: p, lines, h: 20 + lines.length * 18 };
      });
      const kidsH = kids.reduce((n, k) => n + k.h, 0) + Math.max(0, kids.length - 1) * C_GAP;
      const h = open[i] && kids.length ? Math.max(B_H, kidsH) : B_H;
      const row = { y, h, mid: y + h / 2, kids, kidsH };
      y += h + ROW_GAP;
      return row;
    });
    return { rows, H: y - ROW_GAP + 16 };
  }, [map, open]);

  const rootLines = wrap(map.center, 14);
  const rootH = 34 + rootLines.length * 22;
  const rootY = layout.H / 2;
  const hex = (c: string, a: number) => `${c}${Math.round(a * 255).toString(16).padStart(2, '0')}`;

  return (
    <svg ref={svgRef} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${W} ${layout.H}`} width={W * scale} height={layout.H * scale} style={{ fontFamily: 'Geist Variable, Segoe UI, system-ui, sans-serif', overflow: 'visible' }} role="img" aria-label={`Mind map of ${map.center}`}>
      <defs>
        <linearGradient id="mm-root" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd06a" />
          <stop offset="0.55" stopColor="#ffa048" />
          <stop offset="1" stopColor="#ff6b3d" />
        </linearGradient>
        <filter id="mm-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        {BRANCH.map((c, i) => (
          <linearGradient key={c} id={`mm-link-${i}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff8a3d" />
            <stop offset="1" stopColor={c} />
          </linearGradient>
        ))}
      </defs>

      {map.branches.map((b, i) => {
        const c = BRANCH[i % BRANCH.length];
        const r = layout.rows[i];
        let ky = r.y + (r.h - r.kidsH) / 2;
        const canOpen = r.kids.length > 0;
        const subtitle = b.points[0] ?? '';
        return (
          <g key={b.title}>
            {/* link from the centre */}
            <path d={`M${ROOT_W - 6} ${rootY} C ${ROOT_W + GAP * 0.7} ${rootY}, ${X_B - GAP * 0.7} ${r.mid}, ${X_B} ${r.mid}`} fill="none" stroke={`url(#mm-link-${i % BRANCH.length})`} strokeWidth={3.5} strokeLinecap="round" opacity={0.35} />
            <motion.path d={`M${ROOT_W - 6} ${rootY} C ${ROOT_W + GAP * 0.7} ${rootY}, ${X_B - GAP * 0.7} ${r.mid}, ${X_B} ${r.mid}`} fill="none" stroke={`url(#mm-link-${i % BRANCH.length})`} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="6 10" initial={{ strokeDashoffset: 0 }} animate={{ strokeDashoffset: -64 }} transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }} />

            {/* the branch */}
            <motion.g initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.08 * i, ease: EASE }}>
              <rect x={X_B} y={r.mid - B_H / 2} width={B_W} height={B_H} rx={18} fill={hex(c, tint)} stroke={hex(c, 0.75)} strokeWidth={1.5} />
              <circle cx={X_B + 26} cy={r.mid} r={14} fill={c} />
              <text x={X_B + 26} y={r.mid + 5} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">{i + 1}</text>
              <text x={X_B + 50} y={r.mid - 4} fontSize={15.5} fontWeight={700} fill={ink}>{b.title}</text>
              <text x={X_B + 50} y={r.mid + 15} fontSize={12} fill={soft}>{subtitle.length > 26 ? `${subtitle.slice(0, 25)}…` : subtitle}</text>
              {canOpen && (
                <g role="button" tabIndex={0} aria-label={open[i] ? `Close ${b.title}` : `Open ${b.title}`} onClick={() => setOpen(i)} onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setOpen(i)} style={{ cursor: 'pointer' }}>
                  <circle cx={X_B + B_W} cy={r.mid} r={13} fill={c} />
                  <path d={open[i] ? `M${X_B + B_W + 2.5} ${r.mid - 4.5} L${X_B + B_W - 2} ${r.mid} L${X_B + B_W + 2.5} ${r.mid + 4.5}` : `M${X_B + B_W - 2} ${r.mid - 4.5} L${X_B + B_W + 2.5} ${r.mid} L${X_B + B_W - 2} ${r.mid + 4.5}`} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              )}
            </motion.g>

            {/* its details */}
            {open[i] &&
              r.kids.map((k, j) => {
                const top = ky;
                ky += k.h + C_GAP;
                const mid = top + k.h / 2;
                return (
                  <motion.g key={k.text} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.06 * j, ease: EASE }}>
                    <path d={`M${X_B + B_W + 13} ${r.mid} C ${X_B + B_W + 40} ${r.mid}, ${X_C - 34} ${mid}, ${X_C} ${mid}`} fill="none" stroke={c} strokeWidth={2} strokeOpacity={0.7} strokeLinecap="round" />
                    <rect x={X_C} y={top} width={C_W} height={k.h} rx={14} fill={dark ? '#1b1e26' : '#ffffff'} stroke={hex(c, 0.45)} />
                    <circle cx={X_C + 16} cy={top + 20} r={4} fill={c} />
                    {k.lines.map((l, n) => (
                      <text key={n} x={X_C + 28} y={top + 25 + n * 18} fontSize={13.5} fill={ink}>{l}</text>
                    ))}
                  </motion.g>
                );
              })}
          </g>
        );
      })}

      {/* the centre, drawn last so links tuck under it */}
      <g>
        <motion.rect x={4} y={rootY - rootH / 2 + 6} width={ROOT_W - 8} height={rootH - 12} rx={26} fill="#ff8a3d" filter="url(#mm-glow)" animate={{ opacity: [0.45, 0.8, 0.45] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
        <rect x={0} y={rootY - rootH / 2} width={ROOT_W} height={rootH} rx={26} fill="url(#mm-root)" />
        <rect x={10} y={rootY - rootH / 2 + 6} width={ROOT_W - 20} height={rootH / 2 - 6} rx={18} fill="#fff" opacity={0.18} />
        {rootLines.map((l, k) => (
          <text key={k} x={ROOT_W / 2} y={rootY - (rootLines.length - 1) * 11 + k * 22 + 6} textAnchor="middle" fontSize={18} fontWeight={750} fill="#2a1406">{l}</text>
        ))}
      </g>
    </svg>
  );
}

function MindMapPanel({ map, big = false, onFull }: { map: LessonContent['map']; big?: boolean; onFull?: () => void }) {
  const { theme } = useTheme();
  const [open, setOpenAll] = useState<boolean[]>(() => map.branches.map(() => big));
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(big ? 1.2 : 0.7);
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => setOpenAll(map.branches.map(() => big)), [map, big]);
  const width = open.some(Boolean) ? MAP_W : MAP_W_CLOSED;
  // Fit the map to the width it has; zoom works on top of that.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setFit(Math.min(big ? 1.6 : 1.1, Math.max(0.6, (el.clientWidth - 40) / width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [big, width]);
  const scale = fit * zoom;
  const allOpen = open.every(Boolean);
  const download = () => {
    const el = svg.current;
    if (!el) return;
    const copy = el.cloneNode(true) as SVGSVGElement;
    const vb = el.viewBox.baseVal;
    copy.setAttribute('width', String(vb.width * 2));
    copy.setAttribute('height', String(vb.height * 2));
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', '-40');
    bg.setAttribute('y', '-40');
    bg.setAttribute('width', String(vb.width + 80));
    bg.setAttribute('height', String(vb.height + 80));
    bg.setAttribute('fill', theme === 'dark' ? '#0b0d12' : '#fffaf0');
    copy.insertBefore(bg, copy.firstChild);
    copy.setAttribute('viewBox', `-40 -40 ${vb.width + 80} ${vb.height + 80}`);
    const blob = new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${map.center.replace(/[^\w]+/g, '-').toLowerCase()}-mind-map.svg`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const ctl = 'inline-flex h-8 items-center gap-1.5 rounded-full border hairline bg-[var(--card)] px-3 text-xs font-medium hover:border-amy-400 transition-colors';
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-1.5">
        <p className="mr-auto text-sm text-muted">The big picture of {map.center}.</p>
        <button className={ctl} onClick={() => setOpenAll(map.branches.map(() => !allOpen))}>{allOpen ? 'Close all' : 'Open all'}</button>
        <button className={ctl} onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))} aria-label="Zoom out"><Icon icon={MinusSignIcon} size={14} /></button>
        <button className={ctl} onClick={() => setZoom(z => Math.min(2, +(z + 0.15).toFixed(2)))} aria-label="Zoom in"><Icon icon={PlusSignIcon} size={14} /></button>
        {onFull && <button className={ctl} onClick={onFull}><Icon icon={FullScreenIcon} size={14} /> Full screen</button>}
        <button className={ctl} onClick={download}><Icon icon={Download04Icon} size={14} /> Download</button>
      </div>
      <div ref={box} className="relative mt-3 min-h-0 flex-1 overflow-auto rounded-3xl border hairline" style={{ background: theme === 'dark' ? 'radial-gradient(120% 90% at 0% 50%, rgba(255,138,61,.14), transparent 55%), radial-gradient(var(--line) 1px, transparent 1px) 0 0 / 20px 20px, var(--card)' : 'radial-gradient(120% 90% at 0% 50%, rgba(255,160,72,.18), transparent 55%), radial-gradient(var(--line) 1px, transparent 1px) 0 0 / 20px 20px, var(--card)' }}>
        <div className="flex min-h-full min-w-max items-center justify-center p-5">
          <MindMap map={map} scale={scale} open={open} setOpen={i => setOpenAll(o => o.map((v, k) => (k === i ? !v : v)))} svgRef={svg} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The board                                                            */
/* ------------------------------------------------------------------ */

export default function Board({
  c,
  tab,
  setTab,
  wide,
  onWide,
  onCollapse,
  onAsk,
  pop
}: {
  c: LessonContent | undefined;
  tab: BoardTab;
  setTab: (t: BoardTab) => void;
  wide: boolean;
  onWide?: () => void;
  onCollapse?: () => void;
  onAsk: (q: string) => void;
  /** Changes when the table should catch the eye. */
  pop: number;
}) {
  const [s, setS] = useState(0);
  const [dir, setDir] = useState(1);
  const [full, setFull] = useState(false);
  useEffect(() => setS(0), [c]);
  const go = (n: number) => {
    if (!c) return;
    setDir(n);
    setS(v => Math.min(c.slides.length - 1, Math.max(0, v + n)));
  };
  const key = (e: KeyboardEvent) => {
    if (tab !== 'slides') return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  return (
    <div className="flex h-full min-h-0 flex-col" onKeyDown={key} tabIndex={-1}>
      <div className="flex h-12 shrink-0 items-center gap-1 border-b hairline px-2">
        <div className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none]">
          {BOARD_TABS.map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} aria-label={label} title={label} className={`relative inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${tab === id ? 'text-[var(--on-invert)]' : 'text-muted hover:text-[var(--fg)]'}`}>
              {tab === id && <motion.span layoutId="board-tab" className="absolute inset-0 rounded-lg bg-[var(--invert)]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative inline-flex items-center gap-1.5">
                <Icon icon={icon} size={15} />
                <span className={tab === id || wide ? '' : 'hidden 2xl:inline'}>{label}</span>
              </span>
            </button>
          ))}
        </div>
        {onWide && (
          <button onClick={onWide} aria-label={wide ? 'Make the board smaller' : 'Make the board bigger'} className="hidden size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-[var(--card-2)] hover:text-[var(--fg)] lg:grid">
            <Icon icon={wide ? Minimize01Icon : Maximize01Icon} size={16} />
          </button>
        )}
        {onCollapse && (
          <button onClick={onCollapse} aria-label="Hide the board" className="hidden size-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-[var(--card-2)] hover:text-[var(--fg)] lg:grid">
            <Icon icon={SidebarRightIcon} size={16} />
          </button>
        )}
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {!c ? (
          <div className="mt-12 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--card-2)] text-muted"><Icon icon={PresentationBarChart01Icon} size={22} /></span>
            <p className="mx-auto mt-3 max-w-[260px] text-sm text-muted">Slides, an infographic, a mind map and tables appear here when Amy teaches this lesson.</p>
          </div>
        ) : tab === 'slides' ? (
          <div className="flex h-full flex-col">
            <div className="relative flex-1 overflow-hidden rounded-2xl border hairline bg-[var(--card)] [perspective:1200px]" style={{ minHeight: 280 }}>
              <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full glow-amy opacity-60" />
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={s} custom={dir} initial={{ opacity: 0, x: 40 * dir, rotateY: 8 * dir }} animate={{ opacity: 1, x: 0, rotateY: 0 }} exit={{ opacity: 0, x: -40 * dir, rotateY: -8 * dir }} transition={{ duration: 0.35, ease: EASE }} className="relative flex h-full flex-col p-6 sm:p-8">
                  <div className="text-xs font-medium uppercase tracking-wider text-amy-500">Slide {s + 1} of {c.slides.length}</div>
                  <h3 className={`mt-3 font-semibold leading-tight tracking-[-0.02em] ${wide ? 'text-4xl' : 'text-2xl'}`}>{c.slides[s].title}</h3>
                  <ul className="mt-5 flex flex-col gap-3">
                    {c.slides[s].points.map((p, i) => (
                      <motion.li key={p} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }} className={`flex gap-3 leading-relaxed ${wide ? 'text-xl' : 'text-[15.5px]'}`}>
                        <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-amy-500" />
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => go(-1)} disabled={s === 0} className="inline-flex h-9 items-center gap-1 rounded-lg border hairline px-3 text-sm disabled:opacity-35 hover:bg-[var(--card-2)]"><Icon icon={ArrowLeft01Icon} size={15} /> Prev</button>
              <div className="flex gap-1.5">
                {c.slides.map((_, i) => (
                  <button key={i} onClick={() => { setDir(i > s ? 1 : -1); setS(i); }} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === s ? 'w-6 bg-amy-500' : 'w-1.5 bg-[var(--line-2)]'}`} />
                ))}
              </div>
              <button onClick={() => go(1)} disabled={s === c.slides.length - 1} className="inline-flex h-9 items-center gap-1 rounded-lg border hairline px-3 text-sm disabled:opacity-35 hover:bg-[var(--card-2)]">Next <Icon icon={ArrowRight01Icon} size={15} /></button>
            </div>
          </div>
        ) : tab === 'info' ? (
          <div>
            <div className="relative overflow-hidden rounded-2xl bg-[var(--invert)] p-5 text-[var(--on-invert)]">
              <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-amy-500/30 blur-2xl" />
              <div className="relative text-xs font-medium uppercase tracking-wider opacity-70">Step by step</div>
              <h3 className="relative mt-1 text-2xl font-semibold tracking-tight">{c.info.title}</h3>
              <p className="relative mt-1 opacity-80">{c.info.summary}</p>
            </div>
            <ol className={`relative mt-4 grid gap-0 ${wide ? 'sm:grid-cols-2 sm:gap-3' : ''}`}>
              {c.info.steps.map((st, i) => {
                const icon = STEP_ICONS[st.icon] ?? BulbIcon;
                const last = i === c.info.steps.length - 1;
                return (
                  <motion.li key={st.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, duration: 0.4, ease: EASE }} className={`relative flex gap-4 ${wide ? 'rounded-2xl border hairline bg-[var(--card)] p-4' : 'pb-5'}`}>
                    {!wide && !last && <span aria-hidden className="absolute left-[21px] top-12 bottom-0 w-px bg-gradient-to-b from-amy-400/60 to-transparent" />}
                    <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl border border-amy-400/40 bg-amy-400/12 text-amy-600 dark:text-amy-200">
                      <Icon icon={icon} size={20} />
                      <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-[var(--invert)] text-[10px] font-semibold text-[var(--on-invert)]">{i + 1}</span>
                    </span>
                    <div className="min-w-0 pt-0.5">
                      <div className="font-semibold tracking-tight">{st.title}</div>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{st.text}</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {st.tags.map(t => <span key={t} className="rounded-full border hairline bg-[var(--card)] px-2.5 py-0.5 text-xs font-medium">{t}</span>)}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
            <div className="mt-2 flex gap-3 rounded-2xl border border-amy-400/50 bg-amy-400/10 p-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amy-400/20 text-amy-600 dark:text-amy-200"><Icon icon={BulbIcon} size={18} /></span>
              <p className="text-[15px] leading-relaxed"><span className="font-semibold">Remember: </span>{c.info.remember}</p>
            </div>
          </div>
        ) : tab === 'map' ? (
          <MindMapPanel map={c.map} onFull={() => setFull(true)} />
        ) : (
          <motion.div key={pop} initial={pop ? { scale: 0.97, opacity: 0.4 } : false} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-amy-400/15 text-amy-500"><Icon icon={Table01Icon} size={16} /></span>
              <h3 className="text-lg font-semibold tracking-tight">{c.table.title}</h3>
            </div>
            <div className={`mt-3 overflow-x-auto rounded-2xl border hairline bg-[var(--card)] ${pop ? 'ring-2 ring-amy-400/60' : ''}`}>
              <table className="w-full min-w-[420px] border-collapse text-left text-[14.5px]">
                <thead>
                  <tr>
                    {c.table.columns.map((col, i) => (
                      <th key={col} className={`sticky top-0 border-b hairline px-4 py-3 text-xs font-semibold uppercase tracking-wide ${i === c.table.highlight ? 'bg-amy-400/15 text-amy-700 dark:text-amy-200' : 'bg-[var(--bg-2)] text-muted'}`}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.table.rows.map((row, r) => (
                    <motion.tr key={r} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * r }} className="border-b hairline last:border-b-0 hover:bg-[var(--card-2)] transition-colors">
                      {row.map((cell, i) => (
                        <td key={i} className={`px-4 py-2.5 ${i === 0 ? 'font-medium' : ''} ${i === c.table.highlight ? 'bg-amy-400/[.07] font-semibold tabular-nums' : ''}`}>{cell}</td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {c.table.note && <p className="mt-3 rounded-xl bg-[var(--card-2)] px-4 py-3 text-sm leading-relaxed">{c.table.note}</p>}
            <button onClick={() => onAsk('Explain this table')} className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-amy-600 dark:text-amy-200">Ask Amy about this table <Icon icon={ArrowRight02Icon} size={14} /></button>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {full && c && (
          <motion.div className="fixed inset-0 z-[70] grid place-items-center p-3 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button aria-label="Close" onClick={() => setFull(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div role="dialog" aria-label="Mind map" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="site relative flex h-full max-h-[90dvh] w-full max-w-6xl flex-col rounded-3xl border border-[var(--line-2)] bg-[var(--bg)] p-4 shadow-2xl sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold tracking-tight">Mind map · {c.map.center}</h2>
                <button onClick={() => setFull(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-[var(--card-2)]"><Icon icon={Cancel01Icon} size={18} /></button>
              </div>
              <div className="min-h-0 flex-1"><MindMapPanel map={c.map} big /></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
