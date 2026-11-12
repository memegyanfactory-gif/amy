import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft02Icon, ArrowRight02Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import Amy, { type AmyMood } from '../Amy';
import { Icon, Logo } from '../ui';
import { REGIONS, useRegion } from '../../region';
import { useCalendar, useProfile, useToday } from '../../store';
import { AddForm, ImportCalendar, ItemRow } from './Planner';

const EASE = [0.23, 1, 0.32, 1] as const;

/** Subjects offered at each of the four stages, youngest first. */
function subjectsFor(stage: number, math: string, code: string): string[] {
  if (stage === 0) return [math, 'English', 'Science', code === 'IN' ? 'EVS' : 'Social studies', 'Hindi', 'Reading', 'Art'].filter(s => code === 'IN' || s !== 'Hindi');
  if (stage === 1) return [math, 'Science', 'English', 'History', 'Geography', 'Computer Science', 'A second language'];
  if (stage === 2) return [math, 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'Economics', 'History', 'Geography'];
  return ['Physics', 'Chemistry', 'Biology', math, 'English', 'Computer Science', 'Economics'];
}
const INTERESTS = ['Space', 'Animals', 'The human body', 'Coding', 'Robots', 'Maths puzzles', 'Music', 'Art and design', 'Sports', 'Books and stories', 'Games', 'Nature', 'Business', 'Medicine', 'History', 'Languages'];

const STEPS = ['name', 'age', 'class', 'subjects', 'you', 'calendar'] as const;
type Step = (typeof STEPS)[number];

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={onClick} aria-pressed={on} className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[15px] transition-colors ${on ? 'border-amy-500 bg-amy-400/15 text-[var(--fg)]' : 'hairline text-fg2 hover:border-amy-400'}`}>
      {on && <Icon icon={Tick02Icon} size={14} stroke={2.6} className="text-amy-500" />}
      {children}
    </motion.button>
  );
}

const input = 'h-14 w-full rounded-2xl border border-[var(--line-2)] bg-[var(--card)] px-5 text-lg outline-none transition-colors focus:border-amy-400';

/** First visit: a few questions so Amy can pitch lessons right, then the calendar. */
export default function Onboarding() {
  const { profile, setProfile } = useProfile();
  const { region, setRegion } = useRegion();
  const today = useToday();
  const { items } = useCalendar();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [d, setD] = useState(profile);
  const step: Step = STEPS[i];
  const stageIx = region.tags.indexOf(d.stage);
  const subjects = subjectsFor(stageIx < 0 ? 2 : stageIx, region.math, region.code);
  const first = d.name.trim().split(/\s+/)[0];

  const can: Record<Step, boolean> = {
    name: d.name.trim().length > 0,
    age: /^\d{1,2}$/.test(d.age) && +d.age >= 4 && +d.age <= 25,
    class: !!d.stage,
    subjects: d.subjects.length > 0 || d.goal.trim().length > 0,
    you: true,
    calendar: true
  };
  const go = (n: number) => {
    setDir(n);
    setI(v => Math.min(STEPS.length - 1, Math.max(0, v + n)));
  };
  const finish = () => setProfile({ ...d, name: d.name.trim(), onboarded: true });
  const next = () => (i === STEPS.length - 1 ? finish() : can[step] && go(1));
  const toggle = (key: 'subjects' | 'interests', v: string) => setD(p => ({ ...p, [key]: p[key].includes(v) ? p[key].filter(x => x !== v) : [...p[key], v] }));

  const mood: AmyMood = step === 'name' ? 'calm' : step === 'calendar' ? 'happy' : step === 'you' ? 'encouraging' : 'listening';
  const upcoming = items.filter(x => x.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  const titles: Record<Step, ReactNode> = {
    name: <>Hi, I’m Amy. <span className="serif">What’s your name?</span></>,
    age: <>Nice to meet you, {first}. <span className="serif">How old are you?</span></>,
    class: <>Which class are <span className="serif">you in?</span></>,
    subjects: <>What do you want <span className="serif">to study?</span></>,
    you: <>Tell me a little <span className="serif">about you.</span></>,
    calendar: <>Add your <span className="serif">calendar.</span></>
  };
  const subtitles: Record<Step, string> = {
    name: 'I’ll use it when we talk. Your first name is enough.',
    age: 'So I can pitch my explanations right.',
    class: `Lessons follow your country’s curriculum. Set up for ${region.name}.`,
    subjects: 'Pick as many as you like, or tell me something specific.',
    you: 'I use what you love in my examples. A cricket fan gets cricket in physics.',
    calendar: 'Upload your school calendar or add test dates, and I’ll plan your days around them. You can do this later too.'
  };

  return (
    <div className="site relative flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[-320px] h-[620px] w-[1000px] -translate-x-1/2 rounded-full glow-amy opacity-50 blur-3xl" />

      <header className="relative mx-auto flex h-16 w-full max-w-3xl items-center gap-4 px-5">
        <Logo />
        <div className="ml-auto flex items-center gap-3 text-sm text-muted">
          <span className="tabular-nums">{i + 1} of {STEPS.length}</span>
          <span className="flex gap-1">
            {STEPS.map((s, k) => (
              <motion.span key={s} className="h-1.5 rounded-full" animate={{ width: k === i ? 24 : 8, background: k <= i ? '#ff8a3d' : 'var(--line-2)' }} transition={{ duration: 0.35, ease: EASE }} />
            ))}
          </span>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col px-5 pb-8">
        <div className="flex justify-center pt-4 sm:pt-8">
          <Amy size={76} mood={mood} />
        </div>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: 40 * dir, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -40 * dir, filter: 'blur(6px)' }}
            transition={{ duration: 0.4, ease: EASE }}
            className="mt-6 flex flex-1 flex-col"
            onKeyDown={e => {
              if (e.key === 'Enter' && step !== 'calendar' && (e.target as HTMLElement).tagName === 'INPUT') {
                e.preventDefault();
                next();
              }
            }}
          >
            <h1 className="text-center text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-[44px]">{titles[step]}</h1>
            <p className="mx-auto mt-3 max-w-lg text-center text-muted">{subtitles[step]}</p>

            <div className="mx-auto mt-8 w-full max-w-xl">
              {step === 'name' && <input autoFocus value={d.name} onChange={e => setD({ ...d, name: e.target.value })} placeholder="Your name" autoComplete="given-name" maxLength={40} className={input} aria-label="Your name" />}

              {step === 'age' && (
                <div className="flex flex-col items-center gap-4">
                  <input autoFocus inputMode="numeric" value={d.age} onChange={e => setD({ ...d, age: e.target.value.replace(/\D/g, '').slice(0, 2) })} placeholder="Age" className={`${input} max-w-[180px] text-center text-2xl`} aria-label="Your age" />
                  {d.age && !can.age && <p className="text-sm text-[var(--notyet)]">Amy is for students aged 4 to 25.</p>}
                </div>
              )}

              {step === 'class' && (
                <div className="flex flex-col gap-6">
                  <label className="flex items-center justify-between gap-3 rounded-2xl border hairline bg-[var(--card)] px-4 py-3">
                    <span className="text-sm text-muted">Where you study</span>
                    <select value={region.code} onChange={e => { setRegion(e.target.value); setD(p => ({ ...p, stage: '', subjects: [] })); }} className="rounded-lg bg-[var(--card-2)] px-3 py-2 text-[15px] outline-none">
                      {REGIONS.map(r => <option key={r.code} value={r.code}>{r.name}</option>)}
                    </select>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {region.tags.map(t => (
                      <motion.button key={t} type="button" whileTap={{ scale: 0.97 }} onClick={() => setD(p => ({ ...p, stage: t, subjects: [] }))} aria-pressed={d.stage === t} className={`rounded-2xl border-2 px-4 py-5 text-left text-lg font-semibold tracking-tight transition-colors ${d.stage === t ? 'border-amy-500 bg-amy-400/10' : 'border-[var(--line)] bg-[var(--card)] hover:border-amy-400'}`}>
                        {t}
                      </motion.button>
                    ))}
                  </div>
                  <input value={d.klass} onChange={e => setD({ ...d, klass: e.target.value })} placeholder={`Your exact class, e.g. ${region.tags[1].replace(/ to .*/, '')} (optional)`} maxLength={30} className={`${input} !h-12 text-base`} aria-label="Your exact class (optional)" />
                </div>
              )}

              {step === 'subjects' && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-wrap justify-center gap-2">
                    {subjects.map(s => <Chip key={s} on={d.subjects.includes(s)} onClick={() => toggle('subjects', s)}>{s}</Chip>)}
                  </div>
                  <label className="block">
                    <span className="text-sm font-medium">Anything specific you want to learn?</span>
                    <input value={d.goal} onChange={e => setD({ ...d, goal: e.target.value })} placeholder="e.g. Get better at algebra, or learn to code a game" maxLength={120} className={`${input} mt-2 !h-12 text-base`} />
                  </label>
                </div>
              )}

              {step === 'you' && (
                <div className="flex flex-col gap-6">
                  <label className="block">
                    <span className="text-sm font-medium">Your hobbies</span>
                    <input autoFocus value={d.hobbies} onChange={e => setD({ ...d, hobbies: e.target.value })} placeholder="e.g. Cricket, drawing, chess" maxLength={120} className={`${input} mt-2 !h-12 text-base`} />
                  </label>
                  <div>
                    <span className="text-sm font-medium">What are you curious about?</span>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {INTERESTS.map(s => <Chip key={s} on={d.interests.includes(s)} onClick={() => toggle('interests', s)}>{s}</Chip>)}
                    </div>
                  </div>
                </div>
              )}

              {step === 'calendar' && (
                <div className="flex flex-col gap-5">
                  <ImportCalendar />
                  <div className="rounded-xl border hairline p-3">
                    <div className="mb-2 text-sm font-medium">Or add a test or exam date yourself</div>
                    <AddForm date={today} defaultKind="exam" />
                  </div>
                  {upcoming.length > 0 && (
                    <div>
                      <div className="text-sm font-medium">In your calendar</div>
                      <ul className="mt-1 -mx-2">{upcoming.map(x => <ItemRow key={x.id} item={x} today={today} showDate />)}</ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mx-auto mt-10 flex w-full max-w-xl items-center gap-3">
          {i > 0 && (
            <button onClick={() => go(-1)} className="btn btn-ghost !min-h-12">
              <Icon icon={ArrowLeft02Icon} size={18} /> Back
            </button>
          )}
          {(step === 'you' || step === 'calendar') && (
            <button onClick={step === 'calendar' ? finish : () => go(1)} className="ml-auto text-sm text-muted hover:text-[var(--fg)] transition-colors">
              {step === 'calendar' ? 'Skip for now' : 'Skip'}
            </button>
          )}
          <button onClick={next} disabled={!can[step]} className={`btn !min-h-12 !px-6 font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 hover:brightness-105 disabled:opacity-40 ${step === 'you' || step === 'calendar' ? '' : 'ml-auto'}`}>
            {step === 'calendar' ? `Start learning${first ? `, ${first}` : ''}` : 'Continue'} <Icon icon={ArrowRight02Icon} size={18} stroke={2} />
          </button>
        </div>
      </main>
    </div>
  );
}
