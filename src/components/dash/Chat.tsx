import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { ArrowDown01Icon, Tick02Icon } from '@hugeicons/core-free-icons';
import Amy, { type AmyMood } from '../Amy';
import { Icon } from '../ui';
import { BlockView, fmt, type Block } from './ChatBlocks';
import { Composer, SlideDeck, SlidesToggle, chunk, type Attachment } from './Composer';
import { useChatSettings } from '../../store';

const EASE = [0.23, 1, 0.32, 1] as const;

interface Check {
  q: string;
  options: string[];
  right: number;
  ok: string;
  no: string;
}
interface Reply {
  /** What Amy works through before she answers, in order. Shown live, then folded away. */
  thinking: string[];
  text: string;
  blocks: Block[];
  check?: Check;
}
type Msg = { id: number; from: 'me'; text: string; attachment?: Attachment } | { id: number; from: 'amy'; reply: Reply; answered?: number };
type Phase = 'thinking' | 'writing' | 'done';

/**
 * Preview replies. Linear equations are really solved, checked and graphed; Newton's third law has a
 * worked explanation; anything else says plainly that the tutor isn't connected yet.
 */
function replyFor(q: string, draw: boolean, file?: Attachment): Reply {
  if (file)
    return {
      thinking: [`Opening ${file.image ? 'your photo' : 'your PDF'}: ${file.name}`, 'Reading photos and PDFs needs the tutor', 'Not connected in this preview'],
      text: `I can see ${file.image ? 'your photo' : 'your PDF'}, but reading the question in it needs the tutor, which this preview is not connected to. Type the question out and I'll take it from there.`,
      blocks: []
    };
  const m = q.replace(/−/g, '-').match(/(-?\d*\.?\d*)\s*\*?\s*x\s*(?:([+-])\s*(\d+\.?\d*))?\s*=\s*(-?\d+\.?\d*)/i);
  if (m) {
    const a = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    const b = m[3] ? Number(m[3]) * (m[2] === '-' ? -1 : 1) : 0;
    const c = Number(m[4]);
    if (a && Number.isFinite(a) && Number.isFinite(c)) {
      const x = (c - b) / a;
      const ax = `${a === 1 ? '' : a === -1 ? '−' : fmt(a)}x`;
      const eq = `${ax}${b ? ` ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b))}` : ''} = ${fmt(c)}`;
      const lines = [{ expr: eq, note: 'what we start with' }];
      if (b) lines.push({ expr: `${ax} = ${fmt(c - b)}`, note: `${b > 0 ? 'take' : 'add'} ${fmt(Math.abs(b))} ${b > 0 ? 'from' : 'to'} both sides` });
      if (a !== 1) lines.push({ expr: `x = ${fmt(x)}`, note: `divide both sides by ${fmt(a)}` });
      const done = [a !== 1 && a !== -1 ? `× ${fmt(a)}` : '', b ? `${b > 0 ? '+' : '−'} ${fmt(Math.abs(b))}` : ''].filter(Boolean).join(', then ');
      const back = `${a === 1 ? '' : a === -1 ? '−' : fmt(a)}(${fmt(x)})${b ? ` ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b))}` : ''}`;
      return {
        thinking: [
          `Reading the equation: ${eq}`,
          done ? `x had ${done} done to it` : 'x is almost on its own already',
          'Undoing those in reverse, on both sides',
          `Checking: ${back} = ${fmt(c)}, so x = ${fmt(x)} works`,
          draw ? 'Drawing the line to show where it crosses' : 'Writing out the worked steps'
        ],
        text: 'To get x on its own, undo what was done to it, one operation at a time, and do the same thing to both sides so the equation stays balanced.',
        blocks: [
          { kind: 'steps', title: 'Worked steps', lines },
          ...(draw ? [{ kind: 'graph' as const, a, b, c }] : [])
        ],
        check: { q: 'Now you. Solve 2x + 3 = 11.', options: ['x = 4', 'x = 7'], right: 0, ok: '2x = 8, so x = 4.', no: 'Take 3 from both sides first to get 2x = 8, then divide by 2.' }
      };
    }
  }
  if (/newton|third law|action|reaction/i.test(q))
    return {
      thinking: ['Reading your question', 'The idea: forces always come in pairs', 'Finding an everyday example: pushing a wall', 'Drawing the two forces on different objects', 'Writing a quick check'],
      text: 'Every push comes with a push back. When you push on a wall, the wall pushes on you with the same force in the opposite direction. The two forces act on different things, you and the wall, so they never cancel each other out.',
      blocks: [{ kind: 'forces' }],
      check: { q: 'You jump from a small boat onto the shore. Which way does the boat move?', options: ['Towards the shore', 'Away from the shore'], right: 1, ok: 'You push the boat backward as it pushes you forward.', no: 'The boat pushes you forward, so you push it backward, away from the shore.' }
    };
  return {
    thinking: ['Reading your question', 'Trying to reach the tutor', 'Not connected in this preview, so planning how I would teach it'],
    text: "I can't reach the tutor from this preview, so I can't answer that one properly yet. This is how I'll take it once I'm connected.",
    blocks: draw ? [{ kind: 'map', center: q.length > 48 ? `${q.slice(0, 46)}…` : q, nodes: ['The key idea, in one step', 'A picture or a worked example', 'A quick check that it stuck'] }] : []
  };
}

/* ------------------------------------------------------------------ */
/* Thinking: steps tick off live, then fold into "Thought for 2.4 s"    */
/* ------------------------------------------------------------------ */

export function Thinking({ steps, at, live, ms }: { steps: string[]; at: number; live: boolean; ms: number }) {
  const [open, setOpen] = useState(false);
  const shown = live || open;
  const secs = (ms / 1000).toFixed(1);
  return (
    <div className="text-[14.5px]">
      <button type="button" onClick={() => !live && setOpen(o => !o)} disabled={live} aria-expanded={shown} className="inline-flex items-center gap-1.5 rounded-md py-0.5 text-muted transition-colors enabled:hover:text-[var(--fg)] disabled:cursor-default">
        {live ? (
          <>
            <span className="shimmer-text font-medium">Thinking</span>
            <span className="tabular-nums opacity-70">{secs}s</span>
          </>
        ) : (
          <>
            <span>Thought for {secs}s</span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <Icon icon={ArrowDown01Icon} size={15} />
            </motion.span>
          </>
        )}
      </button>
      <AnimatePresence initial={false}>
        {shown && (
          <motion.ol initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="relative overflow-hidden pl-[26px]">
            <span aria-hidden className="absolute bottom-2 left-[6px] top-3 w-px bg-[var(--line-2)]" />
            <AnimatePresence initial={false}>
              {steps.slice(0, live ? at + 1 : steps.length).map((s, i) => {
                const active = live && i === at;
                return (
                  <motion.li key={s} initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 0.35, ease: EASE }} className="relative flex items-start gap-2 py-1.5 first:pt-2 last:pb-1">
                    <span className="absolute -left-[26px] top-[9px] grid size-[13px] place-items-center rounded-full bg-[var(--bg)]">
                      {active ? (
                        <motion.span className="size-[7px] rounded-full bg-amy-500" animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                      ) : (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-[13px] place-items-center rounded-full bg-[var(--card-2)] text-amy-500">
                          <Icon icon={Tick02Icon} size={9} stroke={3} />
                        </motion.span>
                      )}
                    </span>
                    <span className={active ? 'shimmer-text' : 'text-muted'}>{s}</span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ol>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One reply: think, then write word by word, then draw, then check     */
/* ------------------------------------------------------------------ */

/** How long to wait after a word: longer at the end of a sentence or clause, like someone speaking. */
const pauseAfter = (w: string) => (/[.!?]$/.test(w) ? 260 : /[,;:]$/.test(w) ? 130 : 26 + Math.min(w.length, 10) * 3);
const BLOCK_GAP = 650;

function AmyReply({ msg, live, stop, onAnswer, onGrow, onPhase, slides }: { msg: Extract<Msg, { from: 'amy' }>; live: boolean; stop: number; onAnswer: (i: number) => void; onGrow: () => void; onPhase: (p: Phase) => void; slides: boolean }) {
  const { thinking, text, blocks, check } = msg.reply;
  const reduce = useReducedMotion();
  const words = useMemo(() => text.split(' '), [text]);
  const [phase, setPhase] = useState<Phase>(live ? 'thinking' : 'done');
  const [step, setStep] = useState(0);
  const [n, setN] = useState(live ? 0 : words.length);
  const [shownBlocks, setShownBlocks] = useState(live ? 0 : blocks.length);
  const started = useRef(performance.now());
  const [ms, setMs] = useState(live ? 0 : 2400);
  const [copied, setCopied] = useState(false);
  const firstStop = useRef(stop);

  useEffect(() => onPhase(phase), [phase, onPhase]);

  // Thinking: each step takes a little longer the more there is to it.
  useEffect(() => {
    if (phase !== 'thinking') return;
    const tick = setInterval(() => setMs(performance.now() - started.current), 100);
    const t = setTimeout(
      () => {
        if (step < thinking.length - 1) setStep(s => s + 1);
        else {
          setMs(performance.now() - started.current);
          setPhase('writing');
        }
      },
      reduce ? 120 : 480 + thinking[step].length * 9
    );
    return () => {
      clearTimeout(t);
      clearInterval(tick);
    };
  }, [phase, step, thinking, reduce]);

  // Writing: words, then each drawing in turn. In slides mode the deck shows it all at once.
  useEffect(() => {
    if (phase !== 'writing') return;
    if (slides) {
      setN(words.length);
      setShownBlocks(blocks.length);
      setPhase('done');
      return;
    }
    if (n < words.length) {
      const t = setTimeout(() => setN(v => v + 1), reduce ? 0 : pauseAfter(words[n - 1] ?? ''));
      return () => clearTimeout(t);
    }
    if (shownBlocks < blocks.length) {
      const t = setTimeout(() => setShownBlocks(v => v + 1), reduce ? 0 : shownBlocks === 0 ? 300 : BLOCK_GAP);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setPhase('done'), blocks.length ? BLOCK_GAP : 200);
    return () => clearTimeout(t);
  }, [phase, n, shownBlocks, words, blocks.length, reduce, slides]);

  // Stop: finish at once.
  useEffect(() => {
    if (stop === firstStop.current || phase === 'done') return;
    if (phase === 'thinking') setMs(performance.now() - started.current);
    setStep(thinking.length - 1);
    setN(words.length);
    setShownBlocks(blocks.length);
    setPhase('done');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop]);

  useEffect(() => {
    onGrow();
  }, [step, Math.floor(n / 4), shownBlocks, phase, msg.answered, onGrow]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  const writing = phase === 'writing' && n < words.length;

  if (slides && phase === 'done') {
    const deck = [
      ...chunk([text]).map((t, i) => ({ key: `t${i}`, node: <p className="font-medium tracking-[-0.01em]">{t}</p> })),
      ...blocks.map((b, i) => ({ key: `b${i}`, node: <div className="text-base"><BlockView block={b} /></div> })),
      ...(check
        ? [{
            key: 'check',
            node: (
              <div className="text-base">
                <div className="mb-1 text-sm font-medium uppercase tracking-wider text-amy-500">Your turn</div>
                <div className="text-[22px] font-semibold leading-snug">{check.q}</div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {check.options.map((o, i) => {
                    const reveal = msg.answered !== undefined;
                    const right = check.right === i;
                    const picked = msg.answered === i;
                    return (
                      <motion.button key={o} whileTap={{ scale: 0.97 }} animate={picked && !right ? { x: [0, -6, 6, -3, 3, 0] } : {}} disabled={reveal} onClick={() => onAnswer(i)} className={`rounded-2xl border-2 px-4 py-4 text-left text-lg font-medium transition-colors ${reveal && right ? 'border-[var(--right)] bg-[var(--right)]/10' : picked ? 'border-[var(--notyet)] bg-[var(--notyet)]/10' : 'hairline hover:border-amy-400'}`}>
                        {o}
                      </motion.button>
                    );
                  })}
                </div>
                {msg.answered !== undefined && (
                  <p className="mt-4 text-lg">
                    <span className={`font-semibold ${msg.answered === check.right ? 'text-[var(--right)]' : 'text-[var(--notyet)]'}`}>{msg.answered === check.right ? 'Right! ' : 'Not yet. '}</span>
                    {msg.answered === check.right ? check.ok : check.no}
                  </p>
                )}
              </div>
            )
          }]
        : [])
    ];
    return (
      <div className="min-w-0 flex-1 flex flex-col gap-4">
        <Thinking steps={thinking} at={step} live={false} ms={ms} />
        <SlideDeck slides={deck} deckKey={msg.id} />
      </div>
    );
  }

  return (
    <div className="min-w-0 flex-1 flex flex-col gap-4">
      <Thinking steps={thinking} at={step} live={phase === 'thinking'} ms={ms} />

      {phase !== 'thinking' && (
        <p className="text-[16.5px] leading-[1.75]" aria-live="polite">
          {words.slice(0, n).map((w, i) => (
            <motion.span key={i} initial={live && !reduce ? { opacity: 0, filter: 'blur(6px)', y: 3 } : false} animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="inline-block whitespace-pre">
              {w}{i < words.length - 1 ? ' ' : ''}
            </motion.span>
          ))}
          {writing && <motion.span aria-hidden className="ml-0.5 inline-block size-[9px] translate-y-[-1px] rounded-full bg-amy-500" animate={{ scale: [1, 0.6, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />}
        </p>
      )}

      {blocks.slice(0, shownBlocks).map((b, i) => (
        <motion.div key={i} initial={live ? { opacity: 0, y: 16, scale: 0.98 } : false} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.55, ease: EASE }}>
          <BlockView block={b} />
        </motion.div>
      ))}

      {check && phase === 'done' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE }} className="rounded-xl border hairline bg-[var(--card)] overflow-hidden">
          <div className="flex items-center gap-2 border-b hairline px-4 h-10 text-xs text-muted">
            <span className="size-1.5 rounded-full bg-amy-500" />
            Quick check
          </div>
          <div className="p-4 sm:p-5">
            <div className="text-[16px]">{check.q}</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {check.options.map((o, i) => {
                const picked = msg.answered === i;
                const right = check.right === i;
                const reveal = msg.answered !== undefined;
                return (
                  <motion.button
                    key={o}
                    whileTap={{ scale: 0.98 }}
                    animate={picked && !right ? { x: [0, -6, 6, -4, 4, 0] } : picked ? { scale: [1, 1.04, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    disabled={reveal}
                    onClick={() => onAnswer(i)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[15px] transition-colors disabled:cursor-default ${
                      reveal && right ? 'border-[var(--right)] bg-[var(--right)]/10' : picked ? 'border-[var(--notyet)] bg-[var(--notyet)]/10' : `hairline ${reveal ? 'opacity-50' : 'hover:border-[var(--line-2)] hover:bg-[var(--card-2)]'}`
                    }`}
                  >
                    <span className={`grid size-6 shrink-0 place-items-center rounded-md border text-xs font-medium ${reveal && right ? 'border-[var(--right)] text-[var(--right)]' : picked ? 'border-[var(--notyet)] text-[var(--notyet)]' : 'hairline text-muted'}`}>{String.fromCharCode(65 + i)}</span>
                    {o}
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {msg.answered !== undefined && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden text-[15px] leading-relaxed">
                  <span className="block pt-3">
                    {msg.answered === check.right ? <span className="font-medium text-[var(--right)]">Right. </span> : <span className="font-medium text-[var(--notyet)]">Not yet. </span>}
                    {msg.answered === check.right ? check.ok : check.no}
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {phase === 'done' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-1 text-xs text-muted -mt-1">
          <button onClick={copy} className="rounded-md px-2 py-1 hover:bg-[var(--card-2)] hover:text-[var(--fg)] transition-colors">
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="rounded-md px-2 py-1 hover:bg-[var(--card-2)] hover:text-[var(--fg)] transition-colors">Report a mistake</button>
        </motion.div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chat                                                                 */
/* ------------------------------------------------------------------ */

export default function Chat({ initial = '', initialFile }: { initial?: string; initialFile?: Attachment }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('done');
  const [typing, setTyping] = useState(false);
  const [react, setReact] = useState<AmyMood | null>(null);
  const [stop, setStop] = useState(0);
  const [file, setFile] = useState<Attachment | null>(null);
  const { alwaysDraw, slides } = useChatSettings();
  const idRef = useRef(1);
  const liveId = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const sentInitial = useRef(false);
  const busy = phase !== 'done';

  const send = (text: string, f: Attachment | null = file) => {
    const t = text.trim() || (f ? (f.image ? 'What is in this photo?' : 'What is in this PDF?') : '');
    if (!t || busy) return;
    const att = f ?? undefined;
    setFile(null);
    const me = idRef.current++;
    const id = idRef.current++;
    liveId.current = id;
    stick.current = true;
    setPhase('thinking');
    setMsgs(m => [...m, { id: me, from: 'me', text: t, attachment: att }, { id, from: 'amy', reply: replyFor(t, alwaysDraw, att) }]);
    setInput('');
  };

  useEffect(() => {
    if ((initial || initialFile) && !sentInitial.current) {
      sentInitial.current = true;
      send(initial, initialFile ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  // Follow the answer as it grows, unless the student has scrolled up to read.
  const grow = useCallback(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, []);
  useEffect(grow, [msgs.length, grow]);
  const onScroll = () => {
    const el = scroller.current;
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const answer = (id: number, i: number) => {
    const msg = msgs.find(x => x.id === id);
    setMsgs(m => m.map(x => (x.id === id && x.from === 'amy' ? { ...x, answered: i } : x)));
    if (msg && msg.from === 'amy' && msg.reply.check) {
      setReact(msg.reply.check.right === i ? 'happy' : 'encouraging');
      setTimeout(() => setReact(null), 2200);
    }
  };

  const mood: AmyMood = react ?? (phase === 'thinking' ? 'thinking' : phase === 'writing' ? 'listening' : 'calm');
  const lookAt = typing && input ? ('down' as const) : undefined;
  const empty = msgs.length === 0;
  const lastAmy = [...msgs].reverse().find(m => m.from === 'amy')?.id;

  const composer = <Composer value={input} onChange={setInput} onSend={() => send(input)} onStop={() => setStop(s => s + 1)} busy={busy} onTyping={setTyping} attachment={file} onAttach={setFile} />;
  const note = (
    <div className="mx-auto mt-2 flex max-w-[760px] flex-wrap items-center justify-between gap-2">
      <SlidesToggle />
      <p className="text-xs text-muted">Preview: try an equation like 3x + 7 = 22.</p>
    </div>
  );
  const amy = (size: number) => (
    <motion.div layoutId="amy-live" transition={{ type: 'spring', stiffness: 260, damping: 28 }} style={{ width: size, height: size }}>
      <Amy size={size} mood={mood} lookAt={lookAt} follow interactive glow={size > 48} float={size > 48} />
    </motion.div>
  );

  return (
    <LayoutGroup>
      <div className="flex flex-col h-[calc(100dvh-68px-62px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] md:h-[calc(100dvh-68px)]">
        {empty ? (
          <div className="flex-1 grid place-items-center px-4 sm:px-6">
            <div className="w-full max-w-[680px] flex flex-col items-center pb-16">
              {amy(96)}
              <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-center">
                What are you <span className="serif">stuck on?</span>
              </h1>
              <motion.div layoutId="composer" className="mt-8 w-full">
                {composer}
              </motion.div>
              {note}
            </div>
          </div>
        ) : (
          <>
            <div ref={scroller} onScroll={onScroll} className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-[760px] px-4 sm:px-6 py-8 flex flex-col gap-7">
                {msgs.map(m =>
                  m.from === 'me' ? (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 28 }} style={{ originX: 1, originY: 1 }} className="self-end max-w-[82%] rounded-2xl rounded-br-md bg-[var(--card-2)] px-4 py-2.5 text-[16px] leading-relaxed whitespace-pre-wrap">
                      {m.attachment && (m.attachment.image ? <img src={m.attachment.url} alt="" className="mb-2 max-h-48 rounded-xl object-cover" /> : <span className="mb-1 block text-sm text-muted">PDF: {m.attachment.name}</span>)}
                      {m.text}
                    </motion.div>
                  ) : (
                    <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="flex gap-3 sm:gap-4">
                      <div className="w-8 shrink-0 pt-0.5">{m.id === lastAmy && amy(32)}</div>
                      <AmyReply msg={m} live={m.id === liveId.current} stop={stop} onAnswer={i => answer(m.id, i)} onGrow={grow} onPhase={m.id === liveId.current ? setPhase : noop} slides={slides && m.id === lastAmy} />
                    </motion.div>
                  )
                )}
              </div>
            </div>
            <div className="shrink-0 px-3 sm:px-6 pb-3 pt-1">
              <motion.div layoutId="composer" className="mx-auto max-w-[760px]">
                {composer}
              </motion.div>
              {note}
            </div>
          </>
        )}
      </div>
    </LayoutGroup>
  );
}

const noop = () => {};
