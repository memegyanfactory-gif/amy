import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'motion/react';
import { ArrowUp02Icon, Attachment01Icon, Mic01Icon } from '@hugeicons/core-free-icons';
import Amy, { type AmyMood } from '../Amy';
import { Icon } from '../ui';
import ThoughtLine from '../../bits/ThoughtLine';
import { BlockView, fmt, type Block } from './ChatBlocks';

interface Check {
  q: string;
  options: string[];
  right: number;
  ok: string;
  no: string;
}
interface Reply {
  text: string;
  blocks: Block[];
  check?: Check;
}
type Msg = { id: number; from: 'me'; text: string } | { id: number; from: 'amy'; reply: Reply; answered?: number };

/**
 * Preview replies. Linear equations are really solved and graphed; Newton's third law has a worked
 * explanation; anything else says plainly that the tutor isn't connected yet.
 */
function replyFor(q: string): Reply {
  const m = q.replace(/−/g, '-').match(/(-?\d*\.?\d*)\s*\*?\s*x\s*(?:([+-])\s*(\d+\.?\d*))?\s*=\s*(-?\d+\.?\d*)/i);
  if (m) {
    const a = m[1] === '' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    const b = m[3] ? Number(m[3]) * (m[2] === '-' ? -1 : 1) : 0;
    const c = Number(m[4]);
    if (a && Number.isFinite(a) && Number.isFinite(c)) {
      const ax = `${a === 1 ? '' : a === -1 ? '−' : fmt(a)}x`;
      const lines = [{ expr: `${ax}${b ? ` ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b))}` : ''} = ${fmt(c)}`, note: 'what we start with' }];
      if (b) lines.push({ expr: `${ax} = ${fmt(c - b)}`, note: `${b > 0 ? 'take' : 'add'} ${fmt(Math.abs(b))} ${b > 0 ? 'from' : 'to'} both sides` });
      if (a !== 1) lines.push({ expr: `x = ${fmt((c - b) / a)}`, note: `divide both sides by ${fmt(a)}` });
      return {
        text: 'To get x on its own, undo what was done to it, one operation at a time, and do the same thing to both sides so the equation stays balanced.',
        blocks: [
          { kind: 'steps', title: 'Worked steps', lines },
          { kind: 'graph', a, b, c }
        ],
        check: { q: 'Now you. Solve 2x + 3 = 11.', options: ['x = 4', 'x = 7'], right: 0, ok: '2x = 8, so x = 4.', no: 'Take 3 from both sides first to get 2x = 8, then divide by 2.' }
      };
    }
  }
  if (/newton|third law|action|reaction/i.test(q))
    return {
      text: 'Every push comes with a push back. When you push on a wall, the wall pushes on you with the same force in the opposite direction. The two forces act on different things, you and the wall, so they never cancel each other out.',
      blocks: [{ kind: 'forces' }],
      check: { q: 'You jump from a small boat onto the shore. Which way does the boat move?', options: ['Towards the shore', 'Away from the shore'], right: 1, ok: 'You push the boat backward as it pushes you forward.', no: 'The boat pushes you forward, so you push it backward, away from the shore.' }
    };
  return {
    text: "I can't reach the tutor from this preview, so I can't answer that one properly yet. This is how I'll take it once I'm connected.",
    blocks: [{ kind: 'map', center: q.length > 48 ? `${q.slice(0, 46)}…` : q, nodes: ['The key idea, in one step', 'A picture or a worked example', 'A quick check that it stuck'] }]
  };
}

function Composer({ value, onChange, onSend, busy, onTyping }: { value: string; onChange: (v: string) => void; onSend: () => void; busy: boolean; onTyping: (t: boolean) => void }) {
  const ta = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [value]);
  const key = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  return (
    <div className="rounded-xl border hairline bg-[var(--card)] shadow-[0_8px_30px_-18px_rgba(0,0,0,.5)] focus-within:border-[var(--line-2)] transition-colors">
      <label htmlFor="chat-input" className="sr-only">
        Ask Amy
      </label>
      <textarea
        id="chat-input"
        ref={ta}
        rows={1}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={key}
        onFocus={() => onTyping(true)}
        onBlur={() => onTyping(false)}
        placeholder="Ask anything"
        className="block w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-[16px] leading-6 outline-none placeholder:text-[var(--muted)]"
      />
      <div className="flex items-center gap-1 px-2 pb-2">
        <button type="button" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-[var(--card-2)] hover:text-[var(--fg)] transition-colors" aria-label="Add a photo or file">
          <Icon icon={Attachment01Icon} size={18} />
        </button>
        <button type="button" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-[var(--card-2)] hover:text-[var(--fg)] transition-colors" aria-label="Talk to Amy">
          <Icon icon={Mic01Icon} size={18} />
        </button>
        <button
          type="button"
          onClick={onSend}
          disabled={busy || !value.trim()}
          className="ml-auto grid size-9 place-items-center rounded-lg bg-[var(--invert)] text-[var(--on-invert)] disabled:opacity-25 transition-[opacity,transform] active:scale-95"
          aria-label="Send"
        >
          <Icon icon={ArrowUp02Icon} size={18} stroke={2} />
        </button>
      </div>
    </div>
  );
}

const WORD_MS = 34;
const BLOCK_TICKS = 34;

function AmyReply({ msg, live, onAnswer, onGrow }: { msg: Extract<Msg, { from: 'amy' }>; live: boolean; onAnswer: (i: number) => void; onGrow: () => void }) {
  const { text, blocks, check } = msg.reply;
  const words = useMemo(() => text.split(' '), [text]);
  const total = words.length + blocks.length * BLOCK_TICKS + 6;
  const [tick, setTick] = useState(live ? 0 : total);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (tick >= total) return;
    const t = setTimeout(() => setTick(v => v + 1), WORD_MS);
    return () => clearTimeout(t);
  }, [tick, total]);

  const pulse = Math.floor(tick / 3);
  useEffect(() => {
    onGrow();
  }, [pulse, msg.answered, onGrow]);

  const typing = tick < words.length;
  const blocksShown = typing ? 0 : Math.min(blocks.length, Math.floor((tick - words.length) / BLOCK_TICKS) + 1);
  const done = tick >= total;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="min-w-0 flex-1 flex flex-col gap-4">
      <p className="text-[16.5px] leading-[1.75]">
        {words.slice(0, tick).join(' ')}
        {typing && <motion.span aria-hidden className="inline-block w-[7px] h-[18px] translate-y-[3px] ml-1 rounded-[2px] bg-amy-500" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.9, repeat: Infinity }} />}
      </p>

      {blocks.slice(0, blocksShown).map((b, i) => (
        <BlockView key={i} block={b} />
      ))}

      {check && done && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-xl border hairline bg-[var(--card)] overflow-hidden">
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
                    disabled={reveal}
                    onClick={() => onAnswer(i)}
                    className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-[15px] transition-colors disabled:cursor-default ${
                      reveal && right
                        ? 'border-[var(--right)] bg-[var(--right)]/10'
                        : picked
                          ? 'border-[var(--notyet)] bg-[var(--notyet)]/10'
                          : `hairline ${reveal ? 'opacity-50' : 'hover:border-[var(--line-2)] hover:bg-[var(--card-2)]'}`
                    }`}
                  >
                    <span className={`grid size-6 shrink-0 place-items-center rounded-md border text-xs font-medium ${reveal && right ? 'border-[var(--right)] text-[var(--right)]' : picked ? 'border-[var(--notyet)] text-[var(--notyet)]' : 'hairline text-muted'}`}>
                      {String.fromCharCode(65 + i)}
                    </span>
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

      {done && (
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

export default function Chat({ initial = '' }: { initial?: string }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [typing, setTyping] = useState(false);
  const [react, setReact] = useState<AmyMood | null>(null);
  const idRef = useRef(1);
  const liveId = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setMsgs(m => [...m, { id: idRef.current++, from: 'me', text: t }]);
    setInput('');
    setBusy(true);
    setTimeout(() => {
      const id = idRef.current++;
      liveId.current = id;
      setMsgs(m => [...m, { id, from: 'amy', reply: replyFor(t) }]);
      setBusy(false);
    }, 1900);
  };

  useEffect(() => {
    if (initial && !sentInitial.current) {
      sentInitial.current = true;
      send(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const grow = useCallback(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);
  useEffect(grow, [msgs.length, busy, grow]);

  const answer = (id: number, i: number) => {
    const msg = msgs.find(x => x.id === id);
    setMsgs(m => m.map(x => (x.id === id && x.from === 'amy' ? { ...x, answered: i } : x)));
    if (msg && msg.from === 'amy' && msg.reply.check) {
      setReact(msg.reply.check.right === i ? 'happy' : 'encouraging');
      setTimeout(() => setReact(null), 2200);
    }
  };

  const mood: AmyMood = busy ? 'thinking' : (react ?? 'calm');
  const lookAt = typing && input ? ('down' as const) : undefined;
  const empty = msgs.length === 0;
  const lastAmy = [...msgs].reverse().find(m => m.from === 'amy')?.id;

  const composer = <Composer value={input} onChange={setInput} onSend={() => send(input)} busy={busy} onTyping={setTyping} />;
  const note = <p className="mt-2 text-center text-xs text-muted">Preview: try an equation like 3x + 7 = 22. Full answers arrive when the tutor is connected.</p>;
  const amy = (size: number) => (
    <motion.div layoutId="amy-live" transition={{ type: 'spring', stiffness: 260, damping: 28 }} style={{ width: size, height: size }}>
      <Amy size={size} mood={mood} lookAt={lookAt} follow interactive glow={size > 48} float={size > 48} />
    </motion.div>
  );

  return (
    <LayoutGroup>
      <div className="flex flex-col h-[calc(100dvh-64px-62px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] md:h-[calc(100dvh-64px)]">
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
            <div ref={scroller} className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-[760px] px-4 sm:px-6 py-8 flex flex-col gap-7">
                {msgs.map(m =>
                  m.from === 'me' ? (
                    <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="self-end max-w-[82%] rounded-xl bg-[var(--card-2)] px-4 py-2.5 text-[16px] leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </motion.div>
                  ) : (
                    <div key={m.id} className="flex gap-3 sm:gap-4">
                      <div className="w-8 shrink-0 pt-0.5">{m.id === lastAmy && !busy && amy(32)}</div>
                      <AmyReply msg={m} live={m.id === liveId.current} onAnswer={i => answer(m.id, i)} onGrow={grow} />
                    </div>
                  )
                )}
                {busy && (
                  <div className="flex gap-3 sm:gap-4 items-start">
                    <div className="w-8 shrink-0">{amy(32)}</div>
                    <ThoughtLine working label="Working it out" steps={['Reading your question', 'Finding the first step', 'Drawing it']} color="var(--muted)" glyph="none" fontSize={15} collapsible={false} />
                  </div>
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
