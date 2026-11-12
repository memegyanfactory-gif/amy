import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight02Icon, ArrowUp02Icon, Brain02Icon, Call02Icon, Camera01Icon, CheckmarkCircle02Icon, Fire03Icon, Message01Icon, Mic01Icon, Notebook01Icon, PlayIcon, RepeatIcon, Calendar03Icon } from '@hugeicons/core-free-icons';
import Amy from '../Amy';
import { Icon } from '../ui';
import { Folder, MY_COURSES } from './Courses';
import { Composer, SlidesToggle, type Attachment } from './Composer';
import { useTheme } from '../../theme';
import SoftAurora from '../../bits/SoftAurora';
import type { View } from '../../pages/Dashboard';
import CountUp from '../../bits/CountUp';
import { MonthEndPrompt, TodayPlan, useNextExam } from './Planner';
import { longDate, relative, shortDate, useCalendar, useProfile, useToday } from '../../store';

const rise = (i: number) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay: 0.07 * i, duration: 0.7, ease: [0.23, 1, 0.32, 1] as const }
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

// Points along the arc (a quadratic curve), evenly spaced in time like a real throw.
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

/** A ball thrown up: it slows, stops, comes back. Arrows show its speed shrinking to nothing at the top. */
function LessonArt() {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const sky = dark ? 'linear-gradient(170deg, #1d2a52 0%, #2a2350 45%, #3a2337 100%)' : 'linear-gradient(170deg, #dff0ff 0%, #ffe9d2 60%, #ffd7b5 100%)';
  const ink = dark ? '#f5f1ea' : '#2a1f10';
  // where the arrows sit along the way up, and how long each is
  const marks = [2, 6, 10];
  return (
    <div className="relative h-full min-h-[240px] overflow-hidden rounded-2xl" style={{ background: sky }}>
      <div aria-hidden className="absolute -right-10 -top-10 size-40 rounded-full bg-amy-300/40 blur-2xl" />
      <svg viewBox="0 0 320 240" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <defs>
          <radialGradient id="ballg" cx="35%" cy="30%">
            <stop offset="0" stopColor="#fff4d6" />
            <stop offset=".5" stopColor="#ffa048" />
            <stop offset="1" stopColor="#ff6b3d" />
          </radialGradient>
          <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L10 5 L0 10z" fill="#ff6b3d" />
          </marker>
        </defs>
        {/* ground with grass ticks */}
        <rect x="0" y="208" width="320" height="32" fill={dark ? '#1a1f2e' : '#f3d9b6'} />
        <path d="M0 208 H320" stroke={ink} strokeOpacity=".25" strokeWidth="2" />
        {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${10 + i * 20} 208 l3 -6 l3 6`} fill="none" stroke={dark ? '#4b6b52' : '#8fb27a'} strokeWidth="1.5" />)}
        {/* height ruler */}
        {[0, 1, 2, 3].map(i => (
          <g key={i}>
            <path d={`M290 ${208 - i * 40} h10`} stroke={ink} strokeOpacity=".35" />
            <text x="286" y={212 - i * 40} textAnchor="end" fontSize="9" fill={ink} fillOpacity=".55">{i * 5} m</text>
          </g>
        ))}
        {/* the path */}
        <motion.path d="M70 206 Q160 -60 250 206" fill="none" stroke="#5b8def" strokeWidth="2.5" strokeDasharray="3 8" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, delay: 0.4 }} />
        {/* faded copies of the ball: a time-lapse */}
        {[3, 7, 12, 17, 21].map((k, i) => (
          <circle key={k} cx={ARC.x[k]} cy={ARC.y[k]} r="10" fill="url(#ballg)" opacity={0.18 + i * 0.03} />
        ))}
        {/* velocity arrows, shrinking on the way up */}
        {marks.map((k, i) => {
          const len = [30, 18, 8][i];
          return (
            <motion.path key={k} d={`M${ARC.x[k] - 16} ${ARC.y[k]} v${-len}`} stroke="#ff6b3d" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arr)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.25 }} />
          );
        })}
        {/* the top */}
        <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}>
          <rect x="125" y="14" width="70" height="22" rx="11" fill={dark ? 'rgba(255,255,255,.12)' : '#fff'} stroke="#ff8a3d" strokeOpacity=".6" />
          <text x="160" y="29" textAnchor="middle" fontSize="12" fontWeight="600" fill={ink}>v = 0 here</text>
          <path d="M160 36 v20" stroke="#ff8a3d" strokeWidth="1.5" strokeDasharray="2 3" />
        </motion.g>
        {/* the moving ball */}
        <motion.g initial={{ x: ARC.x[0], y: ARC.y[0] }} animate={{ x: ARC.x, y: ARC.y }} transition={{ duration: 2.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.6 }}>
          <ellipse cx="0" cy="22" rx="10" ry="3" fill="#000" opacity=".12" />
          <circle r="13" fill="url(#ballg)" />
          <circle cx="-4" cy="-4" r="4" fill="#fff" opacity=".55" />
        </motion.g>
      </svg>
      <span className="absolute bottom-3 left-3 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">Thrown up at 20 m/s</span>
    </div>
  );
}

const RECENT = [
  { icon: Message01Icon, title: 'Why does ice float on water?', sub: 'Chemistry · understood after 2 checks', when: 'Today' },
  { icon: CheckmarkCircle02Icon, title: 'Passed: Velocity, 7 of 7', sub: 'Physics · lesson 5', when: 'Yesterday' },
  { icon: Mic01Icon, title: "Voice call: Newton's third law", sub: 'Physics · 6 min', when: 'Sunday' }
];

export default function Home({ onAsk, onGo, onLearn }: { onAsk: (q?: string, f?: Attachment) => void; onGo: (v: View) => void; onLearn: (c: (typeof MY_COURSES)[number], i: number) => void }) {
  const [q, setQ] = useState('');
  const { theme } = useTheme();
  const { profile } = useProfile();
  const today = useToday();
  const { on } = useCalendar();
  const exam = useNextExam();
  const todayLeft = on(today).filter(i => !i.done && i.kind !== 'exam' && i.kind !== 'event').length;
  const name = profile.name.trim().split(/\s+/)[0] || 'there';
  const line = exam
    ? `${exam.title} is ${relative(today, exam.date)}. One lesson today keeps you on track.`
    : todayLeft
      ? `You have ${todayLeft} ${todayLeft === 1 ? 'thing' : 'things'} planned for today.`
      : `It's ${longDate(today)}. What do you want to learn today?`;
  const quick = [
    { icon: Calendar03Icon, label: 'My calendar', go: () => onGo('calendar') },
    { icon: RepeatIcon, label: 'Revise mistakes', go: () => onGo('practice') },
    { icon: Brain02Icon, label: 'Mock paper', go: () => onGo('practice') },
    { icon: Notebook01Icon, label: 'Course from my notes', go: () => onGo('courses') }
  ];
  const [file, setFile] = useState<Attachment | null>(null);

  return (
    <div className="relative">
      {/* soft light behind the greeting */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-[68px] h-[628px] overflow-hidden">
        <div className="absolute left-1/2 top-[-260px] h-[620px] w-[900px] -translate-x-1/2 rounded-full glow-amy opacity-40 blur-3xl" />
        <div className={`absolute inset-x-0 top-[-60%] h-[150%] [mask-image:linear-gradient(#000_45%,transparent_75%)] ${theme === 'dark' ? 'blur-[42px] scale-y-[1.6]' : ''}`}>
          <SoftAurora color1={theme === 'dark' ? '#ff9a3d' : '#ffe2a6'} color2={theme === 'dark' ? '#ff5a2a' : '#ff8a3d'} speed={0.35} spectrum={0} colorSpeed={0.2} brightness={theme === 'dark' ? 0.95 : 1} bandSpread={theme === 'dark' ? 2.2 : 1.25} noiseFrequency={1.8} enableMouseInteraction={false} clickPulse={false} lightMode={theme !== 'dark'} opacity={theme === 'dark' ? 0.55 : 0.6} />
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl px-[max(16px,env(safe-area-inset-left))] sm:px-6">
        {/* 1. Greeting and the one thing you came to do */}
        <section className="flex flex-col items-center text-center pt-12 sm:pt-16">
          <motion.div {...rise(0)}>
            <Amy size={104} follow interactive />
          </motion.div>
          <motion.h1 {...rise(1)} className="mt-5 text-4xl sm:text-6xl font-semibold tracking-[-0.04em]">
            {greeting()}, <span className="serif amy-gradient-text pr-1">{name}</span>
          </motion.h1>
          <motion.p {...rise(2)} className="mt-3 text-muted text-base sm:text-lg">
            {line}
          </motion.p>

          <motion.div {...rise(3)} className="mt-8 w-full max-w-2xl text-left">
            <Composer big value={q} onChange={setQ} onSend={() => onAsk(q, file ?? undefined)} placeholder="What are you stuck on?" attachment={file} onAttach={setFile} />
            <div className="mt-2 flex justify-start"><SlidesToggle /></div>
          </motion.div>

          <motion.div {...rise(4)} className="mt-4 flex flex-wrap justify-center gap-2">
            {quick.map(a => (
              <motion.button key={a.label} type="button" onClick={a.go} whileHover={{ y: -2 }} className="inline-flex items-center gap-2 rounded-full border hairline bg-[var(--card)] px-4 py-2 text-sm text-fg2 hover:border-amy-400 transition-colors">
                <Icon icon={a.icon} size={16} className="text-amy-500" /> {a.label}
              </motion.button>
            ))}
          </motion.div>
        </section>

        <div className="mt-10">
          <MonthEndPrompt onPlan={() => onGo('calendar')} />
        </div>

        {/* 2. Continue */}
        <motion.section {...rise(5)} className="mt-6 sm:mt-8">
          <h2 className="text-sm font-medium text-muted mb-3 px-1">Pick up where you left off</h2>
          <div className="relative overflow-hidden rounded-3xl border hairline bg-[var(--card)] p-3 shadow-[0_30px_80px_-50px_rgba(255,107,61,.6)]">
            <div aria-hidden className="absolute -left-24 -top-24 size-72 rounded-full glow-amy opacity-50" />
            <div className="relative grid gap-3 md:grid-cols-[1.2fr_1fr]">
              <div className="flex flex-col p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-physics)]/15 px-3 py-1 font-medium text-[var(--color-physics)]">
                    <span className="size-1.5 rounded-full bg-current" /> Physics
                  </span>
                  <span className="text-muted">Lesson 6 of 12 · 18 min</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amy-400/15 px-2.5 py-1 text-xs font-medium text-amy-600 dark:text-amy-200">Up next</span>
                </div>
                <h3 className="mt-5 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em] sm:text-[34px]">
                  Acceleration: speeding up <span className="serif amy-gradient-text">and slowing down</span>
                </h3>
                <p className="mt-3 leading-relaxed text-muted">You nailed velocity last time. Today: why a ball thrown up slows, stops, and comes back.</p>

                {/* the course as 12 lessons */}
                <div className="mt-6">
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="font-medium">Motion</span>
                    <span className="text-muted"><span className="font-semibold text-[var(--fg)] tabular-nums">5</span> of 12 lessons done</span>
                  </div>
                  <div className="mt-2.5 flex gap-1">
                    {Array.from({ length: 12 }, (_, i) => (
                      <motion.span key={i} initial={{ scaleY: 0.3, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }} transition={{ delay: 0.5 + i * 0.05, type: 'spring', stiffness: 300, damping: 18 }} className={`h-2.5 flex-1 rounded-full ${i < 5 ? 'bg-gradient-to-r from-amy-300 to-amy-500' : i === 5 ? 'bg-amy-400/30 ring-2 ring-amy-400' : 'bg-[var(--card-2)]'}`} />
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-2">
                  <button onClick={() => onLearn(MY_COURSES[0], 4)} className="group inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 pl-5 pr-2 font-semibold text-[#2a1406] shadow-[0_12px_30px_-12px_rgba(255,107,61,.8)] transition-transform active:scale-95">
                    Continue lesson
                    <span className="grid size-7 place-items-center rounded-full bg-[#2a1406] text-amy-200 transition-transform group-hover:translate-x-0.5"><Icon icon={PlayIcon} size={13} /></span>
                  </button>
                  <button className="btn btn-ghost !min-h-11 !rounded-full" onClick={() => onAsk('Explain acceleration with an example')}>
                    Ask about it
                  </button>
                </div>
              </div>
              <LessonArt />
            </div>
          </div>
        </motion.section>

        {/* 3. Three things worth knowing today */}
        <section className="mt-4 grid gap-4 sm:grid-cols-3">
          <motion.div {...rise(5)} className="relative overflow-hidden rounded-3xl border border-amy-400/30 p-6" style={{ background: 'linear-gradient(160deg, rgba(255,160,72,.16), rgba(255,107,61,.04) 60%), var(--card)' }}>
            <motion.div aria-hidden className="absolute -right-8 -top-8 text-[120px] leading-none opacity-[.12]" animate={{ rotate: [-4, 4, -4], scale: [1, 1.05, 1] }} transition={{ duration: 3, repeat: Infinity }}>
              <Icon icon={Fire03Icon} size={140} />
            </motion.div>
            <div className="relative flex items-center gap-2 text-sm font-medium text-amy-600 dark:text-amy-200">
              <motion.span animate={{ scale: [1, 1.18, 1] }} transition={{ duration: 1.4, repeat: Infinity }}><Icon icon={Fire03Icon} size={18} /></motion.span> Streak
            </div>
            <div className="relative mt-2 text-5xl font-semibold tracking-[-0.04em]">
              <CountUp trigger="load" to={12} duration={1.2} />
              <span className="serif ml-1.5 text-2xl">days</span>
            </div>
            <div className="relative mt-5 flex justify-between">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 + i * 0.06, type: 'spring', stiffness: 320, damping: 16 }} className={`grid size-8 place-items-center rounded-full ${i < 4 ? 'bg-gradient-to-b from-amy-200 to-amy-600 text-[#2a1406] shadow-[0_6px_14px_-6px_rgba(255,107,61,.9)]' : i === 4 ? 'border-2 border-dashed border-amy-400 text-amy-500' : 'bg-[var(--card-2)] text-muted'}`}>
                    {i < 4 ? <Icon icon={CheckmarkCircle02Icon} size={15} /> : i === 4 ? <span className="size-1.5 rounded-full bg-current" /> : null}
                  </motion.span>
                  <span className={`text-[11px] ${i === 4 ? 'font-semibold' : 'text-muted'}`}>{d}</span>
                </div>
              ))}
            </div>
            <p className="relative mt-4 text-sm text-muted">One lesson today keeps it going.</p>
          </motion.div>

          <motion.button {...rise(6)} onClick={() => onGo('practice')} className="group relative flex flex-col items-start overflow-hidden rounded-3xl border hairline bg-[var(--card)] p-6 text-left transition-colors hover:border-[var(--color-maths)]/50">
            {/* the six questions, fanned out like cards */}
            <div aria-hidden className="absolute right-5 top-5 h-16 w-20">
              {[0, 1, 2].map(i => (
                <span key={i} className="absolute inset-0 rounded-xl border border-[var(--color-maths)]/40 bg-[var(--card)] shadow-sm transition-transform duration-500 group-hover:rotate-0" style={{ transform: `rotate(${(i - 1) * 9}deg) translateY(${i * 2}px)` }}>
                  {i === 2 && <span className="absolute inset-0 grid place-items-center text-lg font-semibold text-[var(--color-maths)]">?</span>}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--color-maths)]">
              <Icon icon={RepeatIcon} size={18} /> Revision
            </div>
            <div className="mt-2 text-5xl font-semibold tracking-[-0.04em]">
              <CountUp trigger="load" to={6} duration={1} />
              <span className="serif ml-1.5 text-2xl">due</span>
            </div>
            <p className="mt-3 text-sm text-muted">The ones you got “Not yet” on Tuesday. About 4 minutes.</p>
            <div className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold">
              Revise now <Icon icon={ArrowRight02Icon} size={16} className="transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>

          <motion.button {...rise(7)} onClick={() => onGo('calendar')} className="group relative flex flex-col items-start overflow-hidden rounded-3xl border hairline bg-[var(--card)] p-6 text-left transition-colors hover:border-[var(--notyet)]/50">
            {/* a little calendar page */}
            <div aria-hidden className="absolute right-5 top-5 w-16 overflow-hidden rounded-xl border hairline bg-[var(--bg)] text-center shadow-sm transition-transform duration-500 group-hover:-rotate-6">
              <div className="bg-[var(--notyet)] py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">{exam ? new Date(exam.date + 'T00:00').toLocaleDateString(undefined, { month: 'short' }) : 'Test'}</div>
              <div className="py-1.5 text-2xl font-semibold tabular-nums">{exam ? new Date(exam.date + 'T00:00').getDate() : '?'}</div>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--notyet)]">
              <Icon icon={Calendar03Icon} size={18} /> Next test
            </div>
            {exam ? (
              <>
                <div className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{relative(today, exam.date)}</div>
                <p className="mt-3 text-sm text-muted">{exam.title} · {shortDate(exam.date)}</p>
                <div className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold">
                  Plan for it <Icon icon={ArrowRight02Icon} size={16} className="transition-transform group-hover:translate-x-1" />
                </div>
              </>
            ) : (
              <>
                <div className="mt-2 pr-16 text-2xl font-semibold leading-tight tracking-tight">No test added yet</div>
                <p className="mt-3 text-sm text-muted">Add your test dates or upload your school calendar, and Amy plans around them.</p>
                <div className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold">
                  Add a test date <Icon icon={ArrowRight02Icon} size={16} className="transition-transform group-hover:translate-x-1" />
                </div>
              </>
            )}
          </motion.button>
        </section>

        {/* 4. Subjects */}
        <motion.section {...rise(8)} className="mt-14">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="text-sm font-medium text-muted">Your course folders</h2>
            <button onClick={() => onGo('courses')} className="text-sm text-muted hover:text-[var(--fg)] transition-colors">
              All courses
            </button>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-4 lg:grid-cols-4">
            {MY_COURSES.slice(0, 4).map((c, i) => (
              <Folder key={c.title} course={c} index={i} compact onOpen={() => onGo('courses')} />
            ))}
          </div>
        </motion.section>

        {/* 5. Plan and recent */}
        <section className="mt-4 grid grid-cols-1 items-start gap-4 md:grid-cols-2">
          <motion.div {...rise(9)} className="min-w-0">
            <TodayPlan onOpenCalendar={() => onGo('calendar')} />
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
