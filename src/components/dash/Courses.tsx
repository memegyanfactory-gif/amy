import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'motion/react';
import { ArrowDown01Icon, ArrowRight02Icon, Cancel01Icon, CheckmarkCircle02Icon, Notebook01Icon, PlayIcon, PlusSignIcon, Search01Icon } from '@hugeicons/core-free-icons';
import { art, Icon, SUBJECT_ART, SUBJECT_COLOR } from '../ui';
import { useRegion } from '../../region';
import { useProgress } from '../../store';
import { LESSONS } from '../../lessons';

const EASE = [0.23, 1, 0.32, 1] as const;

/** Every folder is the same manila paper. The subject only shows as a small dot. */
const FOLDER_BACK = '#c59f5f';
const FOLDER_FRONT = 'linear-gradient(165deg, #f8e8bf 0%, #efd59c 55%, #e2c07d 100%)';
const INK = '#2a1f10';

const page = 'mx-auto max-w-5xl px-4 sm:px-6 pt-10 sm:pt-14';

/* ------------------------------------------------------------------ */
/* Data: a course holds chapters, a chapter holds short concept lessons */
/* ------------------------------------------------------------------ */

export interface Chapter {
  title: string;
  concepts: string[];
}
export interface Course {
  subject: string;
  title: string;
  /** Board and class, or a level such as "Advanced". */
  level: string;
  about?: string;
  mine?: boolean;
  from?: string;
  /** What is written on the loose sheet inside the folder. */
  note: string;
  chapters: Chapter[];
  /** Totals, when the folder lists only its first chapters. */
  chapterCount?: number;
  conceptCount?: number;
  /** Concepts already passed. Undefined means not enrolled. */
  done?: number;
}

const ch = (title: string, ...concepts: string[]): Chapter => ({ title, concepts });
const concepts = (c: Course) => c.conceptCount ?? c.chapters.reduce((n, x) => n + x.concepts.length, 0);
const chapters = (c: Course) => c.chapterCount ?? c.chapters.length;

export const MY_COURSES: Course[] = [
  {
    subject: 'Physics', title: 'Motion', level: 'Class 9', note: 'v = u + at', done: 4,
    chapters: [
      ch('Describing motion', 'Distance and displacement', 'Uniform and non-uniform motion'),
      ch('Speed and velocity', 'Speed', 'Velocity', 'Acceleration: speeding up and slowing down'),
      ch('Graphs of motion', 'Distance–time graphs', 'Velocity–time graphs'),
      ch('Equations of motion', 'The three equations', 'Using the equations', 'Uniform circular motion')
    ]
  },
  {
    subject: 'Maths', title: 'Linear equations in two variables', level: 'Class 9', note: '2x + 3y = 12', done: 4,
    chapters: [
      ch('Linear equations', 'What is a linear equation?', 'Solutions of a linear equation'),
      ch('Graphs', 'Graph of a linear equation', 'Lines parallel to the axes'),
      ch('Using them', 'Word problems', 'Chapter check')
    ]
  },
  {
    subject: 'Chemistry', title: 'Atoms and molecules', level: 'Class 9', note: 'H₂O = 18 u', done: 3, from: "From Ms Kapoor's class",
    chapters: [
      ch('Laws of chemical combination', 'Conservation of mass', 'Constant proportions'),
      ch('Atoms', 'What is an atom?', 'Atomic mass'),
      ch('Molecules and ions', 'Molecules and ions', 'Writing chemical formulae'),
      ch('The mole concept', "Mole and Avogadro's number", 'Molar mass')
    ]
  },
  {
    subject: 'Biology', title: 'The fundamental unit of life', level: 'Class 9', note: 'cell → tissue → organ', done: 7,
    chapters: [
      ch('What are cells?', 'Discovery of the cell', 'Unicellular and multicellular'),
      ch('Parts of a cell', 'Cell membrane and cell wall', 'The nucleus', 'Cytoplasm'),
      ch('Organelles', 'Mitochondria and plastids', 'Endoplasmic reticulum and Golgi'),
      ch('Cells at work', 'Plant and animal cells', 'How cells divide')
    ]
  },
  {
    subject: 'English', title: 'Beehive: The Fun They Had', level: 'Class 9', note: '“…the fun they had.”', done: 0,
    chapters: [ch('The Fun They Had', 'Read the story', 'Margie and Tommy', 'Schools then and now', 'Writing task')]
  },
  {
    subject: 'Biology', title: 'Cells, from my notes', level: 'From 14 pages of notes', mine: true, note: 'my notes, p. 1–14', done: 2,
    chapters: [ch('From your notes', 'Cell basics', 'Cell membrane and wall', 'Nucleus and DNA', 'Mitochondria: the powerhouse', 'Quick revision')]
  }
];

const CATALOG: Course[] = [
  {
    subject: 'Chemistry', title: 'ICSE Class 10: Chemistry', level: 'ICSE Class 10', note: 'NaOH + HCl →', chapterCount: 12, conceptCount: 32,
    about: 'Based on Selina Concise Chemistry. Periodic table, chemical bonding, acids and bases, mole concept, electrolysis, metallurgy and organic chemistry.',
    chapters: [
      ch('Periodic Table, Periodic Properties and Variations', 'Modern Periodic Law and Periodic Table', 'Periodicity in Properties', 'Metallic and Non-Metallic Character Trends'),
      ch('Chemical Bonding', 'Electrovalent (Ionic) Bonding', 'Covalent Bonding', 'Properties of Ionic and Covalent Compounds'),
      ch('Acids, Bases and Salts', 'Properties of Acids and Bases', 'pH Scale and Indicators', 'Neutralization and Salt Formation'),
      ch('Analytical Chemistry', 'Identification of Cations and Anions', 'Flame Tests and Gas Tests'),
      ch('Mole Concept and Stoichiometry', "Mole and Avogadro's Number", 'Molar Mass and Mole Calculations', 'Stoichiometric Calculations')
    ]
  },
  { subject: 'Maths', title: 'ICSE Class 10: Mathematics', level: 'ICSE Class 10', note: 'sin²θ + cos²θ = 1', chapterCount: 25, conceptCount: 58, about: 'Based on Selina Concise Mathematics. Algebra, geometry, trigonometry, statistics, probability and matrices.', chapters: [] },
  { subject: 'Physics', title: 'ICSE Class 10: Physics', level: 'ICSE Class 10', note: 'V = IR', chapterCount: 12, conceptCount: 45, about: 'Based on Selina Concise Physics. Force, energy, light, sound, electricity, magnetism, calorimetry and radioactivity.', chapters: [] },
  { subject: 'Biology', title: 'ICSE Class 10: Biology', level: 'ICSE Class 10', note: 'DNA → RNA → protein', chapterCount: 15, conceptCount: 46, about: 'Based on Selina Concise Biology. Cell biology, genetics, plant physiology, human body systems, reproduction, population and pollution.', chapters: [] },
  { subject: 'Maths', title: 'AP Calculus AB', level: 'Advanced', note: '∫ f′(x) dx = f(x)', chapterCount: 3, conceptCount: 9, about: 'Limits, derivatives, integrals and the Fundamental Theorem of Calculus, with exam-style problem solving.', chapters: [] },
  { subject: 'Economics', title: 'AP Macroeconomics', level: 'Advanced', note: 'AD = C + I + G + NX', chapterCount: 3, conceptCount: 9, about: 'Measuring the economy, AD/AS, money and banking, monetary and fiscal policy, and international economics.', chapters: [] },
  { subject: 'French', title: "French: Beginner's Foundation", level: 'Beginner', note: 'Bonjour, ça va ?', chapterCount: 3, conceptCount: 9, about: 'Greetings, essential vocabulary, pronouns and your first verbs, with pronunciation tips.', chapters: [] },
  { subject: 'Computer Science', title: 'LLM', level: 'Advanced', note: 'tokens → attention', chapterCount: 1, conceptCount: 10, about: 'How large language models are built and used: their architecture, real uses, and how to build one from scratch.', chapters: [] }
];

/* ------------------------------------------------------------------ */
/* The folder                                                           */
/* ------------------------------------------------------------------ */

const sheet = (i: number): Variants => ({
  rest: { y: 0, x: 0, rotate: [-4, 2, 5][i], transition: { type: 'spring', stiffness: 260, damping: 22 } },
  open: { y: [-34, -46, -30][i], x: [-22, 0, 24][i], rotate: [-11, -1, 10][i], transition: { type: 'spring', stiffness: 220, damping: 16, delay: i * 0.04 } }
});
const flap: Variants = {
  rest: { rotateX: 0, transition: { type: 'spring', stiffness: 260, damping: 24 } },
  open: { rotateX: -24, transition: { type: 'spring', stiffness: 200, damping: 18 } }
};

/** The loose sheet: the course's own formula or line, and for maths a small graph. */
function NoteSheet({ course }: { course: Course }) {
  return (
    <div className="flex h-full flex-col bg-[#fffdf6] p-2.5 text-[#2a1f10]">
      <div className="hand truncate text-[17px] leading-none">{course.note}</div>
      {course.subject === 'Maths' ? (
        <svg viewBox="0 0 80 46" className="mt-1 w-full flex-1" aria-hidden>
          <path d="M8 4 V40 H76" fill="none" stroke="#2a1f10" strokeOpacity=".35" strokeWidth="1.2" />
          <path d="M10 12 L70 38" fill="none" stroke="#ff8a3d" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="33" cy="22" r="2.6" fill="#2a1f10" />
        </svg>
      ) : (
        <div className="mt-2 flex flex-1 flex-col gap-1.5">
          {[88, 64, 78, 46].map((w, i) => (
            <span key={i} className="h-[3px] rounded-full bg-black/12" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The contents sheet: the first chapters. */
function ListSheet({ course }: { course: Course }) {
  const rows = course.chapters.length > 1 ? course.chapters.map(c => c.title) : (course.chapters[0]?.concepts ?? [course.level]);
  return (
    <div className="h-full bg-white p-2.5 text-[#2a1f10]">
      {rows.slice(0, 4).map((d, i) => (
        <div key={d} className="flex items-center gap-1.5 border-b border-black/10 py-[3px] text-[9px] leading-tight">
          <span className="w-2 shrink-0 font-semibold opacity-50">{i + 1}</span>
          <span className="truncate">{d}</span>
        </div>
      ))}
    </div>
  );
}

export function Folder({ course, index = 0, onOpen, compact = false }: { course: Course; index?: number; onOpen: () => void; compact?: boolean }) {
  const { region } = useRegion();
  const c = SUBJECT_COLOR[course.subject] ?? 'var(--muted)';
  const total = concepts(course);
  const { doneIn } = useProgress();
  const enrolled = course.done !== undefined;
  const doneN = enrolled ? Math.min(total, doneIn(course.title, course.done)) : 0;
  const pct = enrolled ? Math.round((doneN / total) * 100) : 0;
  const subject = course.subject === 'Maths' ? region.math : course.subject;
  const sheets = [
    <img key="p" src={art(SUBJECT_ART[course.subject] ?? 'reading')} alt="" loading="lazy" className="h-full w-full object-cover" />,
    <NoteSheet key="n" course={course} />,
    <ListSheet key="l" course={course} />
  ];
  return (
    <motion.button onClick={onOpen} initial="rest" animate="rest" whileHover="open" whileFocus="open" whileTap="open" aria-label={`Open ${course.title}`} className="group relative block aspect-[5/4] w-full text-left [perspective:900px] focus-visible:outline-none">
      <motion.span className="absolute inset-0 block" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * index, duration: 0.6, ease: EASE }}>
        {/* back of the folder, with its tab */}
        <span aria-hidden className="absolute left-0 top-0 h-[16%] w-[44%] rounded-t-xl [clip-path:polygon(0_0,80%_0,100%_100%,0_100%)]" style={{ background: FOLDER_BACK }} />
        <span aria-hidden className="absolute inset-x-0 bottom-0 top-[13%] rounded-2xl rounded-tl-none" style={{ background: FOLDER_BACK }} />

        {/* what is inside */}
        {sheets.map((s, i) => (
          <motion.span key={i} variants={sheet(i)} aria-hidden className="absolute bottom-[34%] block h-[56%] w-[46%] overflow-hidden rounded-md shadow-[0_6px_16px_-6px_rgba(0,0,0,.55)] ring-1 ring-black/10" style={{ left: `${[7, 27, 47][i]}%`, zIndex: i === 1 ? 3 : 2 }}>
            {s}
          </motion.span>
        ))}

        {/* front flap */}
        <motion.span variants={flap} className={`absolute inset-x-0 bottom-0 z-10 flex h-[64%] origin-bottom flex-col rounded-2xl shadow-[0_-10px_24px_-14px_rgba(0,0,0,.6),0_24px_40px_-24px_rgba(0,0,0,.6)] ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`} style={{ background: FOLDER_FRONT, color: INK }}>
          <span className="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide opacity-70">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span className="size-2 shrink-0 rounded-full" style={{ background: c }} />
              <span className="truncate">{subject}</span>
            </span>
            {!compact && <span className="shrink-0 normal-case tracking-normal">{course.mine ? 'Made by you' : course.level}</span>}
          </span>
          <span className={`mt-1.5 line-clamp-2 font-semibold leading-snug tracking-tight ${compact ? 'text-[15px]' : 'text-lg sm:text-xl'}`}>{course.title}</span>
          <span className="mt-auto block">
            <span className="flex items-center justify-between gap-2 text-xs font-medium opacity-75">
              <span className="truncate">{compact ? `${doneN} of ${total} done` : `${chapters(course)} ${chapters(course) === 1 ? 'chapter' : 'chapters'} · ${total} concepts`}</span>
              <span className="shrink-0 tabular-nums">{enrolled ? `${pct}%` : 'Enroll'}</span>
            </span>
            {enrolled && (
              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-black/12">
                <motion.span className="block h-full rounded-full bg-gradient-to-r from-amy-400 to-amy-600" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.4 + index * 0.06, duration: 1, ease: EASE }} />
              </span>
            )}
          </span>
        </motion.span>
      </motion.span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* The folder, opened: chapters, each holding its concept lessons       */
/* ------------------------------------------------------------------ */

function Opened({ course, onClose, onLearn }: { course: Course; onClose: () => void; onLearn?: (i: number) => void }) {
  const { doneIn } = useProgress();
  const { region } = useRegion();
  const c = SUBJECT_COLOR[course.subject] ?? 'var(--muted)';
  const enrolled = course.done !== undefined;
  const done = enrolled ? doneIn(course.title, course.done) : 0;
  // The chapter that holds the next lesson starts open.
  const firstOpen = useMemo(() => {
    let seen = 0;
    for (let i = 0; i < course.chapters.length; i++) {
      seen += course.chapters[i].concepts.length;
      if (done < seen) return i;
    }
    return 0;
  }, [course, done]);
  const [openCh, setOpenCh] = useState<number | null>(firstOpen);
  const moreChapters = chapters(course) - course.chapters.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  let before = 0;
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
      <motion.div role="dialog" aria-modal="true" aria-label={course.title} initial={{ y: 60, scale: 0.94, rotateX: 12 }} animate={{ y: 0, scale: 1, rotateX: 0 }} exit={{ y: 40, scale: 0.96, opacity: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 24 }} className="relative flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-[var(--line-2)] bg-[var(--card)] shadow-2xl sm:rounded-3xl" style={{ transformPerspective: 1200 }}>
        <div className="relative h-36 shrink-0 sm:h-44">
          <img src={art(SUBJECT_ART[course.subject] ?? 'reading')} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70">
            <Icon icon={Cancel01Icon} size={18} />
          </button>
          <div className="absolute inset-x-5 bottom-4 text-white">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold backdrop-blur">
              <span className="size-2 rounded-full" style={{ background: c }} />
              {course.subject === 'Maths' ? region.math : course.subject}
            </span>
            <div className="mt-2 text-2xl font-semibold leading-tight tracking-tight">{course.title}</div>
            <div className="mt-0.5 text-sm opacity-80">
              {course.mine ? 'Made by you' : course.level} · {chapters(course)} {chapters(course) === 1 ? 'chapter' : 'chapters'} · {concepts(course)} concepts
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          {course.about && <p className="text-[15px] leading-relaxed text-muted">{course.about}</p>}
          {!enrolled && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button className="btn !min-h-11 !px-5 font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 hover:brightness-105">Enroll for free</button>
              <span className="text-sm text-muted">Enroll to open the lessons, in order.</span>
            </div>
          )}
          {course.from && <div className="text-sm text-amy-500">{course.from}</div>}

          {course.chapters.length > 0 && <div className="mt-5 text-sm font-medium text-muted">Course content</div>}
          <div className="mt-2 flex flex-col gap-2">
            {course.chapters.map((chap, i) => {
              const start = before;
              before += chap.concepts.length;
              const chDone = Math.max(0, Math.min(chap.concepts.length, done - start));
              const on = openCh === i;
              return (
                <motion.div key={chap.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: EASE }} className="overflow-hidden rounded-xl border hairline">
                  <button onClick={() => setOpenCh(on ? null : i)} aria-expanded={on} className="flex w-full items-center gap-3 bg-[var(--bg-2)] px-3.5 py-3 text-left">
                    <span className="hand w-6 shrink-0 text-2xl leading-none text-amy-500">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{chap.title}</span>
                      <span className="block text-sm text-muted">
                        {chap.concepts.length} {chap.concepts.length === 1 ? 'concept' : 'concepts'}
                        {enrolled && ` · ${chDone} done`}
                      </span>
                    </span>
                    <motion.span animate={{ rotate: on ? 180 : 0 }} className="shrink-0 text-muted">
                      <Icon icon={ArrowDown01Icon} size={18} />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.ul initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                        {chap.concepts.map((name, k) => {
                          const n = start + k;
                          const passed = enrolled && n < done;
                          const next = enrolled && n === done;
                          return (
                            <li key={name} onClick={() => enrolled && n <= done && onLearn?.(n)} className={`flex items-center gap-3 border-t hairline px-3.5 py-2.5 ${next ? 'bg-amy-400/10' : ''} ${enrolled && n <= done ? 'cursor-pointer hover:bg-[var(--card-2)]' : ''}`}>
                              <span className="relative grid h-9 w-7 shrink-0 place-items-center rounded-[5px] border border-[var(--line-2)] bg-[var(--bg)]">
                                <span aria-hidden className="absolute right-0 top-0 size-2 rounded-bl-[4px] border-b border-l border-[var(--line-2)] bg-[var(--card-2)]" />
                                <span className="h-px w-3 bg-[var(--line-2)] shadow-[0_3px_0_var(--line-2),0_6px_0_var(--line-2)]" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[15px]">{name}</span>
                                <span className="block text-xs text-muted">{LESSONS[name]?.minutes ?? 15} min · {passed ? 'passed the quiz' : next ? 'up next' : 'not started'}</span>
                              </span>
                              {passed && <Icon icon={CheckmarkCircle02Icon} size={19} className="shrink-0 text-[var(--right)]" />}
                              {next && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--invert)] px-3 py-1.5 text-xs font-medium text-[var(--on-invert)]">
                                  <Icon icon={PlayIcon} size={12} /> Continue
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
          {moreChapters > 0 && course.chapters.length > 0 && <div className="px-1 pt-3 text-sm text-muted">and {moreChapters} more chapters</div>}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export function Courses({ onLearn }: { onLearn?: (c: Course, i: number) => void }) {
  const [open, setOpen] = useState<Course | null>(null);
  const [q, setQ] = useState('');
  const [subject, setSubject] = useState('All');
  const subjects = useMemo(() => ['All', ...new Set(CATALOG.map(c => c.subject))], []);
  const shown = CATALOG.filter(c => (subject === 'All' || c.subject === subject) && c.title.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <div className={page}>
      <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em]">
        Your <span className="serif">courses</span>
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-muted mt-1">
        Each course is a folder of chapters. Open one to pick up the next lesson.
      </motion.p>

      <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {MY_COURSES.map((c, i) => (
          <Folder key={c.title} course={c} index={i} onOpen={() => setOpen(c)} />
        ))}

        <motion.button initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 * MY_COURSES.length, duration: 0.6, ease: EASE }} whileHover={{ y: -4 }} className="group relative block aspect-[5/4] w-full text-left">
          <span aria-hidden className="absolute left-0 top-0 h-[16%] w-[44%] rounded-t-xl border-2 border-b-0 border-dashed border-[var(--line-2)]" />
          <span className="absolute inset-x-0 bottom-0 top-[13%] flex flex-col justify-center gap-2 rounded-2xl rounded-tl-none border-2 border-dashed border-[var(--line-2)] p-5 transition-colors group-hover:border-amy-400 group-hover:bg-[var(--card-2)]">
            <span className="grid size-11 place-items-center rounded-xl bg-amy-400/15 text-amy-500 transition-transform group-hover:rotate-90">
              <Icon icon={PlusSignIcon} size={22} />
            </span>
            <span className="text-lg font-semibold tracking-tight">Make your own course</span>
            <span className="text-sm text-muted">Type anything you want to learn, or add notes, a PDF or slides. Amy plans it in seconds.</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium">
              <Icon icon={Notebook01Icon} size={16} className="text-amy-500" /> Create course <Icon icon={ArrowRight02Icon} size={15} className="transition-transform group-hover:translate-x-1" />
            </span>
          </span>
        </motion.button>
      </div>

      {/* the catalogue */}
      <section className="mt-20 border-t hairline pt-12">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em]">
          Explore <span className="serif">more courses</span>
        </h2>
        <p className="text-muted mt-1">Pick one that fits your class and board. Enrolling is free.</p>

        <label className="mt-6 flex items-center gap-3 rounded-xl border hairline bg-[var(--card)] px-4 focus-within:border-amy-400/70 transition-colors">
          <Icon icon={Search01Icon} size={18} className="shrink-0 text-muted" />
          <span className="sr-only">Search courses</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search courses, chapters or topics" className="h-12 min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--muted)]" />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          {subjects.map(s => (
            <button key={s} onClick={() => setSubject(s)} aria-pressed={s === subject} className={`relative rounded-full px-3.5 py-1.5 text-sm transition-colors ${s === subject ? 'text-[var(--on-invert)]' : 'border hairline text-fg2 hover:border-amy-400'}`}>
              {s === subject && <motion.span layoutId="catalog-subject" className="absolute inset-0 rounded-full bg-[var(--invert)]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
              <span className="relative">{s}</span>
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((c, i) => (
              <motion.div key={c.title} layout initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.3 }}>
                <Folder course={c} index={i} onOpen={() => setOpen(c)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {shown.length === 0 && <p className="mt-10 text-muted">No course matches that. Try another word, or make your own course above.</p>}
      </section>

      <AnimatePresence>{open && <Opened key={open.title} course={open} onClose={() => setOpen(null)} onLearn={i => { const c = open; setOpen(null); onLearn?.(c, i); }} />}</AnimatePresence>
    </div>
  );
}
