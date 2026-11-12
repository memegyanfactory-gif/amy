import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUp02Icon,
  BulbIcon,
  Call02Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Edit02Icon,
  LeftToRightListBulletIcon,
  LockIcon,
  Maximize01Icon,
  Minimize01Icon,
  PresentationBarChart01Icon,
  Quiz01Icon,
  Search02Icon,
  Tick02Icon
} from '@hugeicons/core-free-icons';
import Amy, { type AmyMood } from '../Amy';
import { Icon, ThemeToggle } from '../ui';
import { Thinking } from './Chat';
import type { Course } from './Courses';
import { LESSONS, isRight, type LessonContent, type Q } from '../../lessons';
import { useProfile, useProgress } from '../../store';

const EASE = [0.23, 1, 0.32, 1] as const;
const PASS = 6;

/* ------------------------------------------------------------------ */
/* Amy's messages: a short think, then the words arrive one by one       */
/* ------------------------------------------------------------------ */

type Msg =
  | { id: number; from: 'me'; text: string }
  | { id: number; from: 'amy'; text: string[]; ask?: string; thinking?: string[]; tone?: 'right' | 'notyet' }
  | { id: number; from: 'quiz' };

const pauseAfter = (w: string) => (/[.!?]$/.test(w) ? 220 : /[,;:]$/.test(w) ? 110 : 22 + Math.min(w.length, 10) * 3);

function AmyMsg({ msg, live, onDone, onGrow }: { msg: Extract<Msg, { from: 'amy' }>; live: boolean; onDone: () => void; onGrow: () => void }) {
  const reduce = useReducedMotion();
  const paras = useMemo(() => [...msg.text, ...(msg.ask ? [msg.ask] : [])].map(p => p.split(' ')), [msg]);
  const total = paras.reduce((n, p) => n + p.length, 0);
  const steps = msg.thinking ?? [];
  const [step, setStep] = useState(live && steps.length ? 0 : steps.length);
  const [n, setN] = useState(live ? 0 : total);
  const started = useRef(performance.now());
  const [ms, setMs] = useState(live ? 0 : 1800);
  const thinking = step < steps.length;
  const flat = useMemo(() => paras.flat(), [paras]);
  const doneRef = useRef(!live);

  useEffect(() => {
    if (!thinking) return;
    const tick = setInterval(() => setMs(performance.now() - started.current), 100);
    const t = setTimeout(() => {
      setMs(performance.now() - started.current);
      setStep(s => s + 1);
    }, reduce ? 80 : 420 + steps[step].length * 8);
    return () => {
      clearTimeout(t);
      clearInterval(tick);
    };
  }, [thinking, step, steps, reduce]);

  useEffect(() => {
    if (thinking) return;
    if (n < total) {
      const t = setTimeout(() => setN(v => v + 1), reduce ? 0 : pauseAfter(flat[n - 1] ?? ''));
      return () => clearTimeout(t);
    }
    if (!doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  }, [thinking, n, total, flat, reduce, onDone]);

  useEffect(onGrow, [step, Math.floor(n / 5), onGrow]);

  let used = 0;
  return (
    <div className="min-w-0 flex-1 flex flex-col gap-3">
      {steps.length > 0 && <Thinking steps={steps} at={Math.min(step, steps.length - 1)} live={thinking} ms={ms} />}
      {!thinking &&
        paras.map((words, pi) => {
          const start = used;
          used += words.length;
          const shown = Math.max(0, Math.min(words.length, n - start));
          if (!shown) return null;
          const isAsk = msg.ask && pi === paras.length - 1;
          return (
            <p key={pi} className={`text-[16px] leading-[1.75] ${isAsk ? 'font-medium' : ''} ${pi === 0 && msg.tone === 'right' ? 'text-[var(--right)]' : ''}`}>
              {words.slice(0, shown).map((w, i) => (
                <span key={i}>
                  <motion.span initial={live && !reduce ? { opacity: 0, filter: 'blur(5px)' } : false} animate={{ opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.35, ease: EASE }}>
                    {w}
                  </motion.span>{' '}
                </span>
              ))}
            </p>
          );
        })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Multiple choice, used by practice and the quiz                       */
/* ------------------------------------------------------------------ */

function Choice({ q, picked, onPick }: { q: Q; picked: number | null; onPick: (i: number) => void }) {
  const reveal = picked !== null;
  return (
    <div>
      <div className="text-[15.5px] font-medium leading-relaxed">{q.q}</div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {q.options.map((o, i) => {
          const right = q.right === i;
          const mine = picked === i;
          return (
            <motion.button
              key={o}
              disabled={reveal}
              onClick={() => onPick(i)}
              whileTap={{ scale: 0.98 }}
              animate={mine && !right ? { x: [0, -6, 6, -3, 3, 0] } : mine ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.35 }}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[15px] transition-colors disabled:cursor-default ${reveal && right ? 'border-[var(--right)] bg-[var(--right)]/10' : mine ? 'border-[var(--notyet)] bg-[var(--notyet)]/10' : `hairline ${reveal ? 'opacity-50' : 'hover:border-[var(--line-2)] hover:bg-[var(--card-2)]'}`}`}
            >
              <span className={`grid size-6 shrink-0 place-items-center rounded-md border text-xs font-medium ${reveal && right ? 'border-[var(--right)] text-[var(--right)]' : mine ? 'border-[var(--notyet)] text-[var(--notyet)]' : 'hairline text-muted'}`}>{String.fromCharCode(65 + i)}</span>
              {o}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {reveal && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden text-[15px] leading-relaxed">
            <span className="block pt-3">
              <span className={`font-medium ${picked === q.right ? 'text-[var(--right)]' : 'text-[var(--notyet)]'}`}>{picked === q.right ? 'Right. ' : 'Not yet. '}</span>
              {q.why}
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Practice({ qs }: { qs: Q[] }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [sure, setSure] = useState(false);
  const [score, setScore] = useState({ right: 0, sureWrong: 0 });
  const finished = i >= qs.length;
  if (finished)
    return (
      <div className="text-[15px]">
        <div className="font-medium">You got {score.right} of {qs.length}.</div>
        <p className="mt-1 text-muted">{score.sureWrong ? `You were sure about ${score.sureWrong} you got wrong. Those are worth another look.` : 'Practice does not change your progress. The quiz does.'}</p>
        <button onClick={() => { setI(0); setPicked(null); setScore({ right: 0, sureWrong: 0 }); }} className="btn btn-ghost !min-h-9 mt-3 text-sm">Practise again</button>
      </div>
    );
  return (
    <div>
      <div className="mb-3 flex items-center justify-between text-xs text-muted">
        <span>Question {i + 1} of {qs.length}</span>
        <label className="inline-flex items-center gap-1.5">
          <input type="checkbox" checked={sure} disabled={picked !== null} onChange={e => setSure(e.target.checked)} className="accent-[#ff8a3d]" /> I’m sure about this one
        </label>
      </div>
      <Choice
        q={qs[i]}
        picked={picked}
        onPick={p => {
          setPicked(p);
          setScore(s => ({ right: s.right + (p === qs[i].right ? 1 : 0), sureWrong: s.sureWrong + (p !== qs[i].right && sure ? 1 : 0) }));
        }}
      />
      {picked !== null && (
        <button onClick={() => { setI(v => v + 1); setPicked(null); setSure(false); }} className="btn btn-primary !min-h-9 mt-3 text-sm">
          {i === qs.length - 1 ? 'See how you did' : 'Next question'}
        </button>
      )}
    </div>
  );
}

function SpotMistake({ m }: { m: LessonContent['mistake'] }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div>
      <div className="text-[15px] font-medium">{m.problem}</div>
      <p className="mt-1 text-sm text-muted">Amy’s working has one wrong step. Tap it.</p>
      <ol className="mt-3 flex flex-col gap-2">
        {m.steps.map((s, i) => {
          const wrong = i === m.wrong;
          const mine = picked === i;
          return (
            <li key={i}>
              <motion.button disabled={picked !== null && picked === m.wrong} onClick={() => setPicked(i)} animate={mine && !wrong ? { x: [0, -5, 5, 0] } : {}} className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[15px] transition-colors ${mine && wrong ? 'border-[var(--right)] bg-[var(--right)]/10' : mine ? 'border-[var(--notyet)] bg-[var(--notyet)]/10' : 'hairline hover:bg-[var(--card-2)]'}`}>
                <span className="hand w-5 shrink-0 text-xl leading-none text-amy-500">{i + 1}</span>
                <span className="font-mono text-[14px]">{s}</span>
              </motion.button>
            </li>
          );
        })}
      </ol>
      {picked !== null && (
        <p className="mt-3 text-[15px] leading-relaxed">
          {picked === m.wrong ? <><span className="font-medium text-[var(--right)]">You found it. </span>{m.why}</> : <><span className="font-medium text-[var(--notyet)]">Not that one. </span>Step {picked + 1} is fine. Look again.</>}
        </p>
      )}
    </div>
  );
}

function ExplainBack({ e }: { e: LessonContent['explain'] }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean[] | null>(null);
  const check = () => {
    const t = ` ${text.toLowerCase().replace(/\s+/g, ' ')} `;
    setResult(e.points.map(p => p.words.some(w => t.includes(w))));
  };
  return (
    <div>
      <div className="text-[15px] font-medium">{e.prompt}</div>
      <textarea value={text} onChange={x => { setText(x.target.value); setResult(null); }} rows={4} placeholder="Write it the way you would explain it to a friend." className="mt-3 w-full resize-y rounded-lg border hairline bg-[var(--bg)] p-3 text-[15px] leading-relaxed outline-none focus:border-amy-400/70" />
      <button disabled={text.trim().split(/\s+/).length < 5} onClick={check} className="btn btn-primary !min-h-9 mt-2 text-sm disabled:opacity-40">Check what I covered</button>
      {result && (
        <motion.ul initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex flex-col gap-1.5 text-[15px]">
          <li className="mb-1 text-sm text-muted">You covered {result.filter(Boolean).length} of {result.length} key ideas.</li>
          {e.points.map((p, i) => (
            <li key={p.text} className="flex items-start gap-2">
              <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${result[i] ? 'bg-[var(--right)]/15 text-[var(--right)]' : 'bg-[var(--notyet)]/15 text-[var(--notyet)]'}`}>
                <Icon icon={result[i] ? Tick02Icon : Cancel01Icon} size={12} stroke={2.6} />
              </span>
              <span className={result[i] ? '' : 'text-muted'}>{result[i] ? p.text : `Missing: ${p.text}`}</span>
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The quiz that completes the concept                                  */
/* ------------------------------------------------------------------ */

function Quiz({ qs, onPassed, onNext, hasNext }: { qs: Q[]; onPassed: () => void; onNext: () => void; hasNext: boolean }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const finished = i >= qs.length;
  const passed = finished && right >= PASS;
  const reported = useRef(false);
  useEffect(() => {
    if (passed && !reported.current) {
      reported.current = true;
      onPassed();
    }
  }, [passed, onPassed]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-xl border hairline bg-[var(--card)]">
      <div className="flex h-11 items-center gap-2 border-b hairline px-4 text-sm">
        <Icon icon={Quiz01Icon} size={16} className="text-amy-500" />
        <span className="font-medium">Concept quiz</span>
        <span className="ml-auto text-muted tabular-nums">{finished ? `${right} of ${qs.length}` : `${i + 1} of ${qs.length}`}</span>
      </div>
      <div className="h-1 bg-[var(--card-2)]">
        <motion.div className="h-full bg-gradient-to-r from-amy-400 to-amy-600" animate={{ width: `${(Math.min(i, qs.length) / qs.length) * 100}%` }} transition={{ duration: 0.4, ease: EASE }} />
      </div>
      <div className="p-4 sm:p-5">
        {!finished ? (
          <>
            <Choice key={i} q={qs[i]} picked={picked} onPick={p => { setPicked(p); if (p === qs[i].right) setRight(r => r + 1); }} />
            {picked !== null && (
              <button onClick={() => { setI(v => v + 1); setPicked(null); }} className="btn btn-primary !min-h-9 mt-4 text-sm">
                {i === qs.length - 1 ? 'See my score' : 'Next question'}
              </button>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="text-4xl font-semibold tracking-tight tabular-nums">{right}<span className="text-xl text-muted"> / {qs.length}</span></div>
            <div className={`mt-1 font-medium ${passed ? 'text-[var(--right)]' : 'text-[var(--notyet)]'}`}>{passed ? 'Passed. This concept is done.' : `Not yet. You need ${PASS} to pass.`}</div>
            <p className="mt-1 text-sm text-muted">{passed ? 'Your progress is saved, and the next concept is now open.' : 'Read the explanations again, or try the practice questions, then have another go.'}</p>
            <div className="mt-4 flex justify-center gap-2">
              {passed ? (
                hasNext && <button onClick={onNext} className="btn !min-h-10 font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500">Next lesson <Icon icon={ArrowRight02Icon} size={16} /></button>
              ) : (
                <button onClick={() => { setI(0); setPicked(null); setRight(0); }} className="btn btn-primary !min-h-10">Try the quiz again</button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The board: slides, an infographic and a mind map                     */
/* ------------------------------------------------------------------ */

function Board({ c, onAsk, wide, onWide }: { c: LessonContent | undefined; onAsk: (q: string) => void; wide: boolean; onWide: () => void }) {
  const [tab, setTab] = useState<'slides' | 'info' | 'map'>('slides');
  const [s, setS] = useState(0);
  const [open, setOpen] = useState<number | null>(0);
  const [dir, setDir] = useState(1);
  const go = (n: number) => {
    if (!c) return;
    setDir(n);
    setS(v => Math.min(c.slides.length - 1, Math.max(0, v + n)));
  };
  const key = (e: KeyboardEvent) => {
    if (tab !== 'slides') return;
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };
  const tabs: [typeof tab, string, typeof BulbIcon][] = [['slides', 'Slides', PresentationBarChart01Icon], ['info', 'Infographic', LeftToRightListBulletIcon], ['map', 'Mind map', BulbIcon]];

  return (
    <div className="flex h-full min-h-0 flex-col" onKeyDown={key} tabIndex={-1}>
      <div className="flex h-12 shrink-0 items-center gap-1 border-b hairline px-3">
        {tabs.map(([id, label, icon]) => (
          <button key={id} onClick={() => setTab(id)} aria-pressed={tab === id} className={`relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${tab === id ? 'text-[var(--on-invert)]' : 'text-muted hover:text-[var(--fg)]'}`}>
            {tab === id && <motion.span layoutId="board-tab" className="absolute inset-0 rounded-lg bg-[var(--invert)]" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
            <span className="relative inline-flex items-center gap-1.5"><Icon icon={icon} size={15} /> {label}</span>
          </button>
        ))}
        <button onClick={onWide} aria-label={wide ? 'Make the board smaller' : 'Make the board bigger'} className="ml-auto hidden size-8 place-items-center rounded-lg text-muted hover:bg-[var(--card-2)] hover:text-[var(--fg)] lg:grid">
          <Icon icon={wide ? Minimize01Icon : Maximize01Icon} size={16} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
        {!c ? (
          <p className="mt-10 text-center text-sm text-muted">Slides, an infographic and a mind map appear here when Amy teaches this lesson.</p>
        ) : tab === 'slides' ? (
          <div className="flex h-full flex-col">
            <div className="relative flex-1 overflow-hidden rounded-2xl border hairline bg-[var(--card)] [perspective:1200px]" style={{ minHeight: 280 }}>
              <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full glow-amy opacity-60" />
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div key={s} custom={dir} initial={{ opacity: 0, x: 40 * dir, rotateY: 8 * dir }} animate={{ opacity: 1, x: 0, rotateY: 0 }} exit={{ opacity: 0, x: -40 * dir, rotateY: -8 * dir }} transition={{ duration: 0.35, ease: EASE }} className="relative flex h-full flex-col p-6 sm:p-8">
                  <div className="text-xs font-medium uppercase tracking-wider text-amy-500">Slide {s + 1} of {c.slides.length}</div>
                  <h3 className={`mt-3 font-semibold leading-tight tracking-[-0.02em] ${wide ? 'text-4xl' : 'text-2xl'}`}>{c.slides[s].title}</h3>
                  <ul className="mt-5 flex flex-col gap-3">
                    {c.slides[s].points.map((p, i) => (
                      <motion.li key={p} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }} className={`flex gap-3 leading-relaxed ${wide ? 'text-xl' : 'text-[15.5px]'}`}>
                        <span className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-amy-500" />
                        {p}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button onClick={() => go(-1)} disabled={s === 0} className="inline-flex h-9 items-center gap-1 rounded-lg border hairline px-3 text-sm disabled:opacity-35 hover:bg-[var(--card-2)]"><Icon icon={ArrowLeft01Icon} size={15} /> Prev</button>
              <div className="flex gap-1.5">
                {c.slides.map((_, i) => (
                  <button key={i} onClick={() => { setDir(i > s ? 1 : -1); setS(i); }} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === s ? 'w-6 bg-amy-500' : 'w-1.5 bg-[var(--line-2)]'}`} />
                ))}
              </div>
              <button onClick={() => go(1)} disabled={s === c.slides.length - 1} className="inline-flex h-9 items-center gap-1 rounded-lg border hairline px-3 text-sm disabled:opacity-35 hover:bg-[var(--card-2)]">Next <Icon icon={ArrowRight01Icon} size={15} /></button>
            </div>
          </div>
        ) : tab === 'info' ? (
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-amy-500">Step by step</div>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight">{c.info.title}</h3>
            <p className="mt-1 text-muted">{c.info.summary}</p>
            <ol className={`relative mt-5 grid gap-3 ${wide ? 'sm:grid-cols-2' : ''}`}>
              {c.info.steps.map((st, i) => (
                <motion.li key={st.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="flex gap-3 rounded-xl border hairline bg-[var(--card)] p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-amy-400/15 text-sm font-semibold text-amy-600 dark:text-amy-200">{i + 1}</span>
                  <div className="min-w-0">
                    <div className="font-medium">{st.title}</div>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted">{st.text}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {st.tags.map(t => <span key={t} className="rounded-md bg-[var(--card-2)] px-2 py-0.5 text-xs">{t}</span>)}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>
            <div className="mt-3 rounded-xl border border-amy-400/50 bg-amy-400/10 p-4 text-[15px]">
              <span className="font-medium">Remember: </span>{c.info.remember}
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-muted">The big picture of {c.map.center}. Tap a part to open it.</p>
            <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <div className="shrink-0 rounded-2xl bg-[var(--invert)] px-5 py-4 text-center text-lg font-semibold text-[var(--on-invert)] sm:w-40">{c.map.center}</div>
              <svg aria-hidden viewBox="0 0 40 200" preserveAspectRatio="none" className="hidden h-[220px] w-10 shrink-0 sm:block">
                {c.map.branches.map((_, i) => {
                  const y = 25 + i * (150 / Math.max(1, c.map.branches.length - 1));
                  return <motion.path key={i} d={`M0 100 C 20 100, 20 ${y}, 40 ${y}`} fill="none" stroke="#ff8a3d" strokeOpacity=".7" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1 * i, duration: 0.5 }} />;
                })}
              </svg>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                {c.map.branches.map((b, i) => (
                  <div key={b.title} className={`rounded-xl border transition-colors ${open === i ? 'border-amy-400 bg-amy-400/5' : 'hairline bg-[var(--card)]'}`}>
                    <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center gap-2 px-3 py-2.5 text-left font-medium">
                      <span className="size-2 rounded-full bg-amy-500" /> {b.title}
                      <motion.span animate={{ rotate: open === i ? 180 : 0 }} className="ml-auto text-muted"><Icon icon={ArrowDown01Icon} size={15} /></motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open === i && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <ul className="px-3 pb-2 text-sm text-fg2">
                            {b.points.map(p => <li key={p} className="py-0.5">· {p}</li>)}
                          </ul>
                          <button onClick={() => onAsk(`Tell me more about ${b.title.toLowerCase()}`)} className="mx-3 mb-3 inline-flex items-center gap-1 text-sm font-medium text-amy-600 dark:text-amy-200">Ask Amy about this <Icon icon={ArrowRight02Icon} size={14} /></button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The course outline                                                   */
/* ------------------------------------------------------------------ */

function Outline({ course, index, done, onOpen }: { course: Course; index: number; done: number; onOpen: (i: number) => void }) {
  const total = course.chapters.reduce((n, c) => n + c.concepts.length, 0);
  const pct = Math.round((Math.min(done, total) / total) * 100);
  const chOf = (i: number) => {
    let n = 0;
    for (let c = 0; c < course.chapters.length; c++) {
      n += course.chapters[c].concepts.length;
      if (i < n) return c;
    }
    return 0;
  };
  const [open, setOpen] = useState<Set<number>>(() => new Set([chOf(index)]));
  let k = 0;
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b hairline p-4">
        <div className="font-semibold leading-snug">{course.title}</div>
        <div className="mt-3 flex items-center justify-between text-xs text-muted">
          <span>Progress</span>
          <span className="tabular-nums">{pct}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--card-2)]">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-amy-400 to-amy-600" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: EASE }} />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {course.chapters.map((ch, ci) => {
          const first = k;
          k += ch.concepts.length;
          const chDone = Math.max(0, Math.min(ch.concepts.length, done - first));
          const on = open.has(ci);
          return (
            <div key={ch.title} className="mb-1">
              <button onClick={() => setOpen(s => { const n = new Set(s); n.has(ci) ? n.delete(ci) : n.add(ci); return n; })} aria-expanded={on} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-medium hover:bg-[var(--card-2)]">
                <motion.span animate={{ rotate: on ? 0 : -90 }} className="text-muted"><Icon icon={ArrowDown01Icon} size={14} /></motion.span>
                <span className="min-w-0 flex-1 truncate">{ch.title}</span>
                <span className="text-xs text-muted tabular-nums">{chDone}/{ch.concepts.length}</span>
              </button>
              <AnimatePresence initial={false}>
                {on && (
                  <motion.ul initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                    {ch.concepts.map((name, j) => {
                      const i = first + j;
                      const passed = i < done;
                      const locked = i > done;
                      const here = i === index;
                      return (
                        <li key={name}>
                          <button disabled={locked} onClick={() => onOpen(i)} className={`flex w-full items-center gap-2.5 rounded-lg py-2 pl-7 pr-2 text-left text-sm transition-colors ${here ? 'bg-amy-400/15 font-medium text-[var(--fg)]' : locked ? 'text-muted opacity-55' : 'text-fg2 hover:bg-[var(--card-2)]'}`}>
                            <span className="grid size-4 shrink-0 place-items-center">
                              {passed ? <Icon icon={CheckmarkCircle02Icon} size={15} className="text-[var(--right)]" /> : locked ? <Icon icon={LockIcon} size={13} /> : <span className={`size-1.5 rounded-full ${here ? 'bg-amy-500' : 'bg-[var(--muted)]'}`} />}
                            </span>
                            <span className="min-w-0 flex-1 truncate">{name}</span>
                            {LESSONS[name] && <span className="shrink-0 text-xs text-muted">{LESSONS[name].minutes} min</span>}
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The page                                                             */
/* ------------------------------------------------------------------ */

function Drawer({ open, onClose, side, children }: { open: boolean; onClose: () => void; side: 'left' | 'right'; children: ReactNode }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/45" />
          <motion.div initial={{ x: side === 'left' ? '-100%' : '100%' }} animate={{ x: 0 }} exit={{ x: side === 'left' ? '-100%' : '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} className={`absolute inset-y-0 ${side === 'left' ? 'left-0' : 'right-0'} w-[min(420px,92vw)] border-x hairline bg-[var(--bg)]`}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function Lesson({ course, index, onExit, onOpen }: { course: Course; index: number; onExit: () => void; onOpen: (i: number) => void }) {
  const { profile } = useProfile();
  const { doneIn, pass } = useProgress();
  const done = doneIn(course.title, course.done ?? 0);
  const all = useMemo(() => course.chapters.flatMap(c => c.concepts), [course]);
  const name = all[index];
  const c = LESSONS[name];
  const hasNext = index + 1 < all.length;

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [part, setPart] = useState(0);
  const [tries, setTries] = useState(0);
  const [awaiting, setAwaiting] = useState(false);
  const [liveDone, setLiveDone] = useState(true);
  const [input, setInput] = useState('');
  const [tool, setTool] = useState<'practice' | 'mistake' | 'explain' | null>(null);
  const [about, setAbout] = useState(true);
  const [tab, setTab] = useState<'chat' | 'voice'>('chat');
  const [outline, setOutline] = useState(false);
  const [board, setBoard] = useState(false);
  const [wide, setWide] = useState(false);
  const [mood, setMood] = useState<AmyMood>('calm');
  const idRef = useRef(1);
  const liveId = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const say = (m: Omit<Extract<Msg, { from: 'amy' }>, 'id' | 'from'>, me?: string) => {
    const list: Msg[] = [];
    if (me) list.push({ id: idRef.current++, from: 'me', text: me });
    const id = idRef.current++;
    liveId.current = id;
    list.push({ id, from: 'amy', ...m });
    setLiveDone(false);
    stick.current = true;
    setMsgs(v => [...v, ...list]);
  };

  // Start the lesson.
  useEffect(() => {
    setMsgs([]);
    setPart(0);
    setTries(0);
    setTool(null);
    setOutline(false);
    if (!c) return;
    const first = profile.name.trim().split(/\s+/)[0];
    say({ thinking: ['Reading the lesson plan', `Pitching it for ${profile.klass || profile.stage || 'your class'}`, 'Choosing an everyday example to start with'], text: [`${first ? `Hi ${first}! ` : ''}${c.hello}`, ...c.parts[0].text], ask: c.parts[0].ask });
    setAwaiting(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.title, index]);

  const grow = () => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };
  useEffect(grow, [msgs.length]);

  const flash = (m: AmyMood) => {
    setMood(m);
    setTimeout(() => setMood('calm'), 2200);
  };

  const nextPart = (lead: string[], me: string, tone?: 'right' | 'notyet') => {
    if (!c) return;
    const n = part + 1;
    if (n < c.parts.length) {
      setPart(n);
      setTries(0);
      say({ text: [...lead, ...c.parts[n].text], ask: c.parts[n].ask, tone }, me);
      setAwaiting(true);
    } else {
      setAwaiting(false);
      say({ text: [...lead, 'That is the whole concept. When you feel ready, take the quiz: 7 questions, and 6 right passes it.'], tone }, me);
    }
  };

  const send = (raw = input) => {
    const t = raw.trim();
    if (!t || !liveDone) return;
    setInput('');
    if (!c) return;
    if (awaiting) {
      const p = c.parts[part];
      if (isRight(p, t)) {
        flash('happy');
        nextPart([`Right. ${p.answer}`], t, 'right');
      } else if (tries === 0) {
        setTries(1);
        flash('encouraging');
        say({ text: [`Not yet. ${p.hint}`], ask: 'Have another go.' }, t);
      } else {
        flash('encouraging');
        nextPart([`Here is how it works: ${p.answer}`], t);
      }
      return;
    }
    say({ text: ['Questions beyond this lesson need the tutor, which this preview is not connected to. You can use the board, try the practice tools, or take the quiz.'] }, t);
  };

  const composerKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const lastAmy = [...msgs].reverse().find(m => m.from === 'amy')?.id;
  const quizOpen = msgs.some(m => m.from === 'quiz');

  const outlineEl = <Outline course={course} index={index} done={done} onOpen={onOpen} />;
  const boardEl = <Board c={c} wide={wide} onWide={() => setWide(w => !w)} onAsk={q => { setBoard(false); if (c) { const b = c.map.branches.find(x => q.endsWith(x.title.toLowerCase())); if (b && liveDone) say({ text: [`${b.title}: ${b.points.join('. ')}.`] }, q); } }} />;

  return (
    <div className="site fixed inset-0 z-50 flex flex-col bg-[var(--bg)]">
      {/* top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b hairline px-3 sm:px-4">
        <button onClick={onExit} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm text-muted hover:bg-[var(--card-2)] hover:text-[var(--fg)]">
          <Icon icon={ArrowLeft02Icon} size={16} /> Courses
        </button>
        <button onClick={() => setOutline(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border hairline px-3 text-sm xl:hidden">
          <Icon icon={LeftToRightListBulletIcon} size={15} /> Contents
        </button>
        <div className="mx-auto hidden min-w-0 flex-col items-center md:flex">
          <span className="truncate text-sm font-semibold">{name}</span>
          <span className="truncate text-xs text-muted">{course.title}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button onClick={() => setBoard(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border hairline px-3 text-sm lg:hidden">
            <Icon icon={PresentationBarChart01Icon} size={15} /> Board
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className={`grid min-h-0 flex-1 ${wide ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] xl:grid-cols-[280px_minmax(0,1fr)_minmax(0,1.4fr)]' : 'lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[280px_minmax(0,1fr)_420px]'}`}>
        <aside className="hidden min-h-0 border-r hairline bg-[var(--bg-2)] xl:block">{outlineEl}</aside>

        {/* the lesson chat */}
        <section className="flex min-h-0 flex-col">
          <div className="flex h-11 shrink-0 items-center gap-1 border-b hairline px-4">
            {(['chat', 'voice'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`relative h-11 shrink-0 whitespace-nowrap px-3 text-sm transition-colors ${tab === t ? 'font-medium text-[var(--fg)]' : 'text-muted hover:text-[var(--fg)]'}`}>
                {t === 'chat' ? 'Lesson' : 'Voice call'}
                {tab === t && <motion.span layoutId="lesson-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-amy-500" />}
              </button>
            ))}
            <span className="ml-auto hidden min-w-0 truncate text-xs text-muted sm:block md:hidden">{name}</span>
          </div>

          {tab === 'voice' ? (
            <div className="grid flex-1 place-items-center p-6 text-center">
              <div className="max-w-sm">
                <Amy size={96} mood="listening" />
                <h2 className="mt-4 text-xl font-semibold">Talk this lesson through</h2>
                <p className="mt-2 text-muted">On a voice call you ask out loud and Amy answers and draws on the board as she explains. Voice calls need the tutor, which this preview is not connected to.</p>
                <button disabled className="btn btn-primary mt-5 !min-h-11 opacity-40"><Icon icon={Call02Icon} size={17} /> Start a voice call</button>
              </div>
            </div>
          ) : (
            <>
              <div ref={scroller} onScroll={() => { const el = scroller.current; if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80; }} className="min-h-0 flex-1 overflow-y-auto">
                <div className="mx-auto flex max-w-[720px] flex-col gap-6 px-4 py-6 sm:px-6">
                  {/* about this concept */}
                  <div className="rounded-xl border hairline bg-[var(--card)]">
                    <button onClick={() => setAbout(a => !a)} aria-expanded={about} className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm">
                      <span className="font-medium">About this concept</span>
                      <span className="text-muted">· about {c?.minutes ?? 15} min</span>
                      <motion.span animate={{ rotate: about ? 180 : 0 }} className="ml-auto text-muted"><Icon icon={ArrowDown01Icon} size={15} /></motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {about && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                          <p className="border-t hairline px-4 py-3 text-sm text-muted"><span className="font-medium text-[var(--fg)]">To master it: </span>get {PASS} of 7 right in the quiz at the end. Amy asks a question after each part as you go.</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* try it yourself */}
                  {c && (
                    <div>
                      <div className="mb-2 text-sm font-medium text-muted">Try it yourself</div>
                      <div className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border hairline bg-[var(--card)]">
                        {([
                          ['practice', Quiz01Icon, 'Practice questions', 'Check yourself. Does not change your progress.'],
                          ['mistake', Search02Icon, 'Spot Amy’s mistake', 'Amy solves a problem with one wrong step. Find it.'],
                          ['explain', Edit02Icon, 'Explain it back', 'Put it in your own words. Amy shows what you covered and what is missing.']
                        ] as const).map(([id, icon, title, text]) => (
                          <div key={id}>
                            <button onClick={() => setTool(tool === id ? null : id)} aria-expanded={tool === id} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--card-2)] transition-colors">
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-amy-400/15 text-amy-500"><Icon icon={icon} size={17} /></span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[15px] font-medium">{title}</span>
                                <span className="block text-sm text-muted">{text}</span>
                              </span>
                              <motion.span animate={{ rotate: tool === id ? 90 : 0 }} className="text-muted"><Icon icon={ArrowRight01Icon} size={16} /></motion.span>
                            </button>
                            <AnimatePresence initial={false}>
                              {tool === id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                                  <div className="border-t hairline bg-[var(--bg-2)] p-4">
                                    {id === 'practice' && <Practice qs={c.practice} />}
                                    {id === 'mistake' && <SpotMistake m={c.mistake} />}
                                    {id === 'explain' && <ExplainBack e={c.explain} />}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-xs text-muted">
                    <span className="h-px flex-1 bg-[var(--line)]" /> Today <span className="h-px flex-1 bg-[var(--line)]" />
                  </div>

                  {!c && (
                    <div className="flex gap-3">
                      <Amy size={32} glow={false} float={false} />
                      <div className="text-[16px] leading-[1.75]">
                        <p>Amy writes “{name}” for you when the tutor is connected. In this preview, these lessons are ready to try:</p>
                        <ul className="mt-2 list-disc pl-5 text-fg2">{Object.keys(LESSONS).map(k => <li key={k}>{k}</li>)}</ul>
                      </div>
                    </div>
                  )}

                  {msgs.map(m =>
                    m.from === 'me' ? (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }} style={{ originX: 1 }} className="self-end max-w-[82%] rounded-2xl rounded-br-md bg-[var(--card-2)] px-4 py-2.5 text-[16px]">
                        {m.text}
                      </motion.div>
                    ) : m.from === 'quiz' ? (
                      <Quiz key={m.id} qs={c!.quiz} hasNext={hasNext} onNext={() => onOpen(index + 1)} onPassed={() => { pass(course.title, index, course.done ?? 0); flash('happy'); }} />
                    ) : (
                      <div key={m.id} className="flex gap-3">
                        <div className="w-8 shrink-0 pt-0.5">{m.id === lastAmy && <Amy size={32} mood={!liveDone && m.id === liveId.current ? 'thinking' : mood} glow={false} float={false} />}</div>
                        <AmyMsg msg={m} live={m.id === liveId.current} onDone={() => setLiveDone(true)} onGrow={grow} />
                      </div>
                    )
                  )}

                  {c && liveDone && msgs.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 pl-11">
                      {awaiting && (
                        <>
                          <button onClick={() => say({ text: [c.parts[part].again], ask: c.parts[part].ask }, 'Explain it differently')} className="btn btn-ghost !min-h-9 text-sm">Explain differently</button>
                          <button onClick={() => { setTries(1); say({ text: [c.parts[part].hint] }, 'Give me a hint'); }} className="btn btn-ghost !min-h-9 text-sm">Give me a hint</button>
                        </>
                      )}
                      {!quizOpen && (
                        <button onClick={() => { setAwaiting(false); setMsgs(v => [...v, { id: idRef.current++, from: 'quiz' }]); }} className="btn !min-h-9 border border-amy-400 text-sm font-medium text-amy-600 dark:text-amy-200 hover:bg-amy-400/10">
                          <Icon icon={Quiz01Icon} size={15} /> Take the quiz to finish ({PASS}/7 to pass)
                        </button>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* composer */}
              <div className="shrink-0 px-3 pb-3 pt-1 sm:px-6">
                <div className="mx-auto flex max-w-[720px] items-end gap-2 rounded-xl border hairline bg-[var(--card)] p-2 pl-4 shadow-[0_8px_30px_-18px_rgba(0,0,0,.5)] focus-within:border-[var(--line-2)]">
                  <label htmlFor="lesson-input" className="sr-only">Answer Amy or ask a question</label>
                  <textarea id="lesson-input" rows={1} value={input} onChange={e => setInput(e.target.value)} onKeyDown={composerKey} placeholder={!liveDone ? 'Amy is explaining…' : awaiting ? 'Type your answer' : 'Ask Amy about this concept'} className="max-h-40 min-w-0 flex-1 resize-none bg-transparent py-2 text-[16px] leading-6 outline-none placeholder:text-[var(--muted)]" />
                  <button onClick={() => send()} disabled={!input.trim() || !liveDone} aria-label="Send" className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--invert)] text-[var(--on-invert)] transition-opacity disabled:opacity-25">
                    <Icon icon={ArrowUp02Icon} size={18} stroke={2} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="hidden min-h-0 border-l hairline bg-[var(--bg-2)] lg:block">{boardEl}</aside>
      </div>

      <Drawer open={outline} onClose={() => setOutline(false)} side="left">{outlineEl}</Drawer>
      <Drawer open={board} onClose={() => setBoard(false)} side="right">{boardEl}</Drawer>
    </div>
  );
}
