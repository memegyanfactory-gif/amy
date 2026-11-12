import { useMemo, useRef, useState } from 'react';
import { motion, useInView, useScroll, useTransform, type MotionValue } from 'motion/react';
import WarpImage from '../bits/WarpImage';
import CountUp from '../bits/CountUp';
import { art } from './ui';

const EASE = [0.23, 1, 0.32, 1] as const;
const wrap = 'mx-auto w-full max-w-6xl px-5 sm:px-8';

/* ------------------------------------------------------------------ */
/* Students, teachers and parents: a gallery that bends as you scroll    */
/* ------------------------------------------------------------------ */

const PEOPLE: { img: string; who: string; line: string; tall?: boolean }[][] = [
  [
    { img: 'people1', who: 'Students', line: 'Ask any doubt, any time, and get it one step at a time.', tall: true },
    { img: 'people4', who: 'Friends', line: 'Revise together with games like Spot Amy’s mistake.' }
  ],
  [
    { img: 'people2', who: 'Teachers', line: 'Set courses for each class and see who needs help.' },
    { img: 'people5', who: 'Parents', line: 'Late-night doubts get a calm explanation, not just the answer.', tall: true }
  ],
  [
    { img: 'people3', who: 'Parents', line: 'A patient tutor at home. Free to start, no card needed.', tall: true },
    { img: 'people6', who: 'Teachers', line: 'Progress, quiz results and conversations, for every student.' }
  ]
];

const FACTS: [number, string, string][] = [
  [16, '', 'countries and their boards'],
  [20, '', 'languages, 10 Indian ones spoken aloud'],
  [12, '+NEET', 'classes, from Class 1 up'],
  [10, '', 'things free, no card needed']
];

function Column({ items, y }: { items: (typeof PEOPLE)[number]; y: MotionValue<string> }) {
  return (
    <motion.div style={{ y }} className="flex flex-col gap-5">
      {items.map(p => (
        <figure key={p.img} className="group">
          <div className="relative overflow-hidden rounded-3xl">
            <WarpImage src={art(p.img)} alt={`${p.who} learning with Amy`} className={p.tall ? 'aspect-[3/4]' : 'aspect-[4/3]'} blur={p.tall ? 1.4 : 0.7} />
            <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">{p.who}</span>
          </div>
          <figcaption className="mt-2.5 px-1 text-[15px] leading-snug text-muted transition-colors group-hover:text-[var(--fg)]">{p.line}</figcaption>
        </figure>
      ))}
    </motion.div>
  );
}

export function People() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const a = useTransform(scrollYProgress, [0, 1], ['6%', '-10%']);
  const b = useTransform(scrollYProgress, [0, 1], ['16%', '-4%']);
  const c = useTransform(scrollYProgress, [0, 1], ['2%', '-14%']);
  return (
    <section ref={ref} className="relative overflow-hidden py-24 sm:py-32">
      <div className={wrap}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: EASE }} className="max-w-2xl">
          <div className="hand text-2xl text-amy-500 -rotate-1 inline-block">Students, teachers and parents</div>
          <h2 className="mt-2 text-4xl font-semibold leading-[1.06] tracking-[-0.035em] sm:text-5xl">
            Made for everyone who <span className="serif">helps a child learn.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">Students who ask, teachers who guide, and parents who cheer them on.</p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Column items={PEOPLE[0]} y={a} />
          <Column items={PEOPLE[1]} y={b} />
          <div className="sm:col-span-2 lg:col-span-1">
            <Column items={PEOPLE[2]} y={c} />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border hairline bg-[var(--line)] lg:grid-cols-4">
          {FACTS.map(([n, suffix, label]) => (
            <div key={label} className="bg-[var(--bg)] p-6 sm:p-8">
              <div className="text-4xl font-semibold tracking-[-0.04em] tabular-nums sm:text-5xl">
                <CountUp to={n} duration={1.6} />
                <span className="text-amy-500">{suffix}</span>
              </div>
              <div className="mt-2 text-sm text-muted">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why it sticks: the forgetting curve, with and without review          */
/* ------------------------------------------------------------------ */

const DAYS = 30;
const REVIEWS = [1, 3, 7, 14];
/** Memory after reading once: a power-law forgetting curve. */
const once = (t: number) => 100 / Math.pow(1 + 0.9 * t, 0.6);
/** Memory with a check and spaced revision: each review restores it and slows the next fall. */
function withAmy(t: number) {
  const ks = [0.9, 0.35, 0.16, 0.07, 0.03];
  let last = 0;
  let i = 0;
  for (const r of REVIEWS) {
    if (t < r) break;
    last = r;
    i++;
  }
  return 100 / Math.pow(1 + ks[i] * (t - last), 0.6);
}

export function Memory() {
  const W = 640, H = 316, PL = 44, PR = 18, PT = 34, PB = 34;
  const x = (d: number) => PL + (d / DAYS) * (W - PL - PR);
  const y = (v: number) => PT + (1 - v / 100) * (H - PT - PB);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [day, setDay] = useState<number | null>(null);

  const paths = useMemo(() => {
    const pts = (f: (t: number) => number) => {
      const out: string[] = [];
      for (let i = 0; i <= DAYS * 10; i++) {
        const t = i / 10;
        // a vertical jump at each review, so the refresh shows clearly
        if (f === withAmy && REVIEWS.includes(t)) out.push(`L${x(t)} ${y(withAmy(t - 0.0001))}`);
        out.push(`${out.length ? 'L' : 'M'}${x(t).toFixed(1)} ${y(f(t)).toFixed(1)}`);
      }
      return out.join(' ');
    };
    const a = pts(once);
    const b = pts(withAmy);
    const area = `${b} L${x(DAYS)} ${y(once(DAYS))} ${Array.from({ length: DAYS * 10 + 1 }, (_, i) => DAYS - i / 10)
      .map(t => `L${x(t).toFixed(1)} ${y(once(t)).toFixed(1)}`)
      .join(' ')} Z`;
    return { a, b, area };
  }, []);

  const d = day ?? 30;
  const move = (clientX: number) => {
    const svg = ref.current?.querySelector('svg');
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const px = ((clientX - r.left) / r.width) * W;
    setDay(Math.max(0, Math.min(DAYS, Math.round(((px - PL) / (W - PL - PR)) * DAYS))));
  };

  return (
    <section className="border-y hairline bg-[var(--bg-2)]">
      <div className={`${wrap} grid items-center gap-12 py-24 sm:py-32 lg:grid-cols-[1fr_1.25fr] lg:gap-16`}>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: EASE }}>
          <div className="hand text-2xl text-amy-500 -rotate-1 inline-block">Why it sticks</div>
          <h2 className="mt-2 text-4xl font-semibold leading-[1.06] tracking-[-0.035em] sm:text-5xl">
            Read it once, <span className="serif">and it fades.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">Most of what we read once is gone within days. It is called the forgetting curve, and it is one of the oldest findings in learning science.</p>
          <p className="mt-4 text-lg leading-relaxed text-muted">Amy checks you after every idea, then brings back what you missed the next day, then a few days later, just before you would forget it. Each time, it lasts longer.</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border hairline bg-[var(--card)] p-4">
              <div className="flex items-center gap-2 text-sm text-muted"><span className="h-0.5 w-5 rounded-full bg-[var(--muted)]" /> Read once</div>
              <div className="mt-1 text-3xl font-semibold tabular-nums">{Math.round(once(d))}%</div>
            </div>
            <div className="rounded-2xl border border-amy-400/50 bg-amy-400/10 p-4">
              <div className="flex items-center gap-2 text-sm text-muted"><span className="h-0.5 w-5 rounded-full bg-amy-500" /> With Amy</div>
              <div className="mt-1 text-3xl font-semibold tabular-nums text-amy-600 dark:text-amy-200">{Math.round(withAmy(d))}%</div>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted">Remembered after {d} {d === 1 ? 'day' : 'days'}. Move along the graph to change the day.</p>
        </motion.div>

        <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.7, ease: EASE }} className="rounded-3xl border hairline bg-[var(--card)] p-4 sm:p-6">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full touch-none select-none" onPointerMove={e => move(e.clientX)} onPointerDown={e => move(e.clientX)} onPointerLeave={() => setDay(null)} role="img" aria-label="Graph: memory after reading once falls to about 13 percent in 30 days; with Amy's checks and revision it stays above 80 percent.">
            <defs>
              <linearGradient id="keep" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff8a3d" stopOpacity=".28" />
                <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="amyline" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#ffd06a" />
                <stop offset="1" stopColor="#ff6b3d" />
              </linearGradient>
            </defs>
            {[0, 25, 50, 75, 100].map(v => (
              <g key={v}>
                <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke="var(--line)" />
                <text x={PL - 8} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">{v}%</text>
              </g>
            ))}
            {[0, 7, 14, 21, 30].map(t => (
              <text key={t} x={x(t)} y={H - 12} textAnchor="middle" fontSize="11" fill="var(--muted)">{t === 0 ? 'Day 0' : `${t}`}</text>
            ))}

            <motion.path d={paths.area} fill="url(#keep)" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}} transition={{ delay: 1.6, duration: 0.8 }} />
            <motion.path d={paths.a} fill="none" stroke="var(--muted)" strokeWidth="2.5" strokeDasharray="5 6" strokeLinecap="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 1.6, ease: 'easeInOut' }} />
            <motion.path d={paths.b} fill="none" stroke="url(#amyline)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={inView ? { pathLength: 1 } : {}} transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.3 }} />

            {REVIEWS.map((r, i) => (
              <motion.g key={r} initial={{ opacity: 0, scale: 0 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: 0.6 + (r / DAYS) * 2.2, type: 'spring', stiffness: 300, damping: 16 }} style={{ transformOrigin: `${x(r)}px ${y(100)}px` }}>
                <circle cx={x(r)} cy={y(100)} r="6" fill="#ff8a3d" stroke="var(--card)" strokeWidth="2.5" />
                <text x={x(r)} y={y(100) - 12} textAnchor="middle" fontSize="10.5" fontWeight="600" fill="var(--fg)">{i === 0 ? 'Check' : 'Revise'}</text>
              </motion.g>
            ))}

            <text x={x(DAYS) - 4} y={y(once(DAYS)) - 10} textAnchor="end" fontSize="12" fill="var(--muted)">Read once</text>
            <text x={x(DAYS) - 4} y={y(withAmy(DAYS)) + 22} textAnchor="end" fontSize="12" fontWeight="600" fill="#ff8a3d">With Amy</text>

            {day !== null && (
              <g pointerEvents="none">
                <line x1={x(day)} x2={x(day)} y1={PT} y2={H - PB} stroke="var(--fg)" strokeOpacity=".25" />
                <circle cx={x(day)} cy={y(once(day))} r="5" fill="var(--muted)" stroke="var(--card)" strokeWidth="2" />
                <circle cx={x(day)} cy={y(withAmy(day))} r="6" fill="#ff8a3d" stroke="var(--card)" strokeWidth="2" />
              </g>
            )}
          </svg>
          <p className="mt-3 text-xs leading-relaxed text-muted">An illustration of the forgetting curve (Ebbinghaus) and spaced review, not measured results from Amy’s students.</p>
        </motion.div>
      </div>
    </section>
  );
}
