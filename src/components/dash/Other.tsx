import { motion } from 'motion/react';
import { RepeatIcon, Brain02Icon, Time04Icon, Idea01Icon, Notebook01Icon } from '@hugeicons/core-free-icons';
import Amy from '../Amy';
import { Icon, SUBJECT_COLOR } from '../ui';
import { useTheme } from '../../theme';
import SpotlightCard from '../../bits/SpotlightCard';

const page = 'mx-auto max-w-5xl px-4 sm:px-6 pt-10 sm:pt-14';
const rise = (i: number) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.05, duration: 0.5, ease: [0.23, 1, 0.32, 1] as const } });

const COURSES = [
  { subject: 'Physics', title: 'Motion', board: 'CBSE · Class 9', lessons: 12, done: 5, time: 'about 4 h' },
  { subject: 'Maths', title: 'Linear equations in two variables', board: 'CBSE · Class 9', lessons: 9, done: 4, time: 'about 3 h' },
  { subject: 'Chemistry', title: 'Atoms and molecules', board: 'CBSE · Class 9', lessons: 8, done: 3, time: 'about 3 h', from: "From Ms Kapoor's class" },
  { subject: 'Biology', title: 'The fundamental unit of life', board: 'CBSE · Class 9', lessons: 10, done: 7, time: 'about 3 h' },
  { subject: 'English', title: 'Beehive: The Fun They Had', board: 'CBSE · Class 9', lessons: 4, done: 0, time: 'about 1 h' },
  { subject: 'Biology', title: 'Cells, from my notes', board: 'Made by you', lessons: 5, done: 2, time: 'from 14 pages of notes' }
];

export function Courses() {
  return (
    <div className={page}>
      <motion.h1 {...rise(0)} className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
        Your <span className="serif">courses</span>
      </motion.h1>
      <motion.p {...rise(1)} className="text-muted mt-1">Pick up any of them, or make one from your own notes.</motion.p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {COURSES.map((c, i) => (
          <motion.div key={c.title} {...rise(i + 2)}>
            <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }} className="card h-full cursor-pointer hover:border-[var(--line-2)] transition-colors">
              <div className="p-6 flex flex-col h-full gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium" style={{ color: SUBJECT_COLOR[c.subject] }}>
                    {c.subject}
                  </span>
                  <span className="text-muted">{c.board}</span>
                </div>
                <div className="text-xl font-semibold tracking-tight leading-snug">{c.title}</div>
                <div className="text-sm text-muted">
                  {c.lessons} lessons · {c.time}
                </div>
                {c.from && <div className="text-sm text-amy-500">{c.from}</div>}
                <div className="mt-auto pt-3">
                  <div className="h-1.5 rounded-lg bg-[var(--card-2)] overflow-hidden">
                    <motion.div className="h-full rounded-lg" style={{ background: SUBJECT_COLOR[c.subject] }} initial={{ width: 0 }} animate={{ width: `${(c.done / c.lessons) * 100}%` }} transition={{ delay: 0.3 + i * 0.06, duration: 1 }} />
                  </div>
                  <div className="mt-1.5 text-xs text-muted">{c.done ? `${c.done} of ${c.lessons} done` : 'Not started'}</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ))}
        <motion.button {...rise(9)} className="rounded-xl border border-dashed hairline p-6 text-left hover:bg-[var(--card-2)] transition-colors flex flex-col gap-3 min-h-[200px]">
          <Icon icon={Notebook01Icon} className="text-amy-500" size={24} />
          <div className="text-lg font-semibold">Make a course from your notes</div>
          <div className="text-sm text-muted">Upload photos, a PDF or slides. Amy turns them into short lessons with checks.</div>
        </motion.button>
      </div>
    </div>
  );
}

export function Practice() {
  const { theme } = useTheme();
  const games = [
    { icon: RepeatIcon, title: 'Revision', text: '6 questions due. The ones you got "Not yet" on.', cta: 'Start, 4 min' },
    { icon: Time04Icon, title: 'Concept sprint', text: '60 seconds. As many right as you can.', cta: 'Play' },
    { icon: Idea01Icon, title: "Spot Amy's mistake", text: 'She solves it with one wrong step. Find it.', cta: 'Play' },
    { icon: Brain02Icon, title: 'Mock paper', text: 'Physics, Motion. Marked the way an examiner would.', cta: 'Start, 40 min' }
  ];
  return (
    <div className={page}>
      <motion.h1 {...rise(0)} className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
        <span className="serif">Practice</span> makes it stick
      </motion.h1>
      <motion.p {...rise(1)} className="text-muted mt-1">A few minutes a day beats a whole night before the test.</motion.p>
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
  return (
    <div className={page}>
      <motion.div {...rise(0)} className="card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 sm:items-center">
        <div className="grid size-20 place-items-center rounded-lg bg-gradient-to-br from-amy-200 to-amy-600 text-[#2a1406] text-3xl font-semibold">R</div>
        <div>
          <div className="text-2xl font-semibold tracking-tight">Riya Sharma</div>
          <div className="text-muted">Class 9 · CBSE · Delhi Public School</div>
        </div>
        <div className="sm:ml-auto">
          <Amy size={72} mood="happy" />
        </div>
      </motion.div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {[
          ['Language', 'English, with Hinglish when I ask'],
          ['Amy explains', 'One step at a time, with a check'],
          ['Voice', 'Calm, normal speed'],
          ['School', 'Joined · Class 9 B']
        ].map(([k, v], i) => (
          <motion.div key={k} {...rise(i + 1)} className="card p-5 flex justify-between gap-4">
            <span className="text-muted">{k}</span>
            <span className="text-right">{v}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
