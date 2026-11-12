import { useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowRight02Icon, ArrowUp02Icon, Brain02Icon, Call02Icon, Camera01Icon, CheckmarkCircle02Icon, Fire03Icon, Message01Icon, Mic01Icon, Notebook01Icon, PlayIcon, RepeatIcon, Calendar03Icon } from '@hugeicons/core-free-icons';
import Amy from '../Amy';
import { art, Icon, SUBJECT_ART, SUBJECT_COLOR } from '../ui';
import { useRegion } from '../../region';
import { useTheme } from '../../theme';
import SoftAurora from '../../bits/SoftAurora';
import type { View } from '../../pages/Dashboard';
import CountUp from '../../bits/CountUp';
import SpringCheck from '../../bits/SpringCheck';

const rise = (i: number) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay: 0.07 * i, duration: 0.7, ease: [0.23, 1, 0.32, 1] as const }
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function Ring({ value, size = 64, stroke = 6, color, delay = 0.3 }: { value: number; size?: number; stroke?: number; color: string; delay?: number }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 shrink-0" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card-2)" strokeWidth={stroke} />
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }} transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1], delay }} />
    </svg>
  );
}

// Points along the dashed arc (a quadratic curve), evenly spaced in time like a real throw.
const ARC = (() => {
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    x.push(70 + 180 * t);
    y.push((1 - t) ** 2 * 206 + 2 * t * (1 - t) * -60 + t ** 2 * 206 - 13);
  }
  return { x, y };
})();

/** A ball thrown up: it slows, stops, comes back. The picture for today's lesson. */
function LessonArt() {
  return (
    <div className="relative h-full min-h-[220px] overflow-hidden rounded-lg" style={{ background: 'linear-gradient(160deg, color-mix(in oklab, var(--color-physics) 26%, var(--card)) 0%, var(--card-2) 100%)' }}>
      <svg viewBox="0 0 320 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <path d="M0 208 H320" stroke="var(--fg)" strokeOpacity=".18" strokeWidth="2" />
        <motion.path d="M70 206 Q160 -60 250 206" fill="none" stroke="var(--color-physics)" strokeWidth="2.5" strokeDasharray="2 9" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 0.5 }} />
        <motion.g initial={{ x: ARC.x[0], y: ARC.y[0] }} animate={{ x: ARC.x, y: ARC.y }} transition={{ duration: 2.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.6 }}>
          <circle r="13" fill="url(#ballg)" />
        </motion.g>
        <defs>
          <radialGradient id="ballg" cx="35%" cy="30%">
            <stop offset="0" stopColor="#fff4d6" />
            <stop offset=".5" stopColor="#ffa048" />
            <stop offset="1" stopColor="#ff6b3d" />
          </radialGradient>
        </defs>
        <text x="160" y="40" textAnchor="middle" fill="var(--fg)" fillOpacity=".75" fontFamily="Instrument Serif" fontStyle="italic" fontSize="20">
          v = 0 at the top
        </text>
      </svg>
    </div>
  );
}

const SUBJECTS = [
  { name: 'Physics', pct: 62, note: 'Motion' },
  { name: 'Maths', pct: 48, note: 'Linear equations' },
  { name: 'Chemistry', pct: 35, note: 'Atoms and molecules' },
  { name: 'Biology', pct: 71, note: 'Unit of life' }
];
const PLAN = [
  { label: 'Finish "Speed and velocity"', done: true },
  { label: 'Revise 6 questions from Tuesday', done: false },
  { label: 'Chemistry paper from Ms Kapoor', done: false }
];
const RECENT = [
  { icon: Message01Icon, title: 'Why does ice float on water?', sub: 'Chemistry · understood after 2 checks', when: 'Today' },
  { icon: CheckmarkCircle02Icon, title: 'Passed: Velocity, 7 of 7', sub: 'Physics · lesson 5', when: 'Yesterday' },
  { icon: Mic01Icon, title: "Voice call: Newton's third law", sub: 'Physics · 6 min', when: 'Sunday' }
];

export default function Home({ onAsk, onGo }: { onAsk: (q?: string) => void; onGo: (v: View) => void }) {
  const [q, setQ] = useState('');
  const { region } = useRegion();
  const { theme } = useTheme();
  const quick = [
    { icon: Camera01Icon, label: 'Snap a question', go: () => onAsk('') },
    { icon: Call02Icon, label: 'Call Amy', go: () => onAsk('') },
    { icon: Brain02Icon, label: 'Mock paper', go: () => onGo('practice') },
    { icon: Notebook01Icon, label: 'Course from my notes', go: () => onGo('courses') }
  ];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onAsk(q);
  };

  return (
    <div className="relative">
      {/* soft light behind the greeting */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[620px] w-[900px] -translate-x-1/2 rounded-full glow-amy opacity-40 blur-3xl" />
        <div className={`absolute inset-x-0 top-[-60%] h-[150%] [mask-image:linear-gradient(#000_45%,transparent_75%)] ${theme === 'dark' ? 'blur-[42px] scale-y-[1.6]' : ''}`}>
          <SoftAurora color1={theme === 'dark' ? '#ff9a3d' : '#ffe2a6'} color2={theme === 'dark' ? '#ff5a2a' : '#ff8a3d'} speed={0.35} spectrum={0} colorSpeed={0.2} brightness={theme === 'dark' ? 1.25 : 1} bandSpread={theme === 'dark' ? 2.2 : 1.25} noiseFrequency={1.8} enableMouseInteraction={false} clickPulse={false} lightMode={theme !== 'dark'} opacity={theme === 'dark' ? 0.8 : 0.6} />
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-[max(16px,env(safe-area-inset-left))] sm:px-6">
        {/* 1. Greeting and the one thing you came to do */}
        <section className="flex flex-col items-center text-center pt-12 sm:pt-16">
          <motion.div {...rise(0)}>
            <Amy size={104} follow interactive />
          </motion.div>
          <motion.h1 {...rise(1)} className="mt-5 text-4xl sm:text-6xl font-semibold tracking-[-0.04em]">
            {greeting()}, <span className="serif amy-gradient-text pr-1">Riya</span>
          </motion.h1>
          <motion.p {...rise(2)} className="mt-3 text-muted text-base sm:text-lg">
            Physics test in 2 days. One lesson today keeps you on track.
          </motion.p>

          <motion.form {...rise(3)} onSubmit={submit} className="mt-8 w-full max-w-2xl">
            <div className="flex items-center gap-1 rounded-lg border hairline bg-[var(--card)] p-2 pl-6 shadow-[0_24px_60px_-28px_rgba(255,140,60,.55)] focus-within:border-amy-400/70 transition-colors">
              <label htmlFor="home-ask" className="sr-only">
                Ask Amy
              </label>
              <input id="home-ask" value={q} onChange={e => setQ(e.target.value)} placeholder="What are you stuck on?" className="min-w-0 flex-1 bg-transparent py-2.5 text-[17px] outline-none placeholder:text-[var(--muted)]" autoComplete="off" />
              <button type="button" className="hidden sm:grid size-11 place-items-center rounded-lg text-muted hover:bg-[var(--card-2)] transition-colors" aria-label="Snap a photo of a question">
                <Icon icon={Camera01Icon} />
              </button>
              <button type="button" className="hidden sm:grid size-11 place-items-center rounded-lg text-muted hover:bg-[var(--card-2)] transition-colors" aria-label="Talk to Amy">
                <Icon icon={Mic01Icon} />
              </button>
              <button type="submit" className="grid size-11 place-items-center rounded-lg bg-[var(--invert)] text-[var(--on-invert)] transition-transform active:scale-95" aria-label="Ask">
                <Icon icon={ArrowUp02Icon} size={19} />
              </button>
            </div>
          </motion.form>

          <motion.div {...rise(4)} className="mt-4 flex flex-wrap justify-center gap-2">
            {quick.map(a => (
              <motion.button key={a.label} type="button" onClick={a.go} whileHover={{ y: -2 }} className="inline-flex items-center gap-2 rounded-full border hairline bg-[var(--card)] px-4 py-2 text-sm text-fg2 hover:border-amy-400 transition-colors">
                <Icon icon={a.icon} size={16} className="text-amy-500" /> {a.label}
              </motion.button>
            ))}
          </motion.div>
        </section>

        {/* 2. Continue */}
        <motion.section {...rise(5)} className="mt-12 sm:mt-16">
          <h2 className="text-sm font-medium text-muted mb-3 px-1">Pick up where you left off</h2>
          <div className="card p-3 grid gap-3 md:grid-cols-[1.25fr_1fr]">
            <div className="p-4 sm:p-6 flex flex-col">
              <div className="flex items-center gap-2 text-sm">
                <span className="rounded-lg px-2.5 py-1 font-medium" style={{ background: 'color-mix(in oklab, var(--color-physics) 18%, transparent)', color: 'var(--color-physics)' }}>
                  Physics
                </span>
                <span className="text-muted">Lesson 6 of 12 · 18 min</span>
              </div>
              <h3 className="mt-5 text-[26px] sm:text-[34px] font-semibold tracking-[-0.03em] leading-[1.1]">
                Acceleration: speeding up <span className="serif">and slowing down</span>
              </h3>
              <p className="mt-3 text-muted leading-relaxed">You nailed velocity last time. Today: why a ball thrown up slows, stops, and comes back.</p>
              <div className="mt-6">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Motion</span>
                  <span className="tabular-nums">
                    <CountUp trigger="load" to={42} duration={1.4} />%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-lg bg-[var(--card-2)] overflow-hidden">
                  <motion.div className="h-full rounded-lg bg-[var(--color-physics)]" initial={{ width: 0 }} animate={{ width: '42%' }} transition={{ duration: 1.4, delay: 0.5, ease: [0.23, 1, 0.32, 1] }} />
                </div>
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                <button className="btn btn-primary">
                  <Icon icon={PlayIcon} size={16} /> Continue lesson
                </button>
                <button className="btn btn-ghost" onClick={() => onAsk('Explain acceleration with an example')}>
                  Ask about it
                </button>
              </div>
            </div>
            <LessonArt />
          </div>
        </motion.section>

        {/* 3. Three things worth knowing today */}
        <section className="mt-4 grid gap-4 sm:grid-cols-3">
          <motion.div {...rise(5)} className="card p-6 relative overflow-hidden">
            <div aria-hidden className="absolute -right-12 -top-12 size-44 glow-amy opacity-70" />
            <div className="relative flex items-center gap-2 text-sm text-muted">
              <Icon icon={Fire03Icon} size={18} className="text-amy-500" /> Streak
            </div>
            <div className="relative mt-2 text-5xl font-semibold tracking-[-0.04em]">
              <CountUp trigger="load" to={12} duration={1.2} />
              <span className="serif text-2xl ml-1.5">days</span>
            </div>
            <div className="relative mt-5 flex justify-between">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.06, type: 'spring', stiffness: 320, damping: 16 }} className={`size-7 rounded-lg ${i < 4 ? 'bg-gradient-to-b from-amy-200 to-amy-600' : i === 4 ? 'border-2 border-dashed border-amy-400' : 'bg-[var(--card-2)]'}`} />
                  <span className={`text-[11px] ${i === 4 ? 'font-medium' : 'text-muted'}`}>{d}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.button {...rise(6)} onClick={() => onGo('practice')} className="card p-6 text-left group hover:border-[var(--line-2)] transition-colors flex flex-col items-start">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Icon icon={RepeatIcon} size={18} className="text-[var(--color-maths)]" /> Revision
            </div>
            <div className="mt-2 text-5xl font-semibold tracking-[-0.04em]">
              <CountUp trigger="load" to={6} duration={1} />
              <span className="serif text-2xl ml-1.5">due</span>
            </div>
            <p className="mt-3 text-sm text-muted">The ones you got "Not yet" on Tuesday. About 4 minutes.</p>
            <div className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-medium">
              Revise now <Icon icon={ArrowRight02Icon} size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>

          <motion.button {...rise(7)} onClick={() => onGo('practice')} className="card p-6 text-left group hover:border-[var(--line-2)] transition-colors flex flex-col items-start">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Icon icon={Calendar03Icon} size={18} className="text-[var(--color-physics)]" /> Next test
            </div>
            <div className="mt-2 text-5xl font-semibold tracking-[-0.04em]">
              Fri<span className="serif text-2xl ml-1.5">in 2 days</span>
            </div>
            <p className="mt-3 text-sm text-muted">Physics unit test · Motion, chapters 7–8.</p>
            <div className="mt-auto pt-4 inline-flex items-center gap-1.5 text-sm font-medium">
              Try a mock paper <Icon icon={ArrowRight02Icon} size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>
        </section>

        {/* 4. Subjects */}
        <motion.section {...rise(8)} className="mt-14">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="text-sm font-medium text-muted">Your subjects</h2>
            <button onClick={() => onGo('courses')} className="text-sm text-muted hover:text-[var(--fg)] transition-colors">
              All courses
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {SUBJECTS.map((s, i) => (
              <motion.button key={s.name} whileHover={{ y: -6 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} onClick={() => onGo('courses')} className="group card overflow-hidden text-left min-w-0 hover:border-[var(--line-2)]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={art(SUBJECT_ART[s.name])} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2.5 left-3 text-[15px] font-semibold text-white">{s.name === 'Maths' ? region.math : s.name}</div>
                </div>
                <div className="flex items-center gap-3 p-3.5">
                  <div className="relative grid place-items-center">
                    <Ring value={s.pct} size={44} stroke={5} color={SUBJECT_COLOR[s.name]} delay={0.5 + i * 0.1} />
                    <span className="absolute text-[11px] font-medium tabular-nums">{s.pct}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-muted">Now learning</div>
                    <div className="text-sm font-medium truncate">{s.note}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* 5. Plan and recent */}
        <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div {...rise(9)} className="card p-6 min-w-0">
            <div className="flex items-baseline justify-between">
              <h2 className="font-medium">Today's plan</h2>
              <span className="text-sm text-muted">about 45 min</span>
            </div>
            <div className="mt-5 flex flex-col gap-4">
              {PLAN.map(p => (
                <SpringCheck key={p.label} label={p.label} defaultChecked={p.done} color="var(--fg)" fillColor="#ff8a3d" checkColor="#2a1406" fontSize={15} boxSize={22} boxRadius={7} />
              ))}
            </div>
          </motion.div>

          <motion.div {...rise(10)} className="card p-6 min-w-0">
            <div className="flex items-baseline justify-between">
              <h2 className="font-medium">Recently with Amy</h2>
              <button onClick={() => onGo('chat')} className="text-sm text-muted hover:text-[var(--fg)] transition-colors">
                All chats
              </button>
            </div>
            <ul className="mt-3 -mx-2">
              {RECENT.map(r => (
                <li key={r.title}>
                  <button onClick={() => onGo('chat')} className="w-full flex items-center gap-3 rounded-lg px-2 py-2.5 text-left hover:bg-[var(--card-2)] transition-colors">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--card-2)] text-muted">
                      <Icon icon={r.icon} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px]">{r.title}</span>
                      <span className="block truncate text-sm text-muted">{r.sub}</span>
                    </span>
                    <span className="text-xs text-muted shrink-0">{r.when}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
