import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import Amy, { type AmyMood } from './Amy';

/** A scripted lesson that plays by itself: ask, one step, a check, "Not yet", then right. */
type Step =
  | { kind: 'student'; text: string }
  | { kind: 'thinking' }
  | { kind: 'amy'; text: string; math?: string }
  | { kind: 'check'; q: string; options: string[] }
  | { kind: 'pick'; index: number }
  | { kind: 'feedback'; ok: boolean; text: string };

const SCRIPT: Step[] = [
  { kind: 'student', text: 'How do I solve 3x + 7 = 22?' },
  { kind: 'thinking' },
  { kind: 'amy', text: 'We want x on its own. First, take 7 away from both sides.', math: '3x + 7 − 7 = 22 − 7   →   3x = 15' },
  { kind: 'check', q: 'Your turn: what gets x alone in 3x = 15?', options: ['Take away 3', 'Divide by 3'] },
  { kind: 'pick', index: 0 },
  { kind: 'feedback', ok: false, text: 'Not yet. 3x means 3 × x, so we undo it by dividing. Try again?' },
  { kind: 'pick', index: 1 },
  { kind: 'feedback', ok: true, text: 'Right. x = 5. Check it: 3 × 5 + 7 = 22.' }
];
const DELAYS = [900, 1500, 2200, 1600, 1700, 2300, 1500, 3800];

export default function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? SCRIPT.length : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const t = setTimeout(() => setN(v => (v >= SCRIPT.length ? 0 : v + 1)), n >= SCRIPT.length ? 2600 : DELAYS[n] ?? 1500);
    return () => clearTimeout(t);
  }, [n, inView, reduce]);

  const shown = SCRIPT.slice(0, n);
  const picks = shown.filter((s): s is Extract<Step, { kind: 'pick' }> => s.kind === 'pick');
  const last = shown[shown.length - 1];
  const feedback = [...shown].reverse().find((s): s is Extract<Step, { kind: 'feedback' }> => s.kind === 'feedback');
  const mood: AmyMood =
    last?.kind === 'thinking' ? 'thinking' : feedback?.ok ? 'happy' : feedback && !feedback.ok && last?.kind === 'feedback' ? 'encouraging' : 'calm';

  return (
    <div ref={ref} className="card relative overflow-hidden p-5 sm:p-7 min-h-[470px] flex flex-col" aria-label="Example lesson with Amy">
      <div className="flex items-center gap-3 pb-4 border-b hairline">
        <Amy size={40} mood={mood} glow={false} float={false} />
        <div className="leading-tight">
          <div className="font-medium">Amy</div>
          <div className="text-xs text-muted">Maths · Class 8</div>
        </div>
        <span className="ml-auto text-xs text-muted rounded-lg border hairline px-2.5 py-1">Example</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 pt-5" aria-live="polite">
        <AnimatePresence initial={false}>
          {shown.map((s, i) => {
            if (s.kind === 'student')
              return (
                <motion.div key={i} layout initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="self-end max-w-[85%] rounded-lg rounded-br-md bg-[var(--invert)] text-[var(--on-invert)] px-4 py-2.5 text-[15px]">
                  {s.text}
                </motion.div>
              );
            if (s.kind === 'thinking')
              return last === s ? (
                <motion.div key={i} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-muted flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inset-0 rounded-lg bg-amy-400 animate-ping" />
                    <span className="relative size-2 rounded-lg bg-amy-400" />
                  </span>
                  Amy is working it out…
                </motion.div>
              ) : null;
            if (s.kind === 'amy')
              return (
                <motion.div key={i} layout initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.5 }} className="max-w-[92%] text-[15px] sm:text-base leading-relaxed text-fg2">
                  {s.text}
                  {s.math && <div className="mt-2 font-mono text-[13px] sm:text-sm rounded-xl bg-[var(--card-2)] px-3 py-2 text-[var(--fg)] overflow-x-auto whitespace-nowrap">{s.math}</div>}
                </motion.div>
              );
            if (s.kind === 'check')
              return (
                <motion.div key={i} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-amy-400/40 bg-amy-400/[.07] p-4">
                  <div className="text-xs font-medium tracking-wide text-amy-500 uppercase">Quick check</div>
                  <div className="mt-1 text-[15px]">{s.q}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {s.options.map((o, j) => {
                      const picked = picks.some(p => p.index === j);
                      const right = j === 1;
                      return (
                        <motion.span
                          key={o}
                          animate={picked ? { scale: [1, 0.94, 1] } : {}}
                          className={`rounded-lg border px-3.5 py-1.5 text-sm transition-colors duration-300 ${
                            picked ? (right ? 'border-[var(--right)] text-[var(--right)] bg-[var(--right)]/10' : 'border-[var(--notyet)] text-[var(--notyet)] bg-[var(--notyet)]/10') : 'hairline'
                          }`}
                        >
                          {o}
                        </motion.span>
                      );
                    })}
                  </div>
                </motion.div>
              );
            if (s.kind === 'feedback')
              return (
                <motion.div key={i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-[15px] leading-relaxed">
                  <span className={`font-medium ${s.ok ? 'text-[var(--right)]' : 'text-[var(--notyet)]'}`}>{s.ok ? 'Right.' : 'Not yet.'}</span> {s.text.replace(/^(Right|Not yet)\.\s*/, '')}
                </motion.div>
              );
            return null;
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
