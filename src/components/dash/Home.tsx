import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight02Icon, Brain02Icon, CheckmarkCircle02Icon, Message01Icon, Mic01Icon, Notebook01Icon, RepeatIcon, Calendar03Icon } from '@hugeicons/core-free-icons';
import Amy from '../Amy';
import { Icon } from '../ui';
import { Folder, MY_COURSES } from './Courses';
import { Composer, SlidesToggle, type Attachment } from './Composer';
import { useTheme } from '../../theme';
import SoftAurora from '../../bits/SoftAurora';
import type { View } from '../../pages/Dashboard';
import { MonthEndPrompt, TodayPlan, useNextExam } from './Planner';
import { SLATE, WOOD } from './BoardArt';
import { longDate, relative, shortDate, useCalendar, useProfile, useProgress, useToday } from '../../store';

const rise = (i: number) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { delay: 0.07 * i, duration: 0.7, ease: [0.23, 1, 0.32, 1] as const }
});

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

// The ball's path as points evenly spaced in time, like a real throw: x moves steadily, y is a parabola.
const ARC = (() => {
  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    x.push(64 + 172 * t);
    y.push((1 - t) ** 2 * 196 + 2 * t * (1 - t) * -116 + t ** 2 * 196);
  }
  return { x, y };
})();

const CHALK = '#f4f1e6';
const CHALK_FONT = 'Caveat, "Segoe Print", cursive';

/** A chalk arrow from (x, y), `len` long: up when negative, down when positive. */
const chalkArrow = (x: number, y: number, len: number) => {
  const back = len < 0 ? 5 : -5;
  return `M${x} ${y} v${len} M${x - 4} ${y + len + back} L${x} ${y + len} L${x + 4} ${y + len + back}`;
};

/** Today's lesson as Amy draws it on the board: a ball thrown up slows to a stop, then speeds up on the way down. */
function ChalkThrow() {
  const reduce = useReducedMotion();
  const up = [3, 7, 10];
  const down = [14, 17, 21];
  return (
    <div className="rounded-[9px] p-[6px] shadow-[0_2px_0_#8f6238]" style={{ background: WOOD }}>
      <div className="relative h-full min-h-[240px] overflow-hidden rounded-[5px] shadow-[inset_0_0_0_2px_rgba(0,0,0,.25),inset_0_0_50px_rgba(0,0,0,.3)]" style={{ background: SLATE }}>
        <svg viewBox="0 0 320 236" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A ball thrown up at 20 metres a second slows down, stops for an instant at the top, then speeds up on the way down.">
          {/* the ground, hatched the way a physics teacher draws it */}
          <path d="M10 197 C 70 194, 140 199, 210 196 S 290 195, 310 197" fill="none" stroke={CHALK} strokeOpacity=".6" strokeWidth="1.8" strokeLinecap="round" />
          {Array.from({ length: 21 }, (_, i) => (
            <path key={i} d={`M${20 + i * 14} 199 l-6 8`} stroke={CHALK} strokeOpacity=".22" strokeWidth="1.2" strokeLinecap="round" />
          ))}

          {/* height, up the side */}
          <path d="M306 196 V40" stroke={CHALK} strokeOpacity=".4" strokeWidth="1.3" />
          {[0, 5, 10, 15, 20].map(m => (
            <path key={m} d={`M${m % 10 ? 301 : 298} ${196 - m * 7.8} H306`} stroke={CHALK} strokeOpacity=".45" strokeWidth="1.3" />
          ))}
          <text x="294" y="45" textAnchor="end" fontFamily={CHALK_FONT} fontWeight={600} fontSize="14" fill={CHALK} fillOpacity=".55">20 m</text>
          <text x="294" y="123" textAnchor="end" fontFamily={CHALK_FONT} fontWeight={600} fontSize="14" fill={CHALK} fillOpacity=".55">10 m</text>

          {/* the path, drawn in blue chalk */}
          <motion.path d="M64 196 Q150 -116 236 196" fill="none" stroke="#a9dcff" strokeOpacity=".75" strokeWidth="2" strokeDasharray="2 7" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, delay: 0.3, ease: 'easeOut' }} />

          {/* where the ball was, every few moments */}
          {[3, 7, 12, 17, 21].map(k => (
            <circle key={k} cx={ARC.x[k]} cy={ARC.y[k]} r="8" fill="none" stroke={CHALK} strokeOpacity=".3" strokeWidth="1.4" />
          ))}

          {/* its speed: shrinking on the way up, growing on the way down */}
          {up.map((k, i) => (
            <motion.path key={k} d={chalkArrow(ARC.x[k] - 13, ARC.y[k], [-30, -18, -8][i])} fill="none" stroke={CHALK} strokeOpacity=".85" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.2 }} />
          ))}
          {down.map((k, i) => (
            <motion.path key={k} d={chalkArrow(ARC.x[k] + 13, ARC.y[k], [8, 18, 30][i])} fill="none" stroke={CHALK} strokeOpacity=".85" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 + i * 0.2 }} />
          ))}
          <text x="14" y="88" fontFamily={CHALK_FONT} fontWeight={600} fontSize="15" fill={CHALK} fillOpacity=".7">slows down</text>
          <text x="214" y="104" fontFamily={CHALK_FONT} fontWeight={600} fontSize="15" fill={CHALK} fillOpacity=".7">speeds up</text>

          {/* the moment it stops */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
            <text x="174" y="22" fontFamily={CHALK_FONT} fontWeight={600} fontSize="18" fill="#ffd06a">v = 0 here!</text>
            <path d="M171 17 C 163 15, 158 20, 156 28 M152.5 23.5 L156 28 L160.5 25" fill="none" stroke="#ffd06a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>

          {/* the ball itself */}
          {reduce ? (
            <circle cx={ARC.x[12]} cy={ARC.y[12]} r="7.5" fill="#ffd06a" />
          ) : (
            <motion.circle r="7.5" fill="#ffd06a" initial={{ cx: ARC.x[0], cy: ARC.y[0] }} animate={{ cx: ARC.x, cy: ARC.y }} transition={{ duration: 2.6, repeat: Infinity, ease: 'linear', repeatDelay: 0.8 }} />
          )}

          <text x="14" y="226" fontFamily={CHALK_FONT} fontWeight={600} fontSize="15" fill={CHALK} fillOpacity=".6">thrown up at 20 m/s</text>
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small paper things for the cards under it                            */
/* ------------------------------------------------------------------ */

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** A pencil tick, each one at a slightly different angle, as if marked by hand. */
function Tick({ i }: { i: number }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden style={{ transform: `rotate(${[-6, 4, -2, 6, -4, 2, 0][i]}deg)` }}>
      <motion.path d="M4.5 12.5 C 6 14, 7.5 16, 9 18.5 C 11.5 12.5, 15 7.5, 20 4.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.7 + i * 0.12, ease: 'easeOut' }} />
    </svg>
  );
}

/** Today, circled by hand: not done yet. */
function Circled() {
  return (
    <svg viewBox="0 0 32 32" className="absolute inset-[-3px]" aria-hidden>
      <motion.path d="M9 7 C 15 2, 28 5, 28.5 15 C 29 26, 14 30, 6.5 23.5 C 2 19, 4 11, 12 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 1.3, ease: 'easeOut' }} />
    </svg>
  );
}

/** A stack of index cards, the top one marked "Not yet" in red pen. They fan out on hover. */
function IndexCards() {
  return (
    <span aria-hidden className="absolute right-5 top-5 h-[58px] w-[86px]">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="absolute inset-0 rounded-[3px] bg-[#fffdf6] shadow-[0_6px_14px_-8px_rgba(0,0,0,.5)] ring-1 ring-black/5 transition-transform duration-500 ease-[cubic-bezier(.23,1,.32,1)] [transform:var(--rest)] group-hover:[transform:var(--fan)]"
          style={{ ['--rest' as string]: `rotate(${[-8, -2, 4][i]}deg)`, ['--fan' as string]: `translateX(${[-10, 0, 10][i]}px) rotate(${[-15, -3, 10][i]}deg)` }}
        >
          <span className="absolute inset-x-0 top-[14px] h-px bg-[#e5643d]/50" />
          {[25, 36, 47].map(t => (
            <span key={t} className="absolute inset-x-0 h-px bg-[#3a8bd0]/20" style={{ top: t }} />
          ))}
          {i === 2 && <span className="hand absolute left-2 top-[17px] -rotate-3 text-[18px] leading-none text-[#d6453d]">Not yet</span>}
        </span>
      ))}
    </span>
  );
}

/** An empty sticky note: a test date still to fill in. */
function TestNote() {
  return (
    <span aria-hidden className="sticky-note absolute right-5 top-4 w-[94px] rotate-[4deg] px-2.5 pb-3 pt-3.5 transition-transform duration-500 ease-[cubic-bezier(.23,1,.32,1)] group-hover:-translate-y-1 group-hover:rotate-[1deg]" style={{ background: '#ffe27a' }}>
      <span className="absolute left-1/2 top-[-7px] h-3.5 w-11 -translate-x-1/2 rotate-[-3deg] bg-white/55" />
      <span className="hand block text-[19px] leading-none">Test on</span>
      <span className="mt-2.5 block h-px w-full bg-[#2a1f10]/45" />
    </span>
  );
}

/** A page torn from a desk calendar, for a test that is in the calendar. */
function CalendarPage({ date }: { date: string }) {
  const d = new Date(date + 'T00:00');
  return (
    <span aria-hidden className="absolute right-5 top-5 w-16 rotate-[3deg] overflow-hidden rounded-[5px] bg-[#fffdf6] text-center text-[#2a1f10] shadow-[0_6px_14px_-8px_rgba(0,0,0,.5)] ring-1 ring-black/5 transition-transform duration-500 group-hover:rotate-0">
      <span className="block bg-[#e5643d] py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">{d.toLocaleDateString(undefined, { month: 'short' })}</span>
      <span className="block py-1 text-2xl font-semibold tabular-nums">{d.getDate()}</span>
    </span>
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

  // The lesson to pick up, with counts taken from the course itself so they match its folder below.
  const { doneIn } = useProgress();
  const course = MY_COURSES[0];
  const lessons = course.chapters.flatMap(c => c.concepts);
  const next = Math.max(0, lessons.indexOf('Acceleration: speeding up and slowing down'));
  const done = Math.min(lessons.length, doneIn(course.title, course.done ?? 0));
  const minutes = 18;
  // This week, Monday first.
  const dow = (new Date(today + 'T00:00').getDay() + 6) % 7;

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

        {/* 2. Continue: the next lesson, with the board Amy will draw on */}
        <motion.section {...rise(5)} className="mt-6 sm:mt-8">
          <h2 className="mb-3 px-1 text-sm font-medium text-muted">Pick up where you left off</h2>
          <div className="card grid gap-2 p-2 md:grid-cols-[1.15fr_1fr]">
            <div className="flex flex-col p-4 sm:p-6">
              <div className="hand -rotate-1 self-start text-[22px] leading-none text-amy-600 dark:text-amy-400">Next up</div>
              <h3 className="mt-2.5 text-[26px] font-semibold leading-[1.12] tracking-[-0.025em] sm:text-[30px]">{lessons[next]}</h3>
              <p className="mt-2 text-sm text-muted">
                {course.subject} · {course.title} · lesson {next + 1} of {lessons.length} · about {minutes} min
              </p>
              <p className="mt-4 leading-relaxed text-fg2">You nailed velocity last time. Today: why a ball thrown up slows, stops, and comes back.</p>

              {/* the course, one mark per lesson */}
              <div className="mt-auto pt-7">
                <div className="flex items-baseline justify-between text-sm text-muted">
                  <span>{course.title}</span>
                  <span>
                    <span className="font-semibold text-[var(--fg)] tabular-nums">{done}</span> of {lessons.length} done
                  </span>
                </div>
                <div className="mt-2 flex gap-1" aria-hidden>
                  {lessons.map((l, i) => (
                    <span key={l} className={`h-1.5 flex-1 rounded-full ${i < done ? 'bg-amy-500' : i === next ? 'bg-amy-500/35' : 'bg-[var(--card-2)]'}`} />
                  ))}
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  <button onClick={() => onLearn(course, next)} className="btn !min-h-11 !px-5 font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 hover:brightness-105">
                    Continue lesson <Icon icon={ArrowRight02Icon} size={17} />
                  </button>
                  <button className="btn btn-ghost !min-h-11" onClick={() => onAsk('Explain acceleration with an example')}>
                    Ask about it
                  </button>
                </div>
              </div>
            </div>
            <ChalkThrow />
          </div>
        </motion.section>

        {/* 3. Three things worth knowing today */}
        <section className="mt-4 grid gap-4 md:grid-cols-3">
          {/* the week, marked off like a register */}
          <motion.div {...rise(5)} className="card flex flex-col p-5 sm:p-6">
            <div className="text-sm font-medium text-muted">Streak</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums">12</span>
              <span className="text-[15px] text-muted">days in a row</span>
            </div>
            <div className="mt-5 grid grid-cols-7 overflow-hidden rounded-lg border hairline" role="img" aria-label={`This week: ${dow} ${dow === 1 ? 'day' : 'days'} done so far, today still to do.`}>
              {WEEK.map((d, i) => (
                <div key={i} className={`flex flex-col items-center gap-1 pb-1.5 pt-2 ${i ? 'border-l hairline' : ''} ${i === dow ? 'bg-amy-400/10' : ''}`}>
                  <span className={`text-[11px] ${i === dow ? 'font-semibold text-[var(--fg)]' : 'text-muted'}`}>{d}</span>
                  <span className="relative grid size-7 place-items-center text-amy-500">{i < dow ? <Tick i={i} /> : i === dow ? <Circled /> : null}</span>
                </div>
              ))}
            </div>
            <p className="mt-auto pt-4 text-sm text-muted">One lesson today keeps it going.</p>
          </motion.div>

          <motion.button {...rise(6)} onClick={() => onGo('practice')} className="group card relative flex flex-col items-start p-5 text-left transition-colors hover:border-[var(--line-2)] sm:p-6">
            <IndexCards />
            <div className="text-sm font-medium text-muted">Revision</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[44px] font-semibold leading-none tracking-[-0.04em] tabular-nums">6</span>
              <span className="text-[15px] text-muted">cards to revise</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">The ones you got “Not yet” on Tuesday. About 4 minutes.</p>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold">
              Revise now <Icon icon={ArrowRight02Icon} size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>

          <motion.button {...rise(7)} onClick={() => onGo('calendar')} className="group card relative flex flex-col items-start p-5 text-left transition-colors hover:border-[var(--line-2)] sm:p-6">
            {exam ? <CalendarPage date={exam.date} /> : <TestNote />}
            <div className="text-sm font-medium text-muted">Next test</div>
            {exam ? (
              <>
                <div className="mt-2 pr-20 text-[32px] font-semibold leading-tight tracking-[-0.03em]">{relative(today, exam.date)}</div>
                <p className="mt-3 pr-16 text-sm leading-relaxed text-muted">
                  {exam.title} · {shortDate(exam.date)}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold">
                  Plan for it <Icon icon={ArrowRight02Icon} size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </>
            ) : (
              <>
                <div className="mt-2 pr-24 text-xl font-semibold leading-snug tracking-tight">No test added yet</div>
                <p className="mt-3 text-sm leading-relaxed text-muted">Add your test dates or upload your school calendar, and Amy plans around them.</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold">
                  Add a test date <Icon icon={ArrowRight02Icon} size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
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
