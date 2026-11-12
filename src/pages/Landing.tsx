import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
import {
  ArrowDown01Icon,
  ArrowRight02Icon,
  Brain02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Drag01Icon,
  Key01Icon,
  Mail01Icon,
  Menu01Icon,
  Mic01Icon,
  Rocket01Icon,
  School01Icon,
  Tick02Icon,
  UserGroupIcon
} from '@hugeicons/core-free-icons';

import Amy from '../components/Amy';
import ChatDemo from '../components/ChatDemo';
import { Icon, Logo, ThemeToggle } from '../components/ui';
import { CheckDemo, Faq, MiniGraph, NotesToCourse, Spaced, Tile, TypedAsk, Wave } from '../components/LandingBits';
import { go } from '../router';
import LogoLoop from '../bits/LogoLoop';

const EASE = [0.23, 1, 0.32, 1] as const;
const wrap = 'mx-auto w-full max-w-6xl px-5 sm:px-8';
const art = (name: string) => `${import.meta.env.BASE_URL}art/${name}.webp`;
const ask = (q: string) => go(`/app?ask=${encodeURIComponent(q)}`);

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.7, ease: EASE, delay }
});

/* ------------------------------------------------------------------ */
/* Content, taken from amy-tutor.com                                   */
/* ------------------------------------------------------------------ */

const STAGES: { id: string; qs: string[] }[] = [
  { id: 'Class 1–5', qs: ['Why does ice float on water?', 'What makes a rainbow?', 'How do plants drink water?'] },
  { id: 'Class 6–8', qs: ['Solve 3x + 7 = 22 step by step', 'Why does the moon change shape?', 'What is photosynthesis?'] },
  { id: 'Class 9–10', qs: ['Explain Newton’s third law with an example', 'Quiz me on the mole concept', 'Prove the Pythagoras theorem'] },
  { id: 'Class 11–12', qs: ['Explain integration by parts', 'How does a p-n junction work?', 'Quiz me on chemical bonding'] },
  { id: 'NEET', qs: ['Quiz me on human physiology', 'Explain the Krebs cycle step by step', 'Make me a mock paper on genetics'] }
];

const BOARDS = ['CBSE', 'ICSE', 'State boards', 'IB', 'Cambridge', 'AP', 'GCSE', 'A-Level', 'NIOS', 'NEET'];

const SUBJECTS: { img: string; title: string; who: string; q: string }[] = [
  { img: 'maths', title: 'Maths', who: 'Class 1 to 12', q: 'Solve 3x + 7 = 22 step by step' },
  { img: 'physics', title: 'Physics', who: 'Class 9 to 12 · NEET', q: 'Explain Newton’s third law with an example' },
  { img: 'science', title: 'Chemistry', who: 'Class 6 to 12 · NEET', q: 'Quiz me on the mole concept' },
  { img: 'biology', title: 'Biology', who: 'Class 6 to 12 · NEET', q: 'Quiz me on human physiology' },
  { img: 'nature', title: 'Science', who: 'Class 1 to 8', q: 'How do plants drink water?' },
  { img: 'space', title: 'Space', who: 'Any age', q: 'Why does the moon change shape?' },
  { img: 'world', title: 'Geography', who: 'Class 3 to 12', q: 'Why do we have seasons?' },
  { img: 'reading', title: 'English', who: 'Class 1 to 12', q: 'Help me write a story opening' },
  { img: 'coding', title: 'Coding', who: 'Your own course', q: 'Teach me to code, starting from zero' },
  { img: 'music', title: 'Reading music', who: 'Your own course', q: 'Teach me to read music' }
];

const COUNTRIES: [string, string[]][] = [
  ['India', ['CBSE', 'ICSE', 'ISC', 'State Board', 'NIOS']],
  ['United States', ['US curriculum (Common Core)', 'AP', 'SAT / ACT prep']],
  ['United Kingdom', ['National Curriculum (England)', 'GCSE', 'A-Level', 'Scottish Nationals / Highers']],
  ['Australia', ['Australian Curriculum', 'HSC (NSW)', 'VCE (Victoria)', 'QCE (Queensland)', 'WACE (WA)']],
  ['Canada', ['Ontario curriculum', 'BC curriculum', 'Alberta curriculum', 'Quebec curriculum']],
  ['Singapore', ['PSLE', 'O-Level (Singapore)', 'A-Level (Singapore)']],
  ['Malaysia', ['KSSM / SPM', 'STPM']],
  ['Philippines', ['DepEd K to 12']],
  ['Pakistan', ['Matric (SSC)', 'Intermediate (FSc / HSSC)']],
  ['Bangladesh', ['SSC (Bangladesh)', 'HSC (Bangladesh)']],
  ['Nepal', ['SEE (Nepal)', 'NEB (+2)']],
  ['Sri Lanka', ['O/L (Sri Lanka)', 'A/L (Sri Lanka)']],
  ['Nigeria', ['WAEC (WASSCE)', 'NECO', 'JAMB (UTME) prep']],
  ['Kenya', ['CBC (Kenya)', 'KCSE']],
  ['South Africa', ['CAPS (NSC)', 'IEB']],
  ['International school', ['IB', 'IGCSE', 'Cambridge (O / AS / A Level)', 'American curriculum', 'British curriculum']]
];

const FREE = [
  'Lessons and quizzes for CBSE, ICSE, state boards, IB and Cambridge',
  'Ask anything: type it, snap a photo or upload a PDF',
  'Talk it through with Amy on a live voice call (15 minutes every 2 days)',
  'A quick check after every idea, with your working marked',
  'Mock papers, marked the way an examiner would',
  'Diagrams, equations and mind maps drawn as she explains',
  'Turn your notes or slides into a course (2 courses)',
  'Spot the mistake and other revision games',
  'A mastery map of what to revisit before the exam',
  'Every chat saved, so you can pick up where you left off'
];

const PLUS: [string, string][] = [
  ['15 times the voice calls', '225 minutes every 2 days instead of 15, and three times as many replies read aloud.'],
  ['5 new courses every week', 'Free accounts get 2 in all; Amy+ makes 5 more each week.'],
  ['Thinks longer on hard questions', 'Twice the thinking time before she answers.'],
  ['Early access', 'New features reach you before anyone else.'],
  ['Everything in Amy', 'All ten, with nothing taken away.']
];

const FAQ = [
  { q: 'Is Amy free?', a: 'Yes. The free plan is for every student and needs no card. You can even ask your first questions without signing up. Amy+ is there if you use Amy every day and want more voice time and more courses.' },
  { q: 'How much is Amy+?', a: 'The first 100 students pay ₹1,999 a month plus GST, and keep that price every month it renews. After that it is ₹2,999. Amy+ renews monthly and you can cancel anytime.' },
  { q: 'Will Amy just do my homework for me?', a: 'No. She teaches one step at a time, asks a quick check after each idea, and marks your working honestly. She works the answer out herself before she says well done.' },
  { q: 'Which classes is Amy for?', a: 'Class 1 to Class 12, and students preparing for NEET. Amy teaches to your country’s board and your class, so a Class 4 answer and a Class 12 answer to the same question are not the same.' },
  { q: 'Which boards and countries?', a: 'CBSE, ICSE, ISC, state boards, NIOS, IB, IGCSE, Cambridge, AP and the national curricula of 16 countries. Not at school? Make your own course on anything.' },
  { q: 'Which languages does Amy speak?', a: 'English, Hindi, Hinglish and 17 more. She speaks ten Indian languages aloud.' },
  { q: 'Can my school use Amy?', a: 'Yes. A school gets one code. Teachers choose the courses for each class and see how each student is getting on. Write to us with your school’s name and a teacher’s email and we set it up.' }
];

/* ------------------------------------------------------------------ */
/* Nav                                                                 */
/* ------------------------------------------------------------------ */

const LINKS: [string, string][] = [
  ['#how', 'How Amy teaches'],
  ['#subjects', 'Subjects'],
  ['#curricula', 'Curricula'],
  ['#schools', 'For schools'],
  ['#pricing', 'Pricing']
];

function Nav() {
  const { scrollY } = useScroll();
  const border = useTransform(scrollY, [0, 60], ['rgba(0,0,0,0)', 'var(--line)']);
  const [open, setOpen] = useState(false);
  return (
    <motion.header style={{ borderColor: border }} className="fixed inset-x-0 top-0 z-50 border-b bg-[var(--bg)]/80 backdrop-blur-md pt-[env(safe-area-inset-top)]">
      <nav className={`${wrap} flex h-16 items-center gap-4`} aria-label="Main">
        <Logo />
        <div className="hidden lg:flex items-center gap-1 text-sm text-muted ml-4">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="rounded-lg px-3 py-2 hover:text-[var(--fg)] hover:bg-[var(--card-2)] transition-colors">
              {label}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <a href="#/app" className="hidden sm:inline-flex btn btn-ghost text-sm">
            Sign in
          </a>
          <a href="#/app" className="btn btn-primary text-sm">
            Start free
          </a>
          <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label="Menu" className="lg:hidden grid size-10 place-items-center rounded-lg border hairline">
            <Icon icon={open ? Cancel01Icon : Menu01Icon} size={18} />
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden overflow-hidden border-t hairline">
            <div className={`${wrap} py-3 flex flex-col`}>
              {LINKS.map(([href, label]) => (
                <a key={href} href={href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 text-[15px]">
                  {label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero: ask box first, then a scroll through everything you can learn  */
/* ------------------------------------------------------------------ */

const DOODLES: { t: string; x: string; y: string; r: number; s: number; d: number }[] = [
  { t: 'π', x: '7%', y: '24%', r: -12, s: 54, d: 0 },
  { t: 'a² + b² = c²', x: '70%', y: '17%', r: 6, s: 30, d: 1.2 },
  { t: 'H₂O', x: '86%', y: '56%', r: -8, s: 40, d: 2.1 },
  { t: '√x', x: '12%', y: '70%', r: 10, s: 44, d: 0.6 },
  { t: '3x + 7 = 22', x: '4%', y: '47%', r: -4, s: 26, d: 3 },
  { t: 'F = ma', x: '80%', y: '80%', r: 5, s: 32, d: 1.7 },
  { t: 'ABC', x: '24%', y: '14%', r: 8, s: 30, d: 2.6 }
];

function AskBox() {
  const [stage, setStage] = useState(1);
  const [q, setQ] = useState('');
  const [typing, setTyping] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(q.trim() || STAGES[stage].qs[0]);
  };
  return (
    <div className="mx-auto w-full max-w-2xl">
      <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: EASE }} className="flex justify-center">
        <Amy size={76} follow={!typing} lookAt={typing ? 'down' : undefined} interactive />
      </motion.div>
      <h1 className="mt-4 font-semibold tracking-[-0.045em] leading-[1.02] text-[clamp(38px,min(8.4vw,10.5vh),86px)]">
        <motion.span initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.8, ease: EASE }} className="block">
          Ask anything.
        </motion.span>
        <motion.span initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.18, duration: 0.8, ease: EASE }} className="block">
          Amy has <span className="serif amy-gradient-text pr-2">time.</span>
        </motion.span>
      </h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="mx-auto mt-4 max-w-xl text-[17px] sm:text-lg text-muted leading-relaxed">
        Your AI tutor from Class 1 to Class 12 and NEET. One step at a time, a quick check that it made sense, and your working marked honestly.
      </motion.p>

      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7, ease: EASE }} className="mt-6 rounded-2xl border border-[var(--line-2)] bg-[var(--card)] p-2 text-left shadow-[0_30px_70px_-34px_rgba(255,138,61,.55)]">
        <div className="flex items-center gap-2">
          <label htmlFor="ask" className="sr-only">
            What are you stuck on?
          </label>
          <input
            id="ask"
            value={q}
            onChange={e => setQ(e.target.value)}
            onFocus={() => setTyping(true)}
            onBlur={() => setTyping(false)}
            placeholder="What are you stuck on?"
            autoComplete="off"
            className="min-w-0 flex-1 bg-transparent px-3 h-12 text-base sm:text-[17px] outline-none placeholder:text-[var(--muted)]"
          />
          <button className="btn !min-h-12 !px-5 !rounded-xl font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 hover:brightness-105">
            Ask Amy <Icon icon={ArrowRight02Icon} size={18} stroke={2} />
          </button>
        </div>
        <div className="mt-2 flex gap-1 overflow-x-auto border-t hairline pt-2 [scrollbar-width:none]" role="tablist" aria-label="Your class">
          {STAGES.map((s, i) => (
            <button key={s.id} type="button" role="tab" aria-selected={i === stage} onClick={() => setStage(i)} className={`relative shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${i === stage ? 'text-[var(--on-invert)]' : 'text-muted hover:text-[var(--fg)]'}`}>
              {i === stage && <motion.span layoutId="stage" className="absolute inset-0 rounded-lg bg-[var(--invert)]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
              <span className="relative">{s.id}</span>
            </button>
          ))}
        </div>
      </motion.form>

      <div className="mt-3 flex min-h-[76px] flex-wrap justify-center gap-2 content-start">
        <AnimatePresence mode="popLayout" initial={false}>
          {STAGES[stage].qs.map((s, i) => (
            <motion.button
              key={s}
              type="button"
              onClick={() => setQ(s)}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              whileHover={{ y: -2 }}
              className="rounded-full border hairline bg-[var(--card)] px-3.5 py-1.5 text-sm text-fg2 hover:border-amy-400 transition-colors"
            >
              {s}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <p className="mt-1 text-sm text-muted">No sign-up for your first questions.</p>
    </div>
  );
}

const FLY: { img: string; x: number; y: number }[] = [
  { img: 'maths', x: -40, y: -30 },
  { img: 'biology', x: 40, y: -26 },
  { img: 'space', x: -44, y: 26 },
  { img: 'physics', x: 42, y: 28 },
  { img: 'world', x: -16, y: -42 },
  { img: 'coding', x: 18, y: 42 },
  { img: 'music', x: -50, y: -2 },
  { img: 'reading', x: 50, y: 2 },
  { img: 'science', x: 12, y: -44 },
  { img: 'nature', x: -14, y: 44 }
];

function FlyCard({ p, i, img, x, y }: { p: MotionValue<number>; i: number; img: string; x: number; y: number }) {
  const from = 0.2 + i * 0.058;
  const to = from + 0.27;
  const tx = useTransform(p, [from, to], ['0vw', `${x}vw`]);
  const ty = useTransform(p, [from, to], ['0vh', `${y}vh`]);
  const scale = useTransform(p, [from, to], [0.25, 1.7]);
  const opacity = useTransform(p, [from, from + 0.05, to - 0.06, to], [0, 1, 1, 0]);
  const rotate = useTransform(p, [from, to], [0, x > 0 ? 8 : -8]);
  return (
    <div className="absolute inset-0 grid place-items-center pointer-events-none">
      <motion.img src={art(img)} alt="" loading="eager" decoding="async" style={{ x: tx, y: ty, scale, opacity, rotate }} className="w-[clamp(120px,17vw,230px)] aspect-[3/4] rounded-3xl object-cover shadow-[0_30px_60px_-20px_rgba(0,0,0,.5)] will-change-transform" />
    </div>
  );
}

function Word({ p, i, n, children }: { p: MotionValue<number>; i: number; n: number; children: string }) {
  const a = 0.16 + (i / n) * 0.16;
  const opacity = useTransform(p, [a, a + 0.05], [0.12, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  // A plain copy of the progress: values derived straight from a scroll value get handed to a
  // native scroll timeline, which tracks the whole page instead of this section.
  const p = useMotionValue(0);
  const [live, setLive] = useState(true);
  useMotionValueEvent(scrollYProgress, 'change', v => {
    p.set(v);
    setLive(v < 0.1);
  });

  const heroOpacity = useTransform(p, [0, 0.14], [1, 0]);
  const heroScale = useTransform(p, [0, 0.14], [1, 0.9]);
  const heroBlur = useTransform(p, [0, 0.14], ['blur(0px)', 'blur(14px)']);
  const heroY = useTransform(p, [0, 0.14], [0, -50]);
  const lineOpacity = useTransform(p, [0.1, 0.16], [0, 1]);
  const lineScale = useTransform(p, [0.1, 1], [0.94, 1.08]);
  const hint = useTransform(p, [0, 0.04], [1, 0]);

  const line = 'If you can wonder it, Amy can teach it.'.split(' ');

  const backdrop = (
    <>
      <div aria-hidden className="absolute inset-0 grid-bg" />
      <div aria-hidden className="absolute left-1/2 top-[-340px] h-[640px] w-[1000px] -translate-x-1/2 rounded-full glow-amy blur-3xl opacity-50" />
    </>
  );

  if (reduce)
    return (
      <section className="relative overflow-hidden text-center">
        {backdrop}
        <div className={`${wrap} relative pt-28 pb-20`}>
          <AskBox />
        </div>
      </section>
    );

  return (
    <section ref={ref} className="relative h-[380vh]">
      <div className="sticky top-0 h-dvh overflow-hidden text-center">
        {backdrop}
        <motion.div aria-hidden style={{ opacity: heroOpacity }} className="absolute inset-0 hidden md:block">
          {DOODLES.map(d => (
            <span key={d.t} className="hand drift absolute select-none text-[var(--fg)] opacity-[.16]" style={{ left: d.x, top: d.y, fontSize: d.s, ['--r' as string]: `${d.r}deg`, animationDelay: `${-d.d}s` }}>
              {d.t}
            </span>
          ))}
        </motion.div>

        {/* 2. The line, with everything you can learn flying past */}
        <motion.div style={{ opacity: lineOpacity }} className="absolute inset-0">
          {FLY.map((f, i) => (
            <FlyCard key={f.img} p={p} i={i} {...f} />
          ))}
          <div className="absolute inset-0 grid place-items-center px-6">
            <motion.p style={{ scale: lineScale }} className="max-w-4xl font-semibold tracking-[-0.04em] leading-[1.05] text-[clamp(34px,7vw,84px)] [text-shadow:0_2px_30px_var(--bg)]">
              {line.map((w, i) => (
                <Word key={i} p={p} i={i} n={line.length}>
                  {w}
                </Word>
              ))}
            </motion.p>
          </div>
        </motion.div>

        {/* 1. The ask box */}
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, filter: heroBlur, y: heroY, pointerEvents: live ? 'auto' : 'none' }} className={`${wrap} relative flex h-full flex-col justify-center pt-16`}>
          <AskBox />
        </motion.div>

        <motion.div style={{ opacity: hint }} className="absolute inset-x-0 bottom-4 hidden [@media(min-height:760px)]:flex justify-center">
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.8, repeat: Infinity }} className="inline-flex items-center gap-1.5 text-sm text-muted">
            Scroll <Icon icon={ArrowDown01Icon} size={16} />
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Boards() {
  return (
    <section aria-label="Boards" className="py-10 border-y hairline">
      <p className="text-center text-sm text-muted mb-6">Taught to your board and your class</p>
      <LogoLoop logos={BOARDS.map(b => ({ node: <span className="text-xl font-medium tracking-tight text-[var(--muted)]">{b}</span>, title: b }))} speed={36} gap={64} logoHeight={28} fadeOut fadeOutColor="var(--bg)" pauseOnHover ariaLabel="Boards" />
    </section>
  );
}

function Head({ eyebrow, title, children, center = false }: { eyebrow: string; title: ReactNode; children?: ReactNode; center?: boolean }) {
  return (
    <motion.div {...reveal()} className={`max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
      <div className="hand text-2xl text-amy-500 -rotate-1 inline-block">{eyebrow}</div>
      <h2 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-[-0.035em] leading-[1.06]">{title}</h2>
      {children && <p className="mt-5 text-lg text-muted leading-relaxed">{children}</p>}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The chalkboard: four steps on sticky notes you can drag             */
/* ------------------------------------------------------------------ */

const NOTES: { n: number; title: string; text: string; bg: string; r: number }[] = [
  { n: 1, title: 'Your question', text: 'Type it, snap a photo of the page, upload a PDF or just say it.', bg: '#ffe27a', r: -3 },
  { n: 2, title: 'One step, then the next', text: 'Amy explains a single idea, draws it on the board, then stops.', bg: '#ffb7a1', r: 2 },
  { n: 3, title: 'A quick check', text: 'A short question after each idea, so you know it made sense.', bg: '#a9dcff', r: -1.5 },
  { n: 4, title: 'Marked working', text: 'She works it out herself before she says well done.', bg: '#b9ecc4', r: 3 }
];

function Marked() {
  return (
    <div className="mt-3 rounded-md bg-white/60 p-2.5 text-[13px] leading-snug font-sans">
      <div className="font-medium">Solve 3x + 7 = 22</div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <span>3x = 22 − 7 = 15</span>
        <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[11px] font-medium text-white">Correct</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span>x = 6</span>
        <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[11px] font-medium text-white">Not yet</span>
      </div>
      <div className="mt-1.5 border-t border-black/10 pt-1.5 text-black/70">Amy checked: 3(6) + 7 = 25, not 22.</div>
    </div>
  );
}

function Chalkboard() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);
  const [top, setTop] = useState(0);
  useEffect(() => setFine(window.matchMedia('(pointer: fine)').matches), []);
  return (
    <section id="how" className={`${wrap} py-24 sm:py-32 scroll-mt-16`}>
      <Head eyebrow="How Amy teaches" title={<>From stuck to sure, <span className="serif">in four steps.</span></>} center>
        Most apps hand you the last line. Amy walks you to it, and makes sure you could do the next one alone.
      </Head>

      <motion.div {...reveal(0.1)} ref={boardRef} className="board mt-14 px-5 py-8 sm:px-10 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="hand text-3xl sm:text-4xl">Today: how a doubt becomes understanding</div>
          {fine && (
            <span className="hand inline-flex items-center gap-1.5 rounded-full border chalk-line px-3 py-1 text-lg opacity-80">
              <Icon icon={Drag01Icon} size={16} /> drag the notes
            </span>
          )}
        </div>
        <svg aria-hidden viewBox="0 0 600 12" className="mt-2 w-full max-w-md opacity-60" preserveAspectRatio="none">
          <motion.path d="M2 8 C 120 2, 240 11, 360 5 S 560 9, 598 4" fill="none" stroke="#f4f1e6" strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.3 }} />
        </svg>

        <div className="mt-9 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {NOTES.map((n, i) => (
            <motion.div
              key={n.n}
              drag={fine}
              dragConstraints={boardRef}
              dragElastic={0.15}
              dragMomentum={false}
              onDragStart={() => setTop(n.n)}
              whileDrag={{ scale: 1.06, rotate: 0, cursor: 'grabbing' }}
              whileHover={fine ? { y: -6, rotate: 0 } : undefined}
              initial={{ opacity: 0, y: 40, rotate: n.r * 3 }}
              whileInView={{ opacity: 1, y: 0, rotate: n.r }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: 'spring', stiffness: 160, damping: 16, delay: i * 0.12 }}
              style={{ background: n.bg, zIndex: top === n.n ? 5 : 1 }}
              className={`sticky-note relative p-5 pt-7 ${fine ? 'cursor-grab' : ''}`}
            >
              <span aria-hidden className="absolute left-1/2 top-[-9px] h-5 w-16 -translate-x-1/2 rotate-[-2deg] bg-white/55 shadow-sm" />
              <div className="hand text-5xl leading-none opacity-40">{n.n}</div>
              <h3 className="hand mt-1 text-[28px] leading-tight">{n.title}</h3>
              <p className="mt-1.5 text-[15px] leading-relaxed text-black/70">{n.text}</p>
              {n.n === 4 && <Marked />}
            </motion.div>
          ))}
        </div>

        <div aria-hidden className="mt-10 flex items-center gap-2">
          <span className="h-2.5 w-14 rounded-full bg-white/85" />
          <span className="h-2.5 w-9 rounded-full bg-[#ffd06a]" />
          <span className="h-2.5 w-11 rounded-full bg-[#a9dcff]" />
          <span className="ml-auto h-6 w-16 rounded-md bg-[#d9c7a3] shadow-inner" />
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Lesson() {
  return (
    <section className="border-y hairline bg-[var(--bg-2)]">
      <div className={`${wrap} py-24 sm:py-32 grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20 items-center`}>
        <div>
          <Head eyebrow="Watch a lesson" title={<>Not the answer. <span className="serif">The understanding.</span></>}>
            Wrong is just “Not yet”: a hint, then another go. This lesson plays by itself, exactly the way Amy teaches.
          </Head>
          <ul className="mt-8 grid gap-3 text-[15px]">
            {[
              ['Checks you understood', 'A quick question after each idea.'],
              ['Marks your working', 'She works it out before she says well done.'],
              ['Draws while she explains', 'Diagrams and equations on a board beside the chat.'],
              ['Revisits your mistakes', 'Wrong answers come back until they stick.']
            ].map(([t, d], i) => (
              <motion.li key={t} {...reveal(i * 0.07)} className="flex items-start gap-3">
                <Icon icon={CheckmarkCircle02Icon} size={20} className="mt-0.5 shrink-0 text-amy-500" />
                <span>
                  <span className="font-medium">{t}.</span> <span className="text-muted">{d}</span>
                </span>
              </motion.li>
            ))}
          </ul>
          <a href="#/app" className="btn btn-ghost mt-9">
            Try all of it without signing up <Icon icon={ArrowRight02Icon} size={18} />
          </a>
        </div>
        <motion.div {...reveal(0.1)}>
          <ChatDemo />
        </motion.div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className={`${wrap} py-24 sm:py-32 scroll-mt-16`}>
      <Head eyebrow="What Amy does" title={<>Everything a good tutor does, <span className="serif">at 10 pm.</span></>} center />
      <div className="mt-14 grid gap-4 md:grid-cols-6">
        <Tile className="md:col-span-3" title="Ask it your way" text="Type it, snap a photo or upload a PDF. English, Hindi, Hinglish and 17 more languages.">
          <TypedAsk />
        </Tile>
        <Tile className="md:col-span-3" title="She draws while she explains" text="Diagrams, equations and mind maps appear as the answer unfolds, not a wall of text.">
          <MiniGraph />
        </Tile>
        <Tile className="md:col-span-2" title="Talk it through" text="A live voice call with Amy. She speaks ten Indian languages aloud.">
          <Wave />
        </Tile>
        <Tile className="md:col-span-2" title="A check after every idea" text="A quick question, with your working marked honestly.">
          <CheckDemo />
        </Tile>
        <Tile className="md:col-span-2" title="Mistakes come back" text="A mastery map shows what to revisit before the exam.">
          <Spaced />
        </Tile>
        <Tile className="md:col-span-6" wide title="Your notes become a course" text="Upload chapter notes, a PDF or slides. Amy turns them into short lessons, each with its own checks. Mock papers are marked the way an examiner would.">
          <NotesToCourse />
        </Tile>
      </div>
    </section>
  );
}

function Film() {
  return (
    <section className={`${wrap} pb-24 sm:pb-32`}>
      <motion.div {...reveal()} className="relative mx-auto max-w-4xl">
        <div aria-hidden className="absolute -inset-x-8 -top-8 h-40 glow-amy blur-3xl opacity-50" />
        <div className="relative overflow-hidden rounded-2xl border border-[var(--line-2)] bg-black shadow-[0_40px_100px_-40px_rgba(0,0,0,.6)]">
          <video controls preload="none" playsInline poster="https://amy-tutor.com/film/amy-launch-film.jpg" className="block aspect-video w-full">
            <source src="https://amy-tutor.com/film/amy-launch-film.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <div className="hand text-2xl">See Amy teach · 56 seconds</div>
          <p className="text-sm text-muted">Real screens from amy-tutor.com: Amy’s replies, drawings, quiz and voice call are what the app produced.</p>
        </div>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Subjects() {
  const row = [...SUBJECTS, ...SUBJECTS];
  return (
    <section id="subjects" className="border-y hairline bg-[var(--bg-2)] py-24 sm:py-32 scroll-mt-16 overflow-hidden">
      <div className={wrap}>
        <Head eyebrow="Pick a subject" title={<>From first sums <span className="serif">to NEET.</span></>}>
          Amy teaches every school subject to your class. Not at school? Make your own course on anything, from coding to reading music.
        </Head>
      </div>
      <div className="mt-12 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="marquee gap-5 pr-5">
          {row.map((s, i) => (
            <button key={i} onClick={() => ask(s.q)} aria-hidden={i >= SUBJECTS.length} tabIndex={i >= SUBJECTS.length ? -1 : 0} className="group relative w-[220px] sm:w-[250px] shrink-0 overflow-hidden rounded-3xl text-left shadow-[0_24px_50px_-28px_rgba(0,0,0,.5)] transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-2 hover:rotate-[-1.5deg]">
              <img src={art(s.img)} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-110" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4 pt-12 text-white">
                <span className="block text-xl font-semibold tracking-tight">{s.title}</span>
                <span className="block text-sm opacity-80">{s.who}</span>
                <span className="mt-2 grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 group-hover:grid-rows-[1fr]">
                  <span className="overflow-hidden text-sm">
                    “{s.q}” <Icon icon={ArrowRight02Icon} size={14} className="inline" />
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Curricula() {
  const [c, setC] = useState(0);
  const [, boards] = COUNTRIES[c];
  return (
    <section id="curricula" className={`${wrap} py-24 sm:py-32 scroll-mt-16`}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] items-start">
        <div>
          <Head eyebrow="Wherever you study" title={<>Your country. Your board. <span className="serif">Your class.</span></>}>
            Amy teaches to your country’s board and your class. Pick where you study.
          </Head>
          <div className="mt-8 flex flex-wrap gap-2">
            {COUNTRIES.map(([name], i) => (
              <button key={name} onClick={() => setC(i)} aria-pressed={i === c} className={`relative rounded-full px-3.5 py-2 text-sm transition-colors ${i === c ? 'text-[var(--on-invert)]' : 'border hairline text-fg2 hover:border-amy-400'}`}>
                {i === c && <motion.span layoutId="country" className="absolute inset-0 rounded-full bg-[var(--invert)]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
                <span className="relative">{name}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div {...reveal(0.1)} className="card ruled relative overflow-hidden !rounded-2xl p-6 sm:p-8 lg:mt-10">
          <span aria-hidden className="absolute inset-y-0 left-12 w-px bg-rose-400/40" />
          <div className="relative pl-10 sm:pl-12">
            <div className="flex items-center gap-3">
              <Amy size={44} glow={false} float={false} mood="happy" key={c} />
              <div className="hand text-3xl leading-none">{COUNTRIES[c][0]}</div>
            </div>
            <div className="mt-5 flex min-h-[128px] flex-wrap content-start gap-2.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {boards.map((b, i) => (
                  <motion.span key={`${c}-${b}`} initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 22 }} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line-2)] bg-[var(--card)] px-3.5 py-2 text-[15px] font-medium">
                    <Icon icon={Tick02Icon} size={15} stroke={2.4} className="text-amy-500" /> {b}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-6 grid gap-4 border-t hairline pt-5 sm:grid-cols-2 text-[15px]">
              <div>
                <div className="font-medium">In your language</div>
                <p className="mt-1 text-muted leading-relaxed">English, Hindi, Hinglish and 17 more. She speaks ten Indian languages aloud.</p>
              </div>
              <div>
                <div className="font-medium">Not at school?</div>
                <p className="mt-1 text-muted leading-relaxed">Make your own course on anything, from coding to reading music.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Schools() {
  const gets: [typeof School01Icon, string, string][] = [
    [School01Icon, 'Courses for each class', 'Set courses for each class group. Students in that class see those courses.'],
    [UserGroupIcon, 'See how each student is learning', 'Progress through lessons, quiz results, and their conversations with Amy, so teachers know who needs help.'],
    [Key01Icon, 'You decide who joins', 'Students join with your school code, and you approve each one into their class.']
  ];
  const join = [
    ['Sign up or sign in', 'Use your own account; it is free.'],
    ['Open “Join school”', 'It is at the top of the page. Type the school code your teacher gave you.'],
    ['Wait for your school to approve you', 'Your school’s courses then appear in Courses. Free chat with Amy works the whole time.']
  ];
  return (
    <section id="schools" className="border-y hairline bg-[var(--bg-2)] scroll-mt-16">
      <div className={`${wrap} py-24 sm:py-32`}>
        <Head eyebrow="For schools" title={<>Bring Amy to <span className="serif">your classroom.</span></>}>
          One school code. Teachers choose the courses and see how each student is getting on.
        </Head>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {gets.map(([icon, t, d], i) => (
            <motion.div key={t} {...reveal(i * 0.08)} whileHover={{ y: -6 }} className="card !rounded-2xl p-6">
              <span className="grid size-11 place-items-center rounded-xl bg-amy-400/15 text-amy-500">
                <Icon icon={icon} size={22} />
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight">{t}</h3>
              <p className="mt-1.5 text-muted leading-relaxed text-[15px]">{d}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <motion.div {...reveal()} className="card !rounded-2xl p-6 sm:p-8">
            <div className="hand text-2xl text-amy-500">Your school asked you to join?</div>
            <ol className="mt-5 grid gap-5 sm:grid-cols-3">
              {join.map(([t, d], i) => (
                <li key={t}>
                  <span className="hand grid size-10 place-items-center rounded-full border-2 border-amy-400 text-2xl">{i + 1}</span>
                  <div className="mt-3 font-medium">{t}</div>
                  <p className="mt-1 text-sm text-muted leading-relaxed">{d}</p>
                </li>
              ))}
            </ol>
            <a href="#/app" className="btn btn-ghost mt-7">
              Create your account <Icon icon={ArrowRight02Icon} size={18} />
            </a>
          </motion.div>
          <motion.div {...reveal(0.1)} className="board !border-[10px] p-6 sm:p-8 flex flex-col">
            <div className="hand text-3xl">Want Amy for your school?</div>
            <p className="mt-3 leading-relaxed opacity-85">Write to us with your school’s name and the teacher’s email. We set it up and send the school code.</p>
            <a href="mailto:aryamgoyal18@gmail.com?subject=Amy%20for%20our%20school" className="mt-6 inline-flex items-center gap-2 self-start rounded-xl bg-[#f4f1e6] px-4 py-2.5 font-medium text-[#163a2d] hover:bg-white transition-colors break-all">
              <Icon icon={Mail01Icon} size={18} className="shrink-0" /> aryamgoyal18@gmail.com
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const BARS: [typeof Mic01Icon, string, string, number, string][] = [
  [Mic01Icon, 'Voice call minutes, every 2 days', '15', 100 / 15, '225'],
  [Clock01Icon, 'Replies read aloud', '1×', 100 / 3, '3×'],
  [Brain02Icon, 'Thinking time on hard questions', '1×', 50, '2×']
];

function Bars() {
  return (
    <motion.div {...reveal()} className="mt-4 card !rounded-2xl p-6 sm:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xl font-semibold tracking-tight">What Amy+ adds</h3>
        <span className="text-sm text-muted">Amy · Amy+</span>
      </div>
      <div className="mt-6 grid gap-8 md:grid-cols-3">
        {BARS.map(([icon, label, free, pct, plus], i) => (
          <div key={label}>
            <div className="flex items-center gap-2 text-[15px] font-medium">
              <Icon icon={icon} size={18} className="text-amy-500" /> {label}
            </div>
            {[
              ['Amy', free, pct, false],
              ['Amy+', plus, 100, true]
            ].map(([name, val, w, hot]) => (
              <div key={name as string} className="mt-3 flex items-center gap-3 text-sm">
                <span className={`w-11 shrink-0 ${hot ? 'font-medium' : 'text-muted'}`}>{name}</span>
                <div className="h-7 flex-1 overflow-hidden rounded-lg bg-[var(--card-2)]">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${w}%` }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 1.2, ease: EASE, delay: i * 0.15 + (hot ? 0.25 : 0) }} className={`h-full rounded-lg ${hot ? 'bg-gradient-to-r from-amy-200 via-amy-400 to-amy-600' : 'bg-[var(--line-2)]'}`} />
                </div>
                <span className={`w-9 text-right tabular-nums ${hot ? 'font-semibold' : 'text-muted'}`}>{val}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function Pricing() {
  return (
    <section id="pricing" className={`${wrap} py-24 sm:py-32 scroll-mt-16`}>
      <Head eyebrow="Pricing" title={<>Free to learn with. <span className="serif">Amy+ when you want more of her.</span></>} center>
        Prices in rupees, before GST. Amy+ renews every month. Cancel anytime.
      </Head>

      <div className="mt-14 grid gap-4 lg:grid-cols-2">
        <motion.div {...reveal()} className="card !rounded-2xl p-6 sm:p-8 flex flex-col">
          <div className="flex items-center gap-3">
            <Amy size={40} glow={false} float={false} />
            <div className="text-xl font-semibold tracking-tight">Amy</div>
          </div>
          <div className="mt-5 text-5xl font-semibold tracking-[-0.04em]">Free</div>
          <p className="mt-2 text-muted">For every student. No card needed.</p>
          <ol className="mt-6 grid gap-2.5 text-[15px]">
            {FREE.map((f, i) => (
              <motion.li key={f} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }} className="flex gap-3">
                <span className="hand w-6 shrink-0 text-xl leading-6 text-amy-500 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <span className="leading-6">{f}</span>
              </motion.li>
            ))}
          </ol>
          <a href="#/app" className="btn btn-ghost mt-8 !min-h-12 text-base lg:mt-auto">
            Start learning free <Icon icon={ArrowRight02Icon} size={18} />
          </a>
        </motion.div>

        <motion.div {...reveal(0.1)} id="amy-plus" className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-amy-200 via-amy-500 to-amy-600 shadow-[0_40px_90px_-40px_rgba(255,138,61,.7)]">
          <div className="relative h-full overflow-hidden rounded-[15px] bg-[var(--card)] p-6 sm:p-8 flex flex-col">
            <div aria-hidden className="absolute right-[-120px] top-[-160px] size-[380px] rounded-full glow-amy blur-2xl opacity-70" />
            <div className="relative flex items-center gap-3">
              <Amy size={40} glow={false} float={false} mood="happy" />
              <div className="text-xl font-semibold tracking-tight">Amy+</div>
              <span className="ml-auto rounded-full bg-amy-400/20 px-3 py-1 text-sm font-medium text-amy-600 dark:text-amy-200">First 100 students</span>
            </div>
            <div className="relative mt-5 flex flex-wrap items-baseline gap-x-3">
              <span className="text-5xl font-semibold tracking-[-0.04em]">₹1,999</span>
              <span className="text-muted">a month + GST</span>
              <span className="relative text-xl text-muted">
                Was ₹4,999
                <motion.span aria-hidden className="absolute left-[-2px] right-[-2px] top-1/2 h-[2px] origin-left rounded bg-[var(--notyet)]" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.5 }} />
              </span>
            </div>
            <p className="relative mt-2 text-muted">For students who use Amy every day. The first 100 students pay ₹1,999, and keep it every month it renews. After that, ₹2,999.</p>
            <ul className="relative mt-6 grid gap-4 text-[15px]">
              {PLUS.map(([t, d], i) => (
                <motion.li key={t} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 + i * 0.07 }} className="flex gap-3">
                  <Icon icon={i === 3 ? Rocket01Icon : CheckmarkCircle02Icon} size={20} className="mt-0.5 shrink-0 text-amy-500" />
                  <span>
                    <span className="font-medium">{t}</span>
                    <span className="block text-muted leading-relaxed">{d}</span>
                  </span>
                </motion.li>
              ))}
            </ul>
            <a href="#/app" className="relative btn mt-8 !min-h-12 text-base font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 hover:brightness-105 lg:mt-auto">
              Get Amy+ <Icon icon={ArrowRight02Icon} size={18} stroke={2} />
            </a>
            <p className="relative mt-3 text-center text-sm text-muted">You’ll make a free account first, then checkout opens.</p>
          </div>
        </motion.div>
      </div>
      <Bars />
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Questions() {
  return (
    <section id="faq" className="border-t hairline bg-[var(--bg-2)] scroll-mt-16">
      <div className={`${wrap} py-24 sm:py-32 grid gap-12 lg:grid-cols-[1fr_1.4fr]`}>
        <Head eyebrow="Hands up" title={<>Before you <span className="serif">start.</span></>} />
        <motion.div {...reveal(0.1)}>
          <Faq items={FAQ} />
        </motion.div>
      </div>
    </section>
  );
}

/** The classroom, with the last question written on its board. */
function FinalCta() {
  const words = 'What do you want to learn today?'.split(' ');
  return (
    <section className={`${wrap} py-24 sm:py-32`}>
      <motion.div {...reveal()} className="relative overflow-hidden rounded-3xl border border-[var(--line-2)] shadow-[0_50px_120px_-50px_rgba(0,0,0,.6)]">
        <div className="relative left-1/2 w-[max(100%,760px)] -translate-x-1/2 [container-type:inline-size]">
          <img src={art('classroom')} alt="A sunny classroom with a chalkboard" loading="lazy" className="block aspect-[16/9] w-full object-cover" />
          <div className="absolute left-[35.5%] top-[24%] grid h-[30%] w-[34%] place-items-center text-center">
            <p className="hand text-[4.6cqw] leading-[1.05] text-[#f4f1e6]">
              {words.map((w, i) => (
                <motion.span key={i} className="inline-block" initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }} viewport={{ once: true, amount: 0.8 }} transition={{ delay: 0.3 + i * 0.16, duration: 0.4 }}>
                  {w}&nbsp;
                </motion.span>
              ))}
            </p>
          </div>
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-4 bg-[var(--card)] p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <Amy size={48} glow={false} follow />
            <div>
              <div className="text-lg font-semibold tracking-tight">Free to start. No card needed.</div>
              <div className="text-sm text-muted">Your first question takes ten seconds.</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#/app" className="btn !min-h-12 !px-6 text-base font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 hover:brightness-105">
              Start learning free <Icon icon={ArrowRight02Icon} size={18} stroke={2} />
            </a>
            <a href="#/app" className="btn btn-ghost !min-h-12 !px-6 text-base">
              Try Amy now
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  const cols: [string, [string, string][]][] = [
    ['Learn', [['How Amy teaches', '#how'], ['Subjects', '#subjects'], ['Curricula', '#curricula']]],
    ['Plans', [['Pricing', '#pricing'], ['Amy+', '#amy-plus'], ['For schools', '#schools']]],
    ['Amy', [['Meet Amy', '#/amy'], ['Questions', '#faq'], ['Sign in', '#/app']]]
  ];
  return (
    <footer className="border-t hairline">
      <div className={`${wrap} py-14 grid gap-10 sm:grid-cols-[1.4fr_1fr_1fr_1fr]`}>
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted leading-relaxed">Learning through conversation, from Class 1 to Class 12 and NEET.</p>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <div className="text-sm font-medium">{title}</div>
            <ul className="mt-3 flex flex-col gap-2.5 text-sm text-muted">
              {links.map(([l, href]) => (
                <li key={l}>
                  <a href={href} className="hover:text-[var(--fg)] transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t hairline">
        <div className={`${wrap} py-5 flex flex-wrap justify-between gap-2 text-xs text-muted pb-[max(20px,env(safe-area-inset-bottom))]`}>
          <span>© 2026 Amy. Learning through conversation.</span>
          <span>Made for students who ask questions.</span>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="site min-h-dvh overflow-x-clip">
      <Nav />
      <main>
        <Hero />
        <Boards />
        <Chalkboard />
        <Lesson />
        <Features />
        <Film />
        <Subjects />
        <Curricula />
        <Schools />
        <Pricing />
        <Questions />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
