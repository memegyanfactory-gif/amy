import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react';
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
import { art, Icon, Logo, ThemeToggle } from '../components/ui';
import { useTheme } from '../theme';
import SoftAurora from '../bits/SoftAurora';
import { Memory, People } from '../components/LandingMore';
import { CheckDemo, Faq, MiniGraph, NotesToCourse, Spaced, Tile, TypedAsk, Wave } from '../components/LandingBits';
import { go } from '../router';
import { REGIONS, stagePhoto, stageQuestions, useRegion, type Region } from '../region';
import LogoLoop from '../bits/LogoLoop';

const EASE = [0.23, 1, 0.32, 1] as const;
const wrap = 'mx-auto w-full max-w-6xl px-5 sm:px-8';
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

const SUBJECTS: { img: string; title: string; who: string; q: string }[] = [
  { img: 'maths', title: 'Maths', who: '@all', q: 'Solve 3x + 7 = 22 step by step' },
  { img: 'physics', title: 'Physics', who: '@senior', q: 'Explain Newton’s third law with an example' },
  { img: 'science', title: 'Chemistry', who: '@senior', q: 'Quiz me on the mole concept' },
  { img: 'biology', title: 'Biology', who: '@senior', q: 'Quiz me on human physiology' },
  { img: 'nature', title: 'Science', who: '@junior', q: 'How do plants drink water?' },
  { img: 'space', title: 'Space', who: 'Any age', q: 'Why does the moon change shape?' },
  { img: 'world', title: 'Geography', who: '@all', q: 'Why do we have seasons?' },
  { img: 'reading', title: 'English', who: '@all', q: 'Help me write a story opening' },
  { img: 'coding', title: 'Coding', who: 'Your own course', q: 'Teach me to code, starting from zero' },
  { img: 'music', title: 'Reading music', who: 'Your own course', q: 'Teach me to read music' }
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

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

const faq = (r: Region) => [
  { q: 'Is Amy free?', a: 'Yes. The free plan is for every student and needs no card. You can even ask your first questions without signing up. Amy+ is there if you use Amy every day and want more voice time and more courses.' },
  { q: 'How much is Amy+?', a: 'The first 100 students pay ₹1,999 a month plus GST, and keep that price every month it renews. After that it is ₹2,999. Amy+ renews monthly and you can cancel anytime.' },
  { q: 'Will Amy just do my homework for me?', a: 'No. She teaches one step at a time, asks a quick check after each idea, and marks your working honestly. She works the answer out herself before she says well done.' },
  { q: 'Which classes is Amy for?', a: `${cap(r.span)}. Amy teaches to your country’s curriculum and your class, so a younger student and an older one get different answers to the same question.` },
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

/**
 * The top bar. Clear over the hero, then it gathers into a floating glass pill.
 * It tucks away while you scroll down to read and comes back as soon as you scroll up.
 */
function Nav() {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const last = useRef(0);

  useMotionValueEvent(scrollY, 'change', y => {
    setSolid(y > 24);
    const down = y > last.current;
    if (Math.abs(y - last.current) > 6) setHidden(down && y > 520 && !open);
    last.current = y;
  });

  // Which section is on screen, for the active link.
  useEffect(() => {
    const els = LINKS.map(([h]) => document.querySelector(h)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(entries => entries.forEach(e => { const id = `#${e.target.id}`; if (e.isIntersecting) setActive(id); else setActive(a => (a === id ? null : a)); }), { rootMargin: '-45% 0px -50% 0px' });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <motion.header animate={{ y: hidden ? -110 : 0 }} transition={{ duration: 0.35, ease: EASE }} className="fixed inset-x-0 top-0 z-50 px-3 pt-[max(12px,env(safe-area-inset-top))] sm:px-5">
        <motion.nav
          aria-label="Main"
          layout
          transition={{ duration: 0.45, ease: EASE }}
          className={`mx-auto flex h-14 items-center gap-3 rounded-full pl-4 pr-2 transition-[background-color,border-color,box-shadow,max-width] duration-500 ${solid ? 'max-w-5xl border border-[var(--line-2)] bg-[var(--bg)]/70 shadow-[0_18px_50px_-24px_rgba(0,0,0,.45)] backdrop-blur-xl' : 'max-w-6xl border border-[var(--line)] bg-[var(--bg)]/45 backdrop-blur-md'}`}
        >
          <a href="#/" aria-label="Amy home" className="flex shrink-0 items-center gap-2 rounded-full bg-[#fffaf0] py-1 pl-1 pr-3.5 shadow-[0_6px_20px_-10px_rgba(0,0,0,.45)] ring-1 ring-black/5 transition-transform hover:scale-[1.03]">
            <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-[#fff1dc]">
              <Amy size={32} glow={false} float={false} />
            </span>
            <span className="text-[17px] font-semibold tracking-tight text-[#0a0a0b]">Amy</span>
          </a>
          <div className="mx-auto hidden items-center lg:flex" onMouseLeave={() => setHover(null)}>
            {LINKS.map(([href, label]) => {
              const on = active === href;
              return (
                <a key={href} href={href} onMouseEnter={() => setHover(href)} className={`relative rounded-full px-3.5 py-2 text-sm transition-colors ${on ? 'text-[var(--fg)]' : 'text-fg2 hover:text-[var(--fg)]'}`}>
                  {hover === href && <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-[var(--card-2)]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span className="relative">{label}</span>
                  {on && <motion.span layoutId="nav-active" className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-amy-500" />}
                </a>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-1.5 lg:ml-0">
            <ThemeToggle className="!rounded-full !border-transparent" />
            <a href="#/app" className="hidden rounded-full px-3.5 py-2 text-sm text-fg2 transition-colors hover:text-[var(--fg)] sm:inline-flex">
              Sign in
            </a>
            <a href="#/app" className="group inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--invert)] pl-4 pr-3 text-sm font-medium text-[var(--on-invert)] transition-transform active:scale-95">
              Start free
              <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-amy-200 to-amy-500 text-[#2a1406] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:rotate-[-45deg]">
                <Icon icon={ArrowRight02Icon} size={14} stroke={2.2} />
              </span>
            </a>
            <button onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={open ? 'Close menu' : 'Open menu'} className="grid size-10 place-items-center rounded-full lg:hidden">
              <Icon icon={open ? Cancel01Icon : Menu01Icon} size={19} />
            </button>
          </div>
        </motion.nav>
      </motion.header>

      {/* phone menu: the whole screen, big links */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 flex flex-col bg-[var(--bg)]/95 px-6 pb-8 pt-24 backdrop-blur-xl lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div aria-hidden className="absolute left-1/2 top-0 h-80 w-[600px] -translate-x-1/2 rounded-full glow-amy opacity-50 blur-3xl" />
            <nav className="relative flex flex-col" aria-label="Menu">
              {LINKS.map(([href, label], i) => (
                <motion.a key={href} href={href} onClick={() => setOpen(false)} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 + i * 0.05, duration: 0.4, ease: EASE }} className="flex items-center justify-between border-b hairline py-4 text-3xl font-semibold tracking-tight">
                  {label}
                  <Icon icon={ArrowRight02Icon} size={22} className="text-muted" />
                </motion.a>
              ))}
            </nav>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="relative mt-auto flex flex-col gap-3">
              <a href="#/app" onClick={() => setOpen(false)} className="btn !min-h-12 !rounded-full font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500">Start learning free</a>
              <a href="#/app" onClick={() => setOpen(false)} className="btn btn-ghost !min-h-12 !rounded-full">Sign in</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
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
  const { region: r, source } = useRegion();
  const stages = useMemo(() => r.tags.map((id, i) => ({ id, qs: stageQuestions(r)[i] })), [r]);
  const [stage, setStage] = useState(1);
  const [q, setQ] = useState('');
  const [typing, setTyping] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(q.trim() || stages[stage].qs[0]);
  };
  return (
    <div className="mx-auto w-full max-w-4xl">
      <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, ease: EASE }} className="flex justify-center">
        <Amy size={64} follow={!typing} lookAt={typing ? 'down' : undefined} interactive />
      </motion.div>
      <motion.a href="#schools" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-4 inline-flex items-center gap-2 rounded-full border hairline bg-[var(--card)]/70 px-3.5 py-1.5 text-sm text-muted backdrop-blur hover:text-[var(--fg)] transition-colors">
        <span className="size-1.5 rounded-full bg-amy-500" /> Free for students. Teachers, bring Amy to your class
        <Icon icon={ArrowRight02Icon} size={14} />
      </motion.a>
      <h1 className="mt-4 font-semibold tracking-[-0.04em] leading-[1.04] text-[clamp(32px,min(6.6vw,8.6vh),72px)]">
        <motion.span initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.8, ease: EASE }} className="block">
          Stuck on a question?
        </motion.span>
        <motion.span initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.18, duration: 0.8, ease: EASE }} className="block">
          Amy explains it <span className="serif amy-gradient-text whitespace-nowrap pr-2">step by step.</span>
        </motion.span>
      </h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} className="mx-auto mt-4 max-w-xl text-[17px] sm:text-lg text-muted leading-relaxed">
        Your own AI tutor for {r.span}. Ask any doubt, learn it one small step at a time, and get your working checked.
      </motion.p>

      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.7, ease: EASE }} className="mx-auto mt-6 max-w-2xl rounded-2xl border border-[var(--line-2)] bg-[var(--card)] p-2 text-left shadow-[0_30px_70px_-34px_rgba(255,138,61,.55)]">
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
          {stages.map((s, i) => (
            <button key={s.id} type="button" role="tab" aria-selected={i === stage} onClick={() => setStage(i)} className={`relative shrink-0 rounded-lg px-3 py-1.5 text-sm transition-colors ${i === stage ? 'text-[var(--on-invert)]' : 'text-muted hover:text-[var(--fg)]'}`}>
              {i === stage && <motion.span layoutId="stage" className="absolute inset-0 rounded-lg bg-[var(--invert)]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}
              <span className="relative">{s.id}</span>
            </button>
          ))}
        </div>
      </motion.form>

      <div className="mx-auto mt-3 flex min-h-[76px] max-w-2xl flex-wrap justify-center gap-2 content-start">
        <AnimatePresence mode="popLayout" initial={false}>
          {stages[stage].qs.map((s, i) => (
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
      <p className="mt-1 text-sm text-muted">
        No sign-up for your first questions.{' '}
        <a href="#curricula" className="underline decoration-dotted underline-offset-4 hover:text-[var(--fg)]">
          {source === 'default' ? 'Choose your country' : `Set up for ${r.name} · change`}
        </a>
      </p>
    </div>
  );
}

const FLY: { img: string; x: number; y: number }[] = [
  { img: 'stage1', x: -40, y: -30 },
  { img: 'biology', x: 40, y: -26 },
  { img: 'space', x: -44, y: 26 },
  { img: 'stage3', x: 42, y: 28 },
  { img: 'maths', x: -16, y: -42 },
  { img: 'coding', x: 18, y: 42 },
  { img: 'stage4', x: -50, y: -2 },
  { img: 'physics', x: 50, y: 2 },
  { img: 'science', x: 12, y: -44 },
  { img: 'stage2', x: -14, y: 44 }
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
      <motion.img src={art(img)} alt="" loading="eager" decoding="async" style={{ x: tx, y: ty, scale, opacity, rotate }} className="w-[clamp(120px,17vw,230px)] aspect-[3/4] rounded-2xl object-cover ring-1 ring-white/10 shadow-[0_30px_60px_-20px_rgba(0,0,0,.55)] will-change-transform" />
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
  const { region } = useRegion();
  const { theme } = useTheme();
  const pic = (n: string) => (n.startsWith('stage') ? stagePhoto(region, Number(n.slice(5))) : n);
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

  const backdrop = reduce ? (
    <div aria-hidden className="absolute left-1/2 top-[-340px] h-[640px] w-[1000px] -translate-x-1/2 rounded-full glow-amy blur-3xl opacity-50" />
  ) : (
    <div aria-hidden className="absolute inset-0">
      <div className="absolute left-1/2 top-[-380px] h-[640px] w-[1100px] -translate-x-1/2 rounded-full glow-amy blur-3xl opacity-40" />
      <div className={`absolute inset-x-0 top-[-44%] h-[120%] [mask-image:linear-gradient(#000_48%,transparent_80%)] ${theme === 'dark' ? 'blur-[42px] scale-y-[1.6]' : ''}`}>
        <SoftAurora color1={theme === 'dark' ? '#ff9a3d' : '#ffe2a6'} color2={theme === 'dark' ? '#ff5a2a' : '#ff8a3d'} speed={0.4} spectrum={0} colorSpeed={0.2} brightness={theme === 'dark' ? 0.95 : 1} bandSpread={theme === 'dark' ? 2.2 : 1.25} noiseFrequency={1.8} mouseInfluence={0.2} clickPulse={false} lightMode={theme !== 'dark'} opacity={theme === 'dark' ? 0.55 : 0.7} />
      </div>
    </div>
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
            <FlyCard key={f.img} p={p} i={i} {...f} img={pic(f.img)} />
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
  const { region: r } = useRegion();
  const boards = [...new Set([...r.boards, 'IB', 'IGCSE', 'Cambridge'])];
  return (
    <section aria-label="Boards" className="py-10 border-y hairline">
      <p className="text-center text-sm text-muted mb-6">{r.code === 'INT' ? 'Taught to your curriculum, wherever you study' : `Taught to your curriculum in ${r.name}`}</p>
      <LogoLoop key={r.code} logos={boards.map(b => ({ node: <span className="text-xl font-medium tracking-tight text-[var(--muted)]">{b}</span>, title: b }))} speed={36} gap={64} logoHeight={28} fadeOut fadeOutColor="var(--bg)" pauseOnHover ariaLabel="Boards" />
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

const PHOTO_X: Record<Region['photos'], number[]> = { stage: [30, 45, 70, 50], west: [70, 50, 45, 40], sea: [35, 40, 45, 70], af: [35, 45, 50, 50] };

/** The four stages of school in this region: tag, wording, sample question and photo. */
function ages(r: Region) {
  const qs = stageQuestions(r);
  const titles = ['Curious about everything', 'Building the basics', r.third ?? 'The exam years', r.last ?? `Preparing for ${r.tags[3]}`];
  const texts = [
    'Simple words, small steps and pictures, with a quick check after each idea.',
    `Worked steps in ${r.math.toLowerCase()} and science, and your own working marked honestly.`,
    'Lessons for your curriculum and mock papers, marked the way an examiner would.',
    'Quizzes, mock papers and a mastery map of what to revisit before the exam.'
  ];
  const replies = [
    'Great question. Let’s find out with a glass of water.',
    'First we get 3x on its own. What should we undo?',
    'Push on a wall and it pushes back. Let’s see why.',
    r.examQs ? 'Ten questions, exam pattern. Ready for the first?' : 'It is the product rule, run backwards. Let’s build it.'
  ];
  return r.tags.map((tag, i) => ({ tag, img: stagePhoto(r, i + 1), title: titles[i], text: texts[i], q: qs[i][0], reply: replies[i], pos: `${PHOTO_X[r.photos][i]}% 30%` }));
}
const AGE_MS = 5200;

/** One tutor that grows with the student: pick a class, the photo and the conversation change. */
function Ages() {
  const { region } = useRegion();
  const AGES = useMemo(() => ages(region), [region]);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const run = inView && !hold && !reduce;
  useEffect(() => {
    if (!run) return;
    const t = setTimeout(() => setI(v => (v + 1) % AGES.length), AGE_MS);
    return () => clearTimeout(t);
  }, [i, run]);
  const a = AGES[i];

  return (
    <section className={`${wrap} pt-24 sm:pt-32`}>
      <div ref={ref} onPointerEnter={() => setHold(true)} onPointerLeave={() => setHold(false)} className="grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <Head eyebrow="One tutor, every class" title={<>She grows up <span className="serif">with you.</span></>}>
            The same Amy, pitched to your class. A younger student and an older one get different answers to the same question.
          </Head>

          <div className="mt-9" role="tablist" aria-label="Your class">
            {AGES.map((s, k) => {
              const on = k === i;
              return (
                <button key={s.tag} role="tab" aria-selected={on} onClick={() => setI(k)} className="group relative block w-full border-t hairline py-4 pl-5 text-left last:border-b">
                  <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] overflow-hidden rounded-full bg-[var(--line)]">
                    {on && <motion.span key={`${k}-${run}`} className="block h-full w-full origin-top bg-gradient-to-b from-amy-200 to-amy-600" initial={{ scaleY: run ? 0 : 1 }} animate={{ scaleY: 1 }} transition={{ duration: run ? AGE_MS / 1000 : 0.3, ease: 'linear' }} />}
                  </span>
                  <span className="flex items-baseline gap-4">
                    <span className={`w-[128px] shrink-0 text-sm font-medium transition-colors ${on ? 'text-amy-500' : 'text-muted'}`}>{s.tag}</span>
                    <span className={`text-xl font-semibold tracking-tight transition-colors sm:text-2xl ${on ? '' : 'text-muted group-hover:text-[var(--fg)]'}`}>{s.title}</span>
                  </span>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="block overflow-hidden">
                        <span className="block max-w-md pt-2 leading-relaxed text-muted sm:pl-[144px]">{s.text}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div aria-hidden className="absolute -inset-6 rounded-[40px] glow-amy blur-3xl opacity-40" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-[var(--line-2)] bg-[var(--card-2)] shadow-[0_50px_100px_-50px_rgba(0,0,0,.7)]">
            <AnimatePresence initial={false}>
              <motion.div key={a.img} initial={{ opacity: 0, scale: 1.08 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9, ease: EASE }} className="absolute inset-0">
                <img src={art(a.img)} alt={`A ${a.tag} student studying with Amy`} className="h-full w-full object-cover" style={{ objectPosition: a.pos }} />
              </motion.div>
            </AnimatePresence>
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

            <AnimatePresence mode="wait">
              <motion.span key={a.tag} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute left-4 top-4 rounded-full bg-black/55 px-3.5 py-1.5 text-sm font-medium text-white backdrop-blur-md">
                {a.tag}
              </motion.span>
            </AnimatePresence>

            {/* The conversation, sitting on the desk rather than on the face */}
            <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
              <AnimatePresence mode="wait">
                <motion.div key={a.q} className="flex flex-col gap-2.5" exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                  <motion.div initial={{ opacity: 0, y: 14, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.25, type: 'spring', stiffness: 260, damping: 22 }} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-[15px] font-medium text-[#141416] shadow-lg">
                    {a.q}
                  </motion.div>
                  <motion.div initial={{ opacity: 0, y: 14, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 1.05, type: 'spring', stiffness: 260, damping: 22 }} className="flex max-w-[92%] items-end gap-2 self-start">
                    <Amy size={34} glow={false} float={false} mood="happy" />
                    <span className="rounded-2xl rounded-bl-md bg-black/60 px-4 py-2.5 text-[15px] text-white backdrop-blur-md">{a.reply}</span>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex gap-1.5" aria-hidden>
              {AGES.map((s, k) => (
                <span key={s.tag} className={`h-1.5 rounded-full transition-all duration-500 ${k === i ? 'w-7 bg-amy-500' : 'w-1.5 bg-[var(--line-2)]'}`} />
              ))}
            </div>
            <button onClick={() => ask(a.q)} className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-amy-500 transition-colors">
              Ask Amy this <Icon icon={ArrowRight02Icon} size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
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
  const { region: r } = useRegion();
  const who: Record<string, string> = { '@all': r.all, '@junior': r.junior, '@senior': r.senior };
  const list = SUBJECTS.map(s => ({ ...s, title: s.title === 'Maths' ? r.math : s.title, who: who[s.who] ?? s.who }));
  const row = [...list, ...list];
  return (
    <section id="subjects" className="border-y hairline bg-[var(--bg-2)] py-24 sm:py-32 scroll-mt-16 overflow-hidden">
      <div className={wrap}>
        <Head eyebrow="Pick a subject" title={<>From first sums <span className="serif">to {r.end}.</span></>}>
          Amy teaches every school subject to your class. Not at school? Make your own course on anything, from coding to reading music.
        </Head>
      </div>
      <div className="mt-12 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="marquee gap-5 pr-5">
          {row.map((s, i) => (
            <button key={i} onClick={() => ask(s.q)} aria-hidden={i >= SUBJECTS.length} tabIndex={i >= SUBJECTS.length ? -1 : 0} className="group relative w-[220px] sm:w-[250px] shrink-0 overflow-hidden rounded-2xl text-left shadow-[0_24px_50px_-28px_rgba(0,0,0,.5)] transition-transform duration-500 ease-[var(--ease-soft)] hover:-translate-y-2">
              <img src={art(s.img)} alt="" loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-[var(--ease-soft)] group-hover:scale-110" />
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent p-4 pt-12 text-white">
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
  const { region, source, setRegion } = useRegion();
  const c = REGIONS.findIndex(x => x.code === region.code);
  const boards = region.boards;
  return (
    <section id="curricula" className={`${wrap} py-24 sm:py-32 scroll-mt-16`}>
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] items-start">
        <div>
          <Head eyebrow="Wherever you study" title={<>Your country. Your board. <span className="serif">Your class.</span></>}>
            {source === 'detected' ? `It looks like you are in ${region.name}, so this page is set up for it. ` : ''}Pick where you study and the whole page follows: classes, exams, boards and examples.
          </Head>
          <div className="mt-8 flex flex-wrap gap-2">
            {REGIONS.map(({ name, code }, i) => (
              <button key={name} onClick={() => setRegion(code)} aria-pressed={i === c} className={`relative rounded-full px-3.5 py-2 text-sm transition-colors ${i === c ? 'text-[var(--on-invert)]' : 'border hairline text-fg2 hover:border-amy-400'}`}>
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
              <div className="hand text-3xl leading-none">{region.name}</div>
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
  const { region: r } = useRegion();
  const lessons = r.code === 'IN' ? FREE[0] : r.code === 'INT' ? 'Lessons and quizzes for IB, IGCSE and Cambridge' : `Lessons and quizzes for ${r.boards.slice(0, 3).join(', ')}, IB and Cambridge`;
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
                <span className="leading-6">{i === 0 ? lessons : f}</span>
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
  const { region } = useRegion();
  const [q, setQ] = useState('');
  return (
    <section id="faq" className="relative overflow-hidden border-t hairline bg-[var(--bg-2)] scroll-mt-16">
      <div aria-hidden className="absolute -left-40 top-1/3 size-[520px] rounded-full glow-amy opacity-30 blur-3xl" />
      <div className={`${wrap} relative grid gap-12 py-24 sm:py-32 lg:grid-cols-[1fr_1.4fr] lg:gap-16`}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Head eyebrow="Hands up" title={<>Before you <span className="serif">start.</span></>}>
            The questions students, parents and teachers ask us most.
          </Head>

          <motion.div {...reveal(0.15)} className="relative mt-10 overflow-hidden rounded-3xl border hairline bg-[var(--card)] p-6 shadow-[0_30px_70px_-40px_rgba(0,0,0,.5)]">
            <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full glow-amy opacity-60" />
            <div className="relative flex items-center gap-4">
              <Amy size={64} mood="happy" />
              <div>
                <div className="text-lg font-semibold tracking-tight">Still curious?</div>
                <p className="text-sm text-muted">Ask Amy herself. She answers in seconds.</p>
              </div>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                ask(q.trim() || 'What can you help me with?');
              }}
              className="relative mt-5 flex items-center gap-2 rounded-2xl border border-[var(--line-2)] bg-[var(--bg)] p-1.5 pl-4 focus-within:border-amy-400 transition-colors"
            >
              <label htmlFor="faq-ask" className="sr-only">Ask Amy a question</label>
              <input id="faq-ask" value={q} onChange={e => setQ(e.target.value)} placeholder="Can Amy help with my exams?" autoComplete="off" className="h-10 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--muted)]" />
              <button className="grid size-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 text-[#2a1406]" aria-label="Ask">
                <Icon icon={ArrowRight02Icon} size={18} stroke={2.2} />
              </button>
            </form>
            <div className="relative mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t hairline pt-4 text-sm">
              <span className="text-muted">Or talk to a person:</span>
              <a href="mailto:aryamgoyal18@gmail.com" className="inline-flex items-center gap-1.5 font-medium hover:text-amy-500 transition-colors">
                <Icon icon={Mail01Icon} size={16} /> Email us
              </a>
              <a href="https://amy-tutor.com/guide" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium hover:text-amy-500 transition-colors">
                How to use Amy <Icon icon={ArrowRight02Icon} size={14} className="-rotate-45" />
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div {...reveal(0.1)}>
          <Faq items={faq(region)} />
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
          <img src={art('classroom')} alt="A sunlit classroom with a chalkboard" loading="lazy" className="block aspect-[16/9] w-full object-cover" />
          <div className="absolute left-[34.4%] top-[28.6%] grid h-[23%] w-[31.6%] place-items-center text-center">
            <p className="hand text-[4.1cqw] leading-[1.05] text-[#f4f1e6]/95">
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
            <a href="mailto:aryamgoyal18@gmail.com?subject=Amy%20for%20our%20school" className="btn btn-ghost !min-h-12 !px-6 text-base">
              <Icon icon={School01Icon} size={18} /> Amy for your school
            </a>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  const { region, setRegion } = useRegion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const wordY = useTransform(scrollYProgress, [0, 1], ['40%', '0%']);
  const wordOpacity = useTransform(scrollYProgress, [0.3, 1], [0, 1]);

  const cols: [string, [string, string, boolean?][]][] = [
    ['Learn', [['How Amy teaches', '#how'], ['Subjects', '#subjects'], ['Curricula', '#curricula'], ['Try a lesson', '#/app']]],
    ['Plans', [['Pricing', '#pricing'], ['Amy+', '#amy-plus'], ['For schools', '#schools'], ['Questions', '#faq']]],
    ['Help', [['How to use Amy', 'https://amy-tutor.com/guide', true], ['Meet Amy', '#/amy'], ['Contact us', 'mailto:aryamgoyal18@gmail.com'], ['Sign in', '#/app']]]
  ];

  return (
    <footer ref={ref} className="relative overflow-hidden border-t hairline bg-[var(--bg-2)]">
      <div aria-hidden className="absolute bottom-0 left-1/2 h-[420px] w-[1100px] -translate-x-1/2 translate-y-1/2 rounded-full glow-amy opacity-40 blur-3xl" />

      <div className={`${wrap} relative`}>
        {/* links */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs leading-relaxed text-muted">Your AI tutor from {region.span}. One step at a time, with a check that it made sense.</p>
            <label className="mt-6 inline-flex items-center gap-2 rounded-full border hairline bg-[var(--card)] py-1.5 pl-3.5 pr-2 text-sm">
              <span className="text-muted">Studying in</span>
              <select value={region.code} onChange={e => setRegion(e.target.value)} className="cursor-pointer rounded-full bg-transparent pr-1 font-medium outline-none" aria-label="Where you study">
                {REGIONS.map(r => (
                  <option key={r.code} value={r.code}>{r.name}</option>
                ))}
              </select>
            </label>
          </div>
          {cols.map(([title, links]) => (
            <div key={title}>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{title}</div>
              <ul className="mt-4 flex flex-col gap-3">
                {links.map(([l, href, ext]) => (
                  <li key={l}>
                    <a href={href} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})} className="group inline-flex items-center gap-1 text-[15px] transition-colors hover:text-amy-500">
                      <span className="relative">
                        {l}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
                      </span>
                      {ext && <Icon icon={ArrowRight02Icon} size={13} className="-rotate-45 opacity-60" />}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div className="flex flex-col gap-4 border-t hairline py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Amy. Learning through conversation.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="https://amy-tutor.com/privacy" target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--fg)]">Privacy Policy</a>
            <a href="https://amy-tutor.com/terms" target="_blank" rel="noreferrer" className="transition-colors hover:text-[var(--fg)]">Terms of Service</a>
            <ThemeToggle className="!size-9 !rounded-full" />
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top" className="grid size-9 place-items-center rounded-full border hairline transition-colors hover:bg-[var(--card-2)] hover:text-[var(--fg)]">
              <Icon icon={ArrowRight02Icon} size={16} className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* the name, huge, rising into view */}
      <motion.div aria-hidden style={{ y: wordY, opacity: wordOpacity }} className="pointer-events-none relative -mt-4 select-none overflow-hidden pb-[max(8px,env(safe-area-inset-bottom))] text-center">
        <span className="block bg-gradient-to-b from-amy-300 via-amy-500 to-transparent bg-clip-text text-[34vw] font-semibold leading-[0.78] tracking-[-0.08em] text-transparent sm:text-[28vw] lg:text-[22rem]">Amy</span>
      </motion.div>
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
        <Ages />
        <Chalkboard />
        <Memory />
        <Lesson />
        <Features />
        <Film />
        <Subjects />
        <Curricula />
        <Schools />
        <People />
        <Pricing />
        <Questions />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
