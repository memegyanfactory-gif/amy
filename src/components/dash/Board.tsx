import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  ArrowExpand01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowShrink02Icon,
  Cancel01Icon,
  Download01Icon,
  FullScreenIcon,
  HierarchyIcon,
  Layers01Icon,
  LeftToRightListBulletIcon,
  Loading03Icon,
  MinusSignIcon,
  PlusSignIcon,
  PresentationBarChart01Icon,
  SidebarRightIcon,
  Table01Icon,
  Tick02Icon
} from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import { Icon } from '../ui';
import { useTheme } from '../../theme';
import type { LessonContent } from '../../lessons';
import { CHALK_YELLOW, HAND_FAMILY, INK, MIND, NOTES, SANS_FAMILY, SLATE, TILT, WOOD, downloadBoard, isFormula, mindLayout, notePath, stepIcon, type ExportKind } from './BoardArt';

const EASE = [0.23, 1, 0.32, 1] as const;

export type BoardTab = 'slides' | 'info' | 'map' | 'table';
export const BOARD_TABS: [BoardTab, string, IconSvgElement][] = [
  ['slides', 'Slides', PresentationBarChart01Icon],
  ['info', 'Infographic', LeftToRightListBulletIcon],
  ['map', 'Mind map', HierarchyIcon],
  ['table', 'Table', Table01Icon]
];

/** A strip of tape holding a sticky note on. */
const Tape = () => <span aria-hidden className="absolute left-1/2 top-[-9px] h-[18px] w-14 -translate-x-1/2 rotate-[-2deg] bg-white/55 shadow-sm" />;

/** The small handwritten label over a heading, as on the rest of the site. */
const Eyebrow = ({ children }: { children: string }) => <div className="hand inline-block -rotate-1 text-[22px] leading-none text-amy-600 dark:text-amy-400">{children}</div>;

const iconBtn = 'grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-[var(--card-2)] hover:text-[var(--fg)] disabled:pointer-events-none disabled:opacity-40';

/* ------------------------------------------------------------------ */
/* Slides: Amy's chalkboard                                             */
/* ------------------------------------------------------------------ */

function SlidesPanel({ c, s, dir, go, jump, wide }: { c: LessonContent; s: number; dir: number; go: (n: number) => void; jump: (i: number) => void; wide: boolean }) {
  const slide = c.slides[s];
  const last = c.slides.length - 1;
  return (
    <div className="flex flex-col gap-6">
      {/* the board in its wooden frame, with the chalk tray underneath */}
      <div className="rounded-[18px] p-[7px] shadow-[0_2px_0_#8f6238,0_28px_50px_-28px_rgba(0,0,0,.65)]" style={{ background: WOOD }}>
        <div className={`relative overflow-hidden rounded-[12px] text-[#f4f1e6] shadow-[inset_0_0_0_2px_rgba(0,0,0,.25),inset_0_0_60px_rgba(0,0,0,.3)] ${wide ? 'min-h-[440px] px-10 pb-12 pt-7' : 'min-h-[310px] px-6 pb-10 pt-5'}`} style={{ background: SLATE }}>
          <div className={`hand leading-none text-[#f4f1e6]/55 ${wide ? 'text-2xl' : 'text-lg'}`}>
            Slide {s + 1} of {c.slides.length}
          </div>
          <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div key={s} custom={dir} initial={{ opacity: 0, x: 14 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 * dir, filter: 'blur(5px)' }} transition={{ duration: 0.26, ease: EASE }}>
              {/* written left to right, like chalk */}
              <motion.h3 initial={{ clipPath: 'inset(-25% 100% -35% 0%)' }} animate={{ clipPath: 'inset(-25% -10% -35% 0%)' }} transition={{ duration: 0.6, ease: 'easeOut' }} className={`hand mt-2 leading-[1.02] [text-shadow:0_0_1px_rgba(244,241,230,.45)] ${wide ? 'text-[54px]' : 'text-[36px]'}`}>
                {slide.title}
              </motion.h3>
              <svg aria-hidden viewBox="0 0 300 12" preserveAspectRatio="none" className={`mt-1 block h-2.5 max-w-full ${wide ? 'w-[340px]' : 'w-[200px]'}`}>
                <motion.path d="M2 8 C 60 2, 120 11, 180 5 S 280 9, 298 4" fill="none" stroke="#f4f1e6" strokeOpacity={0.55} strokeWidth={2.5} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.55, delay: 0.3, ease: 'easeOut' }} />
              </svg>
              <ul className={`flex flex-col ${wide ? 'mt-7 gap-4' : 'mt-5 gap-3'}`}>
                {slide.points.map((p, i) =>
                  isFormula(p) ? (
                    <motion.li key={p} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.12, duration: 0.35, ease: EASE }} className={`hand leading-tight text-[#ffd06a] [text-shadow:0_0_1px_rgba(255,208,106,.5)] ${wide ? 'text-[42px]' : 'text-[30px]'}`}>
                      {p}
                    </motion.li>
                  ) : (
                    <motion.li key={p} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.12, duration: 0.35, ease: EASE }} className={`flex gap-3 leading-relaxed text-[#f4f1e6]/90 ${wide ? 'text-xl' : 'text-[15.5px]'}`}>
                      <span aria-hidden className="mt-[0.62em] size-1.5 shrink-0 rounded-full bg-[#ffd06a]" />
                      {p}
                    </motion.li>
                  )
                )}
              </ul>
            </motion.div>
          </AnimatePresence>
          <span aria-hidden className={`hand absolute bottom-3 right-5 leading-none text-[#f4f1e6]/30 ${wide ? 'text-2xl' : 'text-lg'}`}>Amy</span>
        </div>
        <div className="mt-[7px] flex h-9 items-center gap-1 rounded-[9px] px-1 shadow-[inset_0_2px_4px_rgba(0,0,0,.35),inset_0_-1px_0_rgba(255,255,255,.12)]" style={{ background: 'linear-gradient(180deg,#9a683a,#83552b)' }}>
          <button onClick={() => go(-1)} disabled={s === 0} aria-label="Previous slide" className="grid size-7 place-items-center rounded-md text-[#f4f1e6] transition-colors hover:bg-black/20 disabled:opacity-35">
            <Icon icon={ArrowLeft01Icon} size={16} stroke={2} />
          </button>
          {/* a stick of chalk for each slide */}
          <div className="flex flex-1 items-center justify-center gap-1">
            {c.slides.map((x, i) => (
              <button key={i} onClick={() => jump(i)} aria-label={`Slide ${i + 1}: ${x.title}`} aria-current={i === s ? 'true' : undefined} className="grid h-7 place-items-center rounded-md px-1 transition-colors hover:bg-black/15">
                <span className="block h-2 rounded-full shadow-[0_1px_1px_rgba(0,0,0,.4)] transition-all duration-300" style={{ width: i === s ? 30 : 14, background: i === s ? CHALK_YELLOW : 'rgba(244,241,230,.8)' }} />
              </button>
            ))}
          </div>
          <button onClick={() => go(1)} disabled={s === last} aria-label="Next slide" className="grid size-7 place-items-center rounded-md text-[#f4f1e6] transition-colors hover:bg-black/20 disabled:opacity-35">
            <Icon icon={ArrowRight01Icon} size={16} stroke={2} />
          </button>
        </div>
      </div>

      {/* every slide in the lesson */}
      <div>
        <div className="mb-1.5 flex items-baseline justify-between px-1">
          <span className="text-sm font-medium text-muted">In this lesson</span>
          <span className="text-xs text-muted tabular-nums">{c.slides.length} slides</span>
        </div>
        <ol className="flex flex-col gap-0.5">
          {c.slides.map((x, i) => (
            <li key={x.title}>
              <button onClick={() => jump(i)} aria-current={i === s ? 'true' : undefined} className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${i === s ? 'bg-amy-400/15 font-medium text-[var(--fg)]' : 'text-fg2 hover:bg-[var(--card-2)]'}`}>
                <span className="hand w-5 shrink-0 text-center text-xl leading-none text-amy-500">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">{x.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Infographic: the steps on sticky notes                               */
/* ------------------------------------------------------------------ */

function InfoPanel({ c, wide }: { c: LessonContent; wide: boolean }) {
  return (
    <div>
      <Eyebrow>Step by step</Eyebrow>
      <h3 className="mt-1 text-[26px] font-semibold leading-tight tracking-tight">{c.info.title}</h3>
      <p className="mt-1 text-[15px] leading-relaxed text-muted">{c.info.summary}</p>
      <ol className={`mt-7 grid gap-x-5 gap-y-7 px-1 ${wide ? 'sm:grid-cols-2' : ''}`}>
        {c.info.steps.map((st, i) => {
          const tilt = TILT[i % TILT.length];
          return (
            <motion.li key={st.title} initial={{ opacity: 0, y: 16, rotate: tilt * 3 }} animate={{ opacity: 1, y: 0, rotate: tilt }} whileHover={{ y: -3, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 18, delay: 0.06 * i }} className="sticky-note relative px-4 pb-4 pt-5" style={{ background: NOTES[i % NOTES.length].paper }}>
              <Tape />
              <div className="flex items-start gap-2.5">
                <span className="hand w-6 shrink-0 text-[40px] leading-[0.8] opacity-40">{i + 1}</span>
                <h4 className="hand min-w-0 flex-1 text-[25px] leading-[1.05]">{st.title}</h4>
                <Icon icon={stepIcon(st.icon)} size={20} className="mt-0.5 shrink-0 opacity-55" />
              </div>
              <p className="mt-2 text-[14.5px] leading-relaxed text-black/75">{st.text}</p>
              {st.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {st.tags.map(t => (
                    <span key={t} className="rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-medium text-black/80">
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </motion.li>
          );
        })}
      </ol>
      <div className="mt-8 rounded-2xl border border-amy-400/45 bg-amy-400/[.08] p-4">
        <div className="hand text-2xl leading-none text-amy-600 dark:text-amy-400">Remember</div>
        <p className="mt-2 text-[15px] font-medium leading-[1.75]">
          <span className="box-decoration-clone bg-[linear-gradient(transparent_60%,rgba(255,208,106,.55)_60%,rgba(255,208,106,.55)_94%,transparent_94%)] px-0.5 dark:bg-[linear-gradient(transparent_60%,rgba(255,160,72,.3)_60%,rgba(255,160,72,.3)_94%,transparent_94%)]">{c.info.remember}</span>
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mind map: the topic in the middle, a sticky note for each branch     */
/* ------------------------------------------------------------------ */

function MindMap({ map, scale }: { map: LessonContent['map']; scale: number }) {
  const { theme } = useTheme();
  const uid = useId().replace(/:/g, '');
  const L = useMemo(() => mindLayout(map), [map]);
  const M = MIND;
  const r = L.root;
  const radius = Math.min(r.h / 2, 26);
  const label = `Mind map of ${map.center}. ${map.branches.map(b => `${b.title}: ${b.points.join(', ')}`).join('. ')}.`;
  return (
    <svg viewBox={`0 0 ${L.W} ${L.H}`} width={L.W * scale} height={L.H * scale} role="img" aria-label={label} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`${uid}-root`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd06a" />
          <stop offset="0.55" stopColor="#ffa048" />
          <stop offset="1" stopColor="#ff6b3d" />
        </linearGradient>
        <filter id={`${uid}-note`} x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor={theme === 'dark' ? '#000' : '#46300a'} floodOpacity={theme === 'dark' ? 0.45 : 0.18} />
        </filter>
        <filter id={`${uid}-glow`} x="-30%" y="-60%" width="160%" height="220%">
          <feDropShadow dx="0" dy="3" stdDeviation="9" floodColor="#ff8a3d" floodOpacity={0.55} />
        </filter>
      </defs>

      {L.notes.map((n, i) => (
        <motion.path key={`link-${i}`} d={n.link} fill="none" stroke={NOTES[n.color].ink} strokeWidth={2.6} strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.55, delay: 0.15 + i * 0.08, ease: 'easeOut' }} />
      ))}

      {L.notes.map((n, i) => {
        const cx = n.x + n.w / 2;
        const cy = n.y + n.h / 2;
        let py = n.y + M.padTop + n.title.length * M.titleLH + M.titleGap;
        return (
          <motion.g key={n.title.join(' ')} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 + i * 0.07, ease: EASE }}>
            <g transform={`rotate(${n.tilt} ${cx} ${cy})`}>
              <path d={notePath(n.x, n.y, n.w, n.h)} fill={NOTES[n.color].paper} filter={`url(#${uid}-note)`} />
              <rect x={cx - 24} y={n.y - 7} width={48} height={14} fill="#fff" opacity={0.55} transform={`rotate(-2.5 ${cx} ${n.y})`} />
              {n.title.map((l, j) => (
                <text key={j} x={n.x + M.padX} y={n.y + M.padTop + 18 + j * M.titleLH} fontFamily={HAND_FAMILY} fontWeight={600} fontSize={M.titleSize} fill={INK}>
                  {l}
                </text>
              ))}
              {n.points.map((ls, j) => {
                const top = py;
                py += ls.length * M.lineH + M.pointGap;
                return (
                  <g key={j}>
                    <circle cx={n.x + M.padX + 3} cy={top + M.lineH - 8.5} r={2.4} fill={NOTES[n.color].ink} />
                    {ls.map((l, k) => (
                      <text key={k} x={n.x + M.padX + 12} y={top + (k + 1) * M.lineH - 4} fontFamily={SANS_FAMILY} fontSize={M.pointSize} fill={INK} fillOpacity={0.82}>
                        {l}
                      </text>
                    ))}
                  </g>
                );
              })}
            </g>
          </motion.g>
        );
      })}

      {/* the topic, drawn last so the links tuck under it */}
      <motion.g initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}>
        <rect x={r.x} y={r.y} width={r.w} height={r.h} rx={radius} fill={`url(#${uid}-root)`} filter={`url(#${uid}-glow)`} />
        <rect x={r.x + 10} y={r.y + 5} width={r.w - 20} height={r.h / 2 - 5} rx={Math.max(4, radius - 8)} fill="#fff" opacity={0.18} />
        {r.lines.map((l, j) => (
          <text key={j} x={r.x + r.w / 2} y={r.y + r.h / 2 + (j - (r.lines.length - 1) / 2) * 28 + 9} textAnchor="middle" fontFamily={HAND_FAMILY} fontWeight={600} fontSize={28} fill="#2a1406">
            {l}
          </text>
        ))}
      </motion.g>
    </svg>
  );
}

function MindMapPanel({ map, big = false, onFull }: { map: LessonContent['map']; big?: boolean; onFull?: () => void }) {
  const { theme } = useTheme();
  const L = useMemo(() => mindLayout(map), [map]);
  const [zoom, setZoom] = useState(1);
  const [fit, setFit] = useState(1);
  const box = useRef<HTMLDivElement>(null);
  // Fit the map to the space it has; zoom works on top of that.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = (el.clientWidth - 36) / L.W;
      const h = big ? (el.clientHeight - 36) / L.H : Infinity;
      setFit(Math.max(0.6, Math.min(big ? 2.4 : 1.6, w, h)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [big, L]);
  const glow = theme === 'dark' ? 'rgba(255,138,61,.13)' : 'rgba(255,160,72,.2)';
  const ctl = `${iconBtn} border hairline bg-[var(--card)]`;
  const controls = (
    <div className="flex items-center gap-1">
      <button className={ctl} onClick={() => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)))} disabled={zoom <= 0.5} aria-label="Zoom out" title="Zoom out">
        <Icon icon={MinusSignIcon} size={15} />
      </button>
      <button className={ctl} onClick={() => setZoom(z => Math.min(2.2, +(z + 0.15).toFixed(2)))} disabled={zoom >= 2.2} aria-label="Zoom in" title="Zoom in">
        <Icon icon={PlusSignIcon} size={15} />
      </button>
      {onFull && (
        <button className={ctl} onClick={onFull} aria-label="Full screen" title="Full screen">
          <Icon icon={FullScreenIcon} size={15} />
        </button>
      )}
    </div>
  );
  return (
    <div className="flex h-full min-h-0 flex-col">
      {!big && (
        <div className="mb-4 flex items-end gap-1">
          <div className="mr-auto min-w-0">
            <Eyebrow>The big picture</Eyebrow>
            <h3 className="mt-1 truncate text-[22px] font-semibold leading-tight tracking-tight">{map.center}</h3>
          </div>
          {controls}
        </div>
      )}
      <div className="relative min-h-[380px] flex-1">
        <div ref={box} className="absolute inset-0 overflow-auto rounded-2xl border hairline" style={{ background: `radial-gradient(60% 45% at 50% 50%, ${glow}, transparent 70%), radial-gradient(var(--line) 1.2px, transparent 1.2px) 0 0 / 22px 22px, var(--card)` }}>
          <div className="flex min-h-full min-w-max items-center justify-center p-[18px]">
            <MindMap map={map} scale={fit * zoom} />
          </div>
        </div>
        {big && <div className="absolute right-3 top-3">{controls}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Table                                                                */
/* ------------------------------------------------------------------ */

function TablePanel({ c, pop, flash, onAsk }: { c: LessonContent; pop: number; flash: boolean; onAsk: (q: string) => void }) {
  const t = c.table;
  return (
    <div>
      <Eyebrow>Side by side</Eyebrow>
      <h3 className="mt-1 text-[22px] font-semibold leading-tight tracking-tight">{t.title}</h3>
      {/* a ring that fades, when Amy has just put this table on the board */}
      <motion.div key={pop} animate={flash ? { boxShadow: ['0 0 0 3px rgba(255,160,72,.75)', '0 0 0 3px rgba(255,160,72,.75)', '0 0 0 0px rgba(255,160,72,0)'] } : undefined} transition={{ duration: 2.2, times: [0, 0.6, 1] }} className="mt-4 overflow-x-auto rounded-2xl border hairline bg-[var(--card)]">
        <table className="w-full border-collapse text-left text-[14px]">
          <thead>
            <tr>
              {t.columns.map((col, i) => (
                <th key={col} scope="col" className={`hand border-b hairline px-3 pb-2 pt-2.5 align-bottom text-[19px] font-semibold leading-[1.1] ${i === 0 ? 'whitespace-nowrap' : ''} ${i === t.highlight ? 'bg-amy-400/15 text-amy-600 dark:text-amy-200' : 'bg-[var(--bg-2)] text-fg2'}`}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.rows.map((row, r) => (
              <motion.tr key={r} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * r }} className="border-b hairline transition-colors last:border-b-0 hover:bg-[var(--card-2)]">
                {row.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row" className={`px-3 py-2.5 font-medium ${i === t.highlight ? 'bg-amy-400/[.08]' : ''}`}>
                      {cell}
                    </th>
                  ) : (
                    <td key={i} className={`px-3 py-2.5 tabular-nums ${i === t.highlight ? 'bg-amy-400/[.08] font-semibold' : 'text-fg2'}`}>
                      {cell}
                    </td>
                  )
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
      {t.note && (
        <div className="sticky-note relative mx-1 mt-7 -rotate-1 px-4 pb-4 pt-5 text-[14.5px] leading-relaxed" style={{ background: NOTES[0].paper }}>
          <Tape />
          {t.note}
        </div>
      )}
      <button onClick={() => onAsk('Explain this table')} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-amy-600 dark:text-amy-200">
        Ask Amy about this table <Icon icon={ArrowRight02Icon} size={14} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Download as JPG                                                      */
/* ------------------------------------------------------------------ */

type DownloadItem = { kind: ExportKind; tab: BoardTab; label: string; hint: string; icon: IconSvgElement };

function DownloadMenu({ items, tab, busy, saved, failed, onPick, wide }: { items: DownloadItem[]; tab: BoardTab; busy: ExportKind | null; saved: ExportKind | null; failed: boolean; onPick: (k: ExportKind) => Promise<boolean>; wide: boolean }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      btn.current?.focus();
    };
    window.addEventListener('pointerdown', away);
    window.addEventListener('keydown', esc);
    const first = requestAnimationFrame(() => menu.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus());
    return () => {
      window.removeEventListener('pointerdown', away);
      window.removeEventListener('keydown', esc);
      cancelAnimationFrame(first);
    };
  }, [open]);

  const move = (e: ReactKeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    e.stopPropagation();
    const all = [...(menu.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])];
    const at = all.indexOf(document.activeElement as HTMLButtonElement);
    all[(at + (e.key === 'ArrowDown' ? 1 : all.length - 1)) % all.length]?.focus();
  };

  const done = saved !== null;
  return (
    <div ref={wrap} className="relative shrink-0">
      <button ref={btn} onClick={() => setOpen(o => !o)} disabled={!items.length} aria-haspopup="menu" aria-expanded={open} aria-label="Download as JPG" title="Download as JPG" className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm transition-colors disabled:opacity-40 ${open ? 'bg-[var(--card-2)] text-[var(--fg)]' : 'text-muted hover:bg-[var(--card-2)] hover:text-[var(--fg)]'}`}>
        <Icon icon={busy ? Loading03Icon : done ? Tick02Icon : Download01Icon} size={16} className={busy ? 'animate-spin' : done ? 'text-[var(--right)]' : ''} />
        {wide && <span>{done ? 'Saved' : 'Download'}</span>}
      </button>
      <span className="sr-only" aria-live="polite">
        {done ? 'Saved as a JPG.' : failed ? 'The download did not work. Try again.' : ''}
      </span>
      <AnimatePresence>
        {open && (
          <motion.div ref={menu} role="menu" aria-label="Download as JPG" onKeyDown={move} initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.16 }} className="absolute right-0 top-10 z-40 w-[268px] origin-top-right rounded-2xl border border-[var(--line-2)] bg-[var(--card)] p-1.5 shadow-[0_30px_70px_-20px_rgba(0,0,0,.5)]">
            <div className="flex items-center justify-between px-2.5 pb-1 pt-1.5">
              <span className="text-xs font-medium text-muted">Download as JPG</span>
              <span className="hand text-lg leading-none text-amy-600 dark:text-amy-400">keep a copy</span>
            </div>
            {items.map(it => (
              <button key={it.kind} role="menuitem" disabled={!!busy} onClick={async () => (await onPick(it.kind)) && setOpen(false)} className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-[var(--card-2)] disabled:cursor-wait ${it.tab === tab ? 'bg-amy-400/10' : ''}`}>
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-amy-400/15 text-amy-600 dark:text-amy-400">
                  <Icon icon={it.icon} size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{it.label}</span>
                  <span className="block truncate text-xs text-muted">{it.hint}</span>
                </span>
                {busy === it.kind && <Icon icon={Loading03Icon} size={15} className="animate-spin text-muted" />}
              </button>
            ))}
            {failed && <p className="px-2.5 pb-1.5 pt-1 text-xs text-[var(--notyet)]">That did not work. Try again.</p>}
          </motion.div>
        )}
      </AnimatePresence>
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
  pop,
  title,
  course
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
  /** The lesson and course, for the downloads. */
  title?: string;
  course?: string;
}) {
  const { theme } = useTheme();
  const uid = useId();
  const [s, setS] = useState(0);
  const [dir, setDir] = useState(1);
  const [full, setFull] = useState(false);
  const [busy, setBusy] = useState<ExportKind | null>(null);
  const [saved, setSaved] = useState<ExportKind | null>(null);
  const [failed, setFailed] = useState(false);
  const [seenPop, setSeenPop] = useState(0);
  useEffect(() => {
    setS(0);
    setSeenPop(0);
  }, [c]);
  // Flash the table once each time Amy puts it on the board, not every time the tab is opened.
  const flash = tab === 'table' && pop > seenPop;
  useEffect(() => {
    if (!flash) return;
    const t = window.setTimeout(() => setSeenPop(pop), 2300);
    return () => window.clearTimeout(t);
  }, [flash, pop]);

  const go = (n: number) => {
    if (!c) return;
    setDir(n);
    setS(v => Math.min(c.slides.length - 1, Math.max(0, v + n)));
  };
  const jump = (i: number) => {
    setDir(i >= s ? 1 : -1);
    setS(i);
  };
  const key = (e: ReactKeyboardEvent) => {
    if (tab !== 'slides' || (e.target as HTMLElement).closest('[role="menu"]')) return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };

  const save = async (kind: ExportKind) => {
    if (!c || busy) return false;
    setBusy(kind);
    setFailed(false);
    try {
      await downloadBoard(kind, c, { lesson: title || c.info.title, course, slide: s, dark: theme === 'dark' });
      setSaved(kind);
      window.setTimeout(() => setSaved(k => (k === kind ? null : k)), 2000);
      return true;
    } catch (err) {
      console.error(err);
      setFailed(true);
      return false;
    } finally {
      setBusy(null);
    }
  };

  const items: DownloadItem[] = c
    ? [
        { kind: 'slide', tab: 'slides', label: 'This slide', hint: `Slide ${s + 1}: ${c.slides[s]?.title ?? ''}`, icon: PresentationBarChart01Icon },
        { kind: 'slides', tab: 'slides', label: 'All slides', hint: `${c.slides.length} slides on one page`, icon: Layers01Icon },
        { kind: 'info', tab: 'info', label: 'Infographic', hint: `${c.info.steps.length} steps and the one to remember`, icon: LeftToRightListBulletIcon },
        { kind: 'map', tab: 'map', label: 'Mind map', hint: `${c.map.branches.length} branches around ${c.map.center}`, icon: HierarchyIcon },
        { kind: 'table', tab: 'table', label: 'Table', hint: c.table.title, icon: Table01Icon }
      ]
    : [];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-full min-h-0 flex-col" onKeyDown={key} tabIndex={-1}>
        {/* tabs, matching the Lesson and Voice call tabs beside them */}
        <div className="flex h-11 shrink-0 items-center gap-0.5 border-b hairline pl-1.5 pr-2">
          <div role="tablist" aria-label="Board" className="flex h-full min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {BOARD_TABS.map(([id, label]) => (
              <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`relative h-full shrink-0 whitespace-nowrap px-2.5 text-sm transition-colors ${tab === id ? 'font-medium text-[var(--fg)]' : 'text-muted hover:text-[var(--fg)]'}`}>
                {label}
                {tab === id && <motion.span layoutId={`${uid}-board-tab`} className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-amy-500" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              </button>
            ))}
          </div>
          <DownloadMenu items={items} tab={tab} busy={busy} saved={saved} failed={failed} onPick={save} wide={wide} />
          {onWide && (
            <button onClick={onWide} aria-label={wide ? 'Make the board smaller' : 'Make the board bigger'} title={wide ? 'Make the board smaller' : 'Make the board bigger'} className={`${iconBtn} hidden lg:grid`}>
              <Icon icon={wide ? ArrowShrink02Icon : ArrowExpand01Icon} size={16} />
            </button>
          )}
          {onCollapse && (
            <button onClick={onCollapse} aria-label="Hide the board" title="Hide the board" className={`${iconBtn} hidden lg:grid`}>
              <Icon icon={SidebarRightIcon} size={16} />
            </button>
          )}
        </div>

        <div role="tabpanel" aria-label={BOARD_TABS.find(([id]) => id === tab)?.[1]} className="relative min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {!c ? (
            <div className="mt-12 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--card-2)] text-muted">
                <Icon icon={PresentationBarChart01Icon} size={22} />
              </span>
              <p className="mx-auto mt-3 max-w-[260px] text-sm text-muted">Slides, an infographic, a mind map and tables appear here when Amy teaches this lesson.</p>
            </div>
          ) : tab === 'slides' ? (
            <SlidesPanel c={c} s={s} dir={dir} go={go} jump={jump} wide={wide} />
          ) : tab === 'info' ? (
            <InfoPanel c={c} wide={wide} />
          ) : tab === 'map' ? (
            <MindMapPanel map={c.map} onFull={() => setFull(true)} />
          ) : (
            <TablePanel c={c} pop={pop} flash={flash} onAsk={onAsk} />
          )}
        </div>

        <AnimatePresence>
          {full && c && (
            <motion.div className="fixed inset-0 z-[70] grid place-items-center p-3 sm:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button aria-label="Close" onClick={() => setFull(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <motion.div role="dialog" aria-label={`Mind map of ${c.map.center}`} initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 26 }} className="site relative flex h-full max-h-[90dvh] w-full max-w-6xl flex-col rounded-3xl border border-[var(--line-2)] bg-[var(--bg)] p-4 shadow-2xl sm:p-6">
                <div className="mb-4 flex items-end gap-2">
                  <div className="mr-auto min-w-0">
                    <Eyebrow>The big picture</Eyebrow>
                    <h2 className="mt-1 truncate text-2xl font-semibold tracking-tight">{c.map.center}</h2>
                  </div>
                  <button onClick={() => save('map')} disabled={!!busy} className="btn btn-ghost !min-h-9 shrink-0 text-sm">
                    <Icon icon={busy === 'map' ? Loading03Icon : saved === 'map' ? Tick02Icon : Download01Icon} size={16} className={busy === 'map' ? 'animate-spin' : saved === 'map' ? 'text-[var(--right)]' : ''} />
                    {saved === 'map' ? 'Saved' : 'Download JPG'}
                  </button>
                  <button onClick={() => setFull(false)} aria-label="Close" className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-[var(--card-2)]">
                    <Icon icon={Cancel01Icon} size={18} />
                  </button>
                </div>
                <div className="min-h-0 flex-1">
                  <MindMapPanel map={c.map} big />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
