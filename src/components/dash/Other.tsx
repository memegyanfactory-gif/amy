import { motion } from 'motion/react';
import { ArrowRight02Icon, RepeatIcon, Brain02Icon, CheckmarkCircle02Icon, Time04Icon, Idea01Icon } from '@hugeicons/core-free-icons';
import Amy from '../Amy';
import { Icon } from '../ui';
import { REGIONS, useRegion } from '../../region';
import { useProfile } from '../../store';
import { useTheme } from '../../theme';
import SpotlightCard from '../../bits/SpotlightCard';

const page = 'mx-auto max-w-5xl px-4 sm:px-6 pt-10 sm:pt-14';
const rise = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] as const } });

export function Practice() {
  const { theme } = useTheme();
  const games = [
    { icon: RepeatIcon, title: 'Revision', text: 'The questions you got wrong, back before you forget them. 6 are due.', cta: 'Start, 4 min' },
    { icon: Time04Icon, title: 'Concept Sprint', text: '60 seconds. As many questions as you can get right.', cta: 'Play' },
    { icon: Brain02Icon, title: 'Match-up', text: 'Pair each question with its answer, against the clock.', cta: 'Play' },
    { icon: Idea01Icon, title: "Spot Amy's mistake", text: 'Amy works a problem and gets one step wrong on purpose. Find it.', cta: 'Play' }
  ];
  return (
    <div className={page}>
      <motion.h1 {...rise(0)} className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
        <span className="serif">Games</span> that make it stick
      </motion.h1>
      <motion.p {...rise(1)} className="text-muted mt-1">Short games on the lessons you have been learning. Anything you get wrong is saved to Revision.</motion.p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {games.map((g, i) => (
          <motion.div key={g.title} {...rise(i + 2)}>
            <SpotlightCard theme={theme} spotlightColor="rgba(255,160,72,.18)" className="!rounded-xl !p-6 !bg-[var(--card)] !border-[var(--line)] h-full">
              <Icon icon={g.icon} size={26} className="text-amy-500" />
              <div className="mt-4 text-xl font-semibold tracking-tight">{g.title}</div>
              <div className="mt-1 text-muted">{g.text}</div>
              <button className="btn btn-ghost mt-5 !min-h-10">{g.cta}</button>
            </SpotlightCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function Me() {
  const { region, setRegion } = useRegion();
  const { profile, setProfile } = useProfile();
  const plus = profile.plan === 'plus';
  const facts: [string, string][] = [
    ['Name', profile.name || '—'],
    ['Age', profile.age || '—'],
    ['Class', [profile.klass, profile.stage].filter(Boolean).join(' · ') || '—'],
    ['Subjects', profile.subjects.join(', ') || '—'],
    ['Wants to learn', profile.goal || '—'],
    ['Hobbies', profile.hobbies || '—'],
    ['Curious about', profile.interests.join(', ') || '—']
  ];
  return (
    <div className={page}>
      <motion.div {...rise(0)} className="card flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amy-200 to-amy-600 text-3xl font-semibold text-[#2a1406]">{(profile.name.trim()[0] ?? 'A').toUpperCase()}</div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-semibold tracking-tight">{profile.name || 'Student'}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${plus ? 'bg-amy-500 text-[#2a1406]' : 'bg-[var(--card-2)] text-fg2'}`}>{plus ? 'Amy+' : 'Free plan'}</span>
          </div>
          <div className="text-muted">{[profile.klass || profile.stage, region.boards[0], region.name].filter(Boolean).join(' · ')}</div>
        </div>
        <div className="sm:ml-auto">
          <Amy size={72} mood="happy" />
        </div>
      </motion.div>

      {/* the plan they are on */}
      <motion.div {...rise(1)} className="mt-4 rounded-2xl bg-gradient-to-br from-amy-200 via-amy-500 to-amy-600 p-[1.5px]">
        <div className="grid gap-6 rounded-[15px] bg-[var(--card)] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div>
            <div className="text-sm text-muted">You are on</div>
            <div className="mt-0.5 text-2xl font-semibold tracking-tight">
              {plus ? <>Amy+ <span className="text-muted font-normal">· ₹1,999 a month</span></> : <>Amy <span className="text-muted font-normal">· Free</span></>}
            </div>
            <ul className="mt-4 grid gap-2 text-[15px] sm:grid-cols-2">
              {(plus
                ? ['225 voice minutes every 2 days', '5 new courses every week', 'Twice the thinking time on hard questions', 'New features first']
                : ['15 voice minutes every 2 days', '2 courses of your own', 'Every lesson, quiz and game', 'Every chat saved']
              ).map(t => (
                <li key={t} className="flex items-start gap-2">
                  <Icon icon={CheckmarkCircle02Icon} size={18} className="mt-0.5 shrink-0 text-amy-500" /> {t}
                </li>
              ))}
            </ul>
            {!plus && <p className="mt-4 text-sm text-muted">Amy+ gives you 15 times the voice calls, 5 new courses a week and longer thinking on hard questions.</p>}
          </div>
          {plus ? (
            <button onClick={() => setProfile({ plan: 'free' })} className="btn btn-ghost !min-h-12 !px-6">Cancel Amy+</button>
          ) : (
            <a href="#/" onClick={() => setTimeout(() => document.getElementById('pricing')?.scrollIntoView(), 500)} className="btn !min-h-12 !px-6 font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 hover:brightness-105">
              Get Amy+ <Icon icon={ArrowRight02Icon} size={18} stroke={2} />
            </a>
          )}
        </div>
      </motion.div>

      {/* what Amy knows about them */}
      <motion.div {...rise(2)} className="card mt-4 p-6 sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">What Amy knows about you</h2>
          <button onClick={() => setProfile({ onboarded: false })} className="text-sm font-medium text-amy-600 hover:underline dark:text-amy-200">Change answers</button>
        </div>
        <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-t hairline py-3">
              <dt className="text-muted">{k}</dt>
              <dd className="text-right">{v}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <motion.label {...rise(3)} className="card flex items-center justify-between gap-4 p-5">
          <span className="text-muted">Where I study</span>
          <select value={region.code} onChange={e => setRegion(e.target.value)} className="rounded-lg border hairline bg-[var(--card-2)] px-3 py-2 text-[15px] outline-none">
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>{r.name}</option>
            ))}
          </select>
        </motion.label>
        <motion.div {...rise(4)} className="card flex items-center justify-between gap-4 p-5">
          <span className="text-muted">Amy explains</span>
          <span className="text-right">One step at a time, with a check</span>
        </motion.div>
      </div>
    </div>
  );
}
