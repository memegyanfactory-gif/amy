import { useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUp02Icon, CheckmarkCircle02Icon, Mic01Icon, Notebook01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';
import { Icon } from './ui';

const EASE = [0.23, 1, 0.32, 1] as const;

/** A composer that types example questions by itself. */
export function TypedAsk() {
  const lines = ['Solve 3x + 7 = 22', 'Why does the moon change shape?', 'What is the mole concept?', 'Explain photosynthesis simply'];
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [n, setN] = useState(reduce ? lines[0].length : 0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const full = lines[i].length;
    const t = setTimeout(
      () => {
        if (!del && n < full) setN(n + 1);
        else if (!del) setDel(true);
        else if (n > 0) setN(n - 1);
        else {
          setDel(false);
          setI((i + 1) % lines.length);
        }
      },
      !del && n === full ? 1500 : del ? 22 : 55
    );
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, del, i, reduce]);
  return (
    <div className="w-full max-w-md rounded-xl border hairline bg-[var(--card)] shadow-[0_18px_40px_-24px_rgba(0,0,0,.6)]">
      <div className="px-4 pt-3.5 pb-2 text-[15px] min-h-[44px]">
        {lines[i].slice(0, n)}
        <motion.span aria-hidden className="inline-block w-[2px] h-[17px] translate-y-[3px] ml-0.5 bg-amy-500" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />
      </div>
      <div className="flex items-center gap-1 px-2 pb-2 text-muted">
        <span className="grid size-8 place-items-center rounded-lg">
          <Icon icon={PlusSignIcon} size={17} />
        </span>
        <span className="grid size-8 place-items-center rounded-lg">
          <Icon icon={Mic01Icon} size={17} />
        </span>
        <span className="ml-auto grid size-8 place-items-center rounded-lg bg-[var(--invert)] text-[var(--on-invert)]">
          <Icon icon={ArrowUp02Icon} size={16} stroke={2} />
        </span>
      </div>
    </div>
  );
}

/** A small graph that keeps redrawing itself. */
export function MiniGraph() {
  const loop = { repeat: Infinity, repeatDelay: 2.2 };
  return (
    <svg viewBox="0 0 260 130" className="w-full max-w-[300px]" aria-hidden>
      {[26, 52, 78, 104].map(y => (
        <line key={y} x1="10" x2="250" y1={y} y2={y} stroke="var(--line)" />
      ))}
      <line x1="10" x2="250" y1="50" y2="50" stroke="var(--muted)" strokeDasharray="3 5" />
      <motion.path d="M14 112 L246 18" fill="none" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 2.6, times: [0, 0.5, 1], ...loop }} />
      <motion.path d="M167 50 V112" fill="none" stroke="var(--color-physics)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: [0, 0, 1, 1] }} transition={{ duration: 2.6, times: [0, 0.55, 0.75, 1], ...loop }} />
      <motion.circle cx="167" cy="50" r="5.5" fill="#ff8a3d" stroke="var(--card)" strokeWidth="2.5" initial={{ scale: 0 }} animate={{ scale: [0, 0, 1.3, 1, 1] }} transition={{ duration: 2.6, times: [0, 0.5, 0.6, 0.7, 1], ...loop }} style={{ transformOrigin: '167px 50px' }} />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1, 1] }} transition={{ duration: 2.6, times: [0, 0.75, 0.85, 1], ...loop }}>
        <rect x="176" y="60" width="50" height="22" rx="6" fill="var(--color-physics)" />
        <text x="201" y="75" textAnchor="middle" fontSize="12" fontWeight="600" fill="#fff">
          x = 5
        </text>
      </motion.g>
    </svg>
  );
}

/** A live-looking voice waveform. */
export function Wave() {
  const reduce = useReducedMotion();
  const bars = Array.from({ length: 30 }, (_, i) => 0.25 + Math.abs(Math.sin(i * 1.7)) * 0.75);
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex items-center gap-[3px] h-16">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="w-[3px] rounded-full bg-gradient-to-t from-amy-600 to-amy-200"
            style={{ height: `${h * 100}%`, originY: 0.5 }}
            animate={reduce ? undefined : { scaleY: [0.3, 1, 0.5, 0.9, 0.3] }}
            transition={{ duration: 1.2 + (i % 5) * 0.18, repeat: Infinity, ease: 'easeInOut', delay: (i % 7) * 0.09 }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="relative flex size-2">
          <span className="absolute inset-0 rounded-full bg-amy-500 animate-ping" />
          <span className="relative size-2 rounded-full bg-amy-500" />
        </span>
        Amy is listening
      </div>
    </div>
  );
}

/** A quick check answering itself, wrong first, then right. */
export function CheckDemo() {
  const reduce = useReducedMotion();
  const [s, setS] = useState(reduce ? 2 : 0);
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setS(v => (v + 1) % 4), s === 0 ? 1400 : s === 3 ? 600 : 1700);
    return () => clearTimeout(t);
  }, [s, reduce]);
  const opt = (label: string, state: 'idle' | 'no' | 'yes') => (
    <motion.div
      animate={state === 'idle' ? { scale: 1 } : { scale: [1, 0.96, 1] }}
      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors duration-300 ${state === 'yes' ? 'border-[var(--right)] bg-[var(--right)]/10' : state === 'no' ? 'border-[var(--notyet)] bg-[var(--notyet)]/10' : 'hairline'}`}
    >
      <span className={`grid size-5 place-items-center rounded-md border text-[10px] font-medium ${state === 'yes' ? 'border-[var(--right)] text-[var(--right)]' : state === 'no' ? 'border-[var(--notyet)] text-[var(--notyet)]' : 'hairline text-muted'}`}>{label[0]}</span>
      {label.slice(2)}
    </motion.div>
  );
  return (
    <div className="w-full max-w-xs">
      <div className="text-sm mb-2.5">3x = 15. What is x?</div>
      <div className="grid gap-2">
        {opt('A x = 12', s === 1 ? 'no' : 'idle')}
        {opt('B x = 5', s === 2 ? 'yes' : 'idle')}
      </div>
      <div className="h-6 mt-2 text-sm">
        <AnimatePresence mode="wait">
          {s === 1 && (
            <motion.span key="n" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[var(--notyet)]">
              Not yet. Divide, don't subtract.
            </motion.span>
          )}
          {s === 2 && (
            <motion.span key="y" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[var(--right)]">
              Right.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Mistakes return on a schedule. */
export function Spaced() {
  const stops = ['Today', 'Tomorrow', '3 days', '1 week'];
  return (
    <div className="w-full max-w-sm">
      <div className="relative h-8">
        <div className="absolute left-3 right-3 top-1/2 h-px bg-[var(--line-2)]" />
        <motion.div className="absolute left-3 right-3 top-1/2 h-0.5 -translate-y-1/2 origin-left bg-gradient-to-r from-amy-200 to-amy-600" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ duration: 2.4, ease: 'easeInOut' }} />
        <div className="absolute inset-0 flex justify-between items-center">
          {stops.map((s, i) => (
            <motion.span key={s} className="size-6 rounded-full border-2 border-amy-500 bg-[var(--card)] grid place-items-center" initial={{ scale: 0.6, opacity: 0.4 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ delay: i * 0.8, type: 'spring', stiffness: 300, damping: 16 }}>
              <motion.span className="size-2.5 rounded-full bg-amy-500" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, amount: 0.8 }} transition={{ delay: 0.15 + i * 0.8 }} />
            </motion.span>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted">
        {stops.map(s => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </div>
  );
}

/** Notes on the left become lessons on the right. */
export function NotesToCourse() {
  const lessons = ['Cell membrane and wall', 'Nucleus and DNA', 'Mitochondria: the powerhouse'];
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 w-full">
      <div className="relative w-24 h-28 shrink-0">
        {[0, 1, 2].map(i => (
          <motion.div key={i} className="absolute inset-0 rounded-lg border hairline bg-[var(--card)] p-2.5 flex flex-col gap-1.5" style={{ rotate: (i - 1) * 7, x: (i - 1) * 8 }} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
            {i === 2 && <Icon icon={Notebook01Icon} size={16} className="text-amy-500" />}
            {[70, 90, 55, 80].map((w, j) => (
              <span key={j} className="h-1 rounded-full bg-[var(--line-2)]" style={{ width: `${w}%` }} />
            ))}
          </motion.div>
        ))}
      </div>
      <svg viewBox="0 0 60 20" className="w-10 sm:w-16 shrink-0" aria-hidden>
        <motion.path d="M2 10 H52 M44 3 L53 10 L44 17" fill="none" stroke="#ff8a3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.8 }} />
      </svg>
      <div className="flex flex-col gap-2 min-w-0 flex-1 max-w-[260px]">
        {lessons.map((l, i) => (
          <motion.div key={l} className="flex items-center gap-2.5 rounded-lg border hairline bg-[var(--card)] px-3 py-2 text-sm" initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 1.1 + i * 0.2, ease: EASE }}>
            <Icon icon={CheckmarkCircle02Icon} size={16} className="text-[var(--right)] shrink-0" />
            <span className="truncate">{l}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Tile({ title, text, children, className = '', wide = false }: { title: string; text: string; children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, ease: EASE }}
      className={`group card overflow-hidden flex ${wide ? 'flex-col md:flex-row' : 'flex-col'} hover:border-[var(--line-2)] transition-colors ${className}`}
    >
      <div className={`grid place-items-center bg-[var(--bg-2)] p-6 ${wide ? 'md:flex-1 border-b md:border-b-0 md:border-r' : 'h-52 border-b'} hairline`}>{children}</div>
      <div className={`p-6 ${wide ? 'md:w-[340px] md:self-center' : ''}`}>
        <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mt-1.5 text-muted leading-relaxed text-[15px]">{text}</p>
      </div>
    </motion.article>
  );
}

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t hairline">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div key={it.q} className="border-b hairline">
            <button onClick={() => setOpen(on ? null : i)} aria-expanded={on} className="flex w-full items-center justify-between gap-6 py-5 text-left text-[17px] font-medium">
              {it.q}
              <motion.span animate={{ rotate: on ? 45 : 0 }} transition={{ duration: 0.25 }} className="shrink-0 text-muted">
                <Icon icon={PlusSignIcon} size={20} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                  <p className="pb-6 pr-10 text-muted leading-relaxed max-w-2xl">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
