import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft01Icon, ArrowRight01Icon, ArrowUp02Icon, Call02Icon, CallEnd01Icon, Camera01Icon, Cancel01Icon, File01Icon, Mic01Icon, PresentationBarChart02Icon, SlideIcon } from '@hugeicons/core-free-icons';
import Amy from '../Amy';
import { Icon } from '../ui';
import { useChatSettings } from '../../store';

const EASE = [0.23, 1, 0.32, 1] as const;

/* ------------------------------------------------------------------ */
/* A round tool button with a label that shows on hover                 */
/* ------------------------------------------------------------------ */

function Tool({ icon, label, on, disabled, onClick, pulse }: { icon: typeof Mic01Icon; label: string; on?: boolean; disabled?: boolean; onClick: () => void; pulse?: boolean }) {
  return (
    <span className="group/tool relative">
      <motion.button type="button" whileTap={{ scale: 0.9 }} onClick={onClick} disabled={disabled} aria-label={label} aria-pressed={on} className={`relative grid size-9 place-items-center rounded-full transition-colors disabled:opacity-35 ${on ? 'bg-amy-400/20 text-amy-600 dark:text-amy-200' : 'text-muted hover:bg-[var(--card-2)] hover:text-[var(--fg)]'}`}>
        {pulse && <motion.span aria-hidden className="absolute inset-0 rounded-full bg-[var(--notyet)]/25" animate={{ scale: [1, 1.35, 1], opacity: [0.8, 0, 0.8] }} transition={{ duration: 1.4, repeat: Infinity }} />}
        <Icon icon={icon} size={18} stroke={1.8} className="relative" />
      </motion.button>
      <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-[var(--invert)] px-2 py-1 text-xs text-[var(--on-invert)] opacity-0 shadow-lg transition-opacity group-hover/tool:opacity-100 group-focus-within/tool:opacity-100">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Voice call: the microphone is real, Amy's voice needs the tutor      */
/* ------------------------------------------------------------------ */

function VoiceCall({ onEnd }: { onEnd: () => void }) {
  const [level, setLevel] = useState(0);
  const [state, setState] = useState<'asking' | 'live' | 'denied'>('asking');
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let raf = 0;
    let alive = true;
    navigator.mediaDevices
      ?.getUserMedia({ audio: true })
      .then(s => {
        if (!alive) return s.getTracks().forEach(t => t.stop());
        stream = s;
        ctx = new AudioContext();
        const an = ctx.createAnalyser();
        an.fftSize = 256;
        ctx.createMediaStreamSource(s).connect(an);
        const buf = new Uint8Array(an.frequencyBinCount);
        const loop = () => {
          an.getByteFrequencyData(buf);
          setLevel(buf.reduce((a, b) => a + b, 0) / buf.length / 128);
          raf = requestAnimationFrame(loop);
        };
        loop();
        setState('live');
      })
      .catch(() => alive && setState('denied'));
    const t = setInterval(() => setSecs(v => v + 1), 1000);
    const esc = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onEnd();
    window.addEventListener('keydown', esc);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearInterval(t);
      window.removeEventListener('keydown', esc);
      stream?.getTracks().forEach(tr => tr.stop());
      void ctx?.close();
    };
  }, [onEnd]);

  const bars = Array.from({ length: 24 }, (_, i) => Math.max(0.12, Math.min(1, level * (0.6 + Math.abs(Math.sin(i * 1.3)) * 0.9))));
  return (
    <motion.div role="dialog" aria-label="Voice call with Amy" className="site fixed inset-0 z-[80] flex flex-col items-center justify-center bg-[var(--bg)]/95 p-6 text-center backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div aria-hidden className="absolute left-1/2 top-1/3 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full glow-amy opacity-50 blur-3xl" />
      <div className="relative text-sm text-muted tabular-nums">{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, '0')}</div>
      <motion.div className="relative mt-6" animate={{ scale: 1 + level * 0.15 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
        <Amy size={150} mood="listening" />
      </motion.div>
      <div className="relative mt-8 flex h-12 items-center gap-1" aria-hidden>
        {bars.map((h, i) => (
          <motion.span key={i} className="w-1 rounded-full bg-gradient-to-t from-amy-600 to-amy-200" animate={{ height: `${h * 100}%` }} transition={{ duration: 0.08 }} />
        ))}
      </div>
      <h2 className="relative mt-6 text-2xl font-semibold tracking-tight">{state === 'denied' ? 'Amy can’t hear you' : state === 'asking' ? 'Connecting your microphone…' : 'Amy is listening'}</h2>
      <p className="relative mt-2 max-w-sm text-muted">
        {state === 'denied'
          ? 'Allow the microphone for this site in your browser, then call again.'
          : state === 'asking'
            ? 'Allow the microphone when your browser asks.'
            : 'Your microphone works. Amy answers out loud once the tutor is connected; this preview does not send your voice anywhere.'}
      </p>
      <motion.button whileTap={{ scale: 0.92 }} onClick={onEnd} aria-label="End call" className="relative mt-10 grid size-16 place-items-center rounded-full bg-[var(--notyet)] text-white shadow-[0_16px_40px_-12px_rgba(225,29,72,.7)]">
        <Icon icon={CallEnd01Icon} size={26} stroke={2} />
      </motion.button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* The chat bar, the same everywhere                                    */
/* ------------------------------------------------------------------ */

type SR = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onend: () => void; onerror: () => void };
const speech = (): (new () => SR) | undefined => (window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SR }).webkitSpeechRecognition;

export interface Attachment {
  name: string;
  url: string;
  image: boolean;
}

export function Composer({
  value,
  onChange,
  onSend,
  onStop,
  busy = false,
  placeholder = 'Ask Amy anything',
  onTyping,
  attachment,
  onAttach,
  big = false
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onStop?: () => void;
  busy?: boolean;
  placeholder?: string;
  onTyping?: (t: boolean) => void;
  attachment?: Attachment | null;
  onAttach?: (a: Attachment | null) => void;
  big?: boolean;
}) {
  const { alwaysDraw, set } = useChatSettings();
  const ta = useRef<HTMLTextAreaElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const rec = useRef<SR | null>(null);
  const [listening, setListening] = useState(false);
  const [call, setCall] = useState(false);
  const canListen = !!speech();

  useEffect(() => {
    const el = ta.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  }, [value]);
  useEffect(() => () => rec.current?.stop(), []);

  const key = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!busy) onSend();
    }
  };

  const dictate = () => {
    if (listening) return rec.current?.stop();
    const S = speech();
    if (!S) return;
    const r = new S();
    r.lang = navigator.language || 'en-IN';
    r.interimResults = true;
    r.continuous = false;
    const base = value ? `${value.trimEnd()} ` : '';
    r.onresult = e => onChange(base + Array.from(e.results).map(x => x[0].transcript).join(''));
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
  };

  const can = !busy && (!!value.trim() || !!attachment);

  return (
    <>
      <div className="rounded-2xl border hairline bg-[var(--card)] shadow-[0_10px_34px_-20px_rgba(0,0,0,.55)] transition-colors focus-within:border-amy-400/60">
        <AnimatePresence initial={false}>
          {attachment && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-3 pt-3">
              <div className="inline-flex max-w-full items-center gap-2 rounded-xl border hairline bg-[var(--bg-2)] p-1.5 pr-2">
                {attachment.image ? <img src={attachment.url} alt="" className="size-10 rounded-lg object-cover" /> : <span className="grid size-10 place-items-center rounded-lg bg-[var(--card-2)] text-muted"><Icon icon={File01Icon} size={18} /></span>}
                <span className="min-w-0 truncate text-sm">{attachment.name}</span>
                <button type="button" onClick={() => onAttach?.(null)} aria-label="Remove attachment" className="grid size-6 shrink-0 place-items-center rounded-full text-muted hover:bg-[var(--card-2)] hover:text-[var(--fg)]"><Icon icon={Cancel01Icon} size={13} /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <label htmlFor="amy-composer" className="sr-only">{placeholder}</label>
        <textarea
          id="amy-composer"
          ref={ta}
          rows={1}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={key}
          onFocus={() => onTyping?.(true)}
          onBlur={() => onTyping?.(false)}
          placeholder={listening ? 'Listening… speak now' : busy ? 'Amy is answering…' : placeholder}
          className={`block w-full resize-none bg-transparent px-4 pb-1 outline-none placeholder:text-[var(--muted)] ${big ? 'pt-4 text-[17px] leading-7' : 'pt-3.5 text-[16px] leading-6'}`}
        />
        <div className="flex items-center gap-0.5 px-2 pb-2">
          <Tool icon={PresentationBarChart02Icon} label={alwaysDraw ? 'Always draw is on' : 'Always draw: a diagram with every answer'} on={alwaysDraw} onClick={() => set({ alwaysDraw: !alwaysDraw })} />
          <Tool icon={Camera01Icon} label="Snap a question or add a PDF" onClick={() => file.current?.click()} disabled={!onAttach} />
          <Tool icon={Call02Icon} label="Live voice call with Amy" onClick={() => setCall(true)} />
          <Tool icon={Mic01Icon} label={canListen ? (listening ? 'Stop listening' : 'Speak your question') : 'Voice typing is not supported in this browser'} on={listening} pulse={listening} disabled={!canListen} onClick={dictate} />
          <AnimatePresence mode="wait" initial={false}>
            {busy && onStop ? (
              <motion.button key="stop" type="button" onClick={onStop} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }} className="ml-auto grid size-9 place-items-center rounded-full bg-[var(--invert)] text-[var(--on-invert)]" aria-label="Stop and show the whole answer">
                <span className="size-3 rounded-[3px] bg-current" />
              </motion.button>
            ) : (
              <motion.button key="send" type="button" onClick={onSend} disabled={!can} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.6, opacity: 0 }} transition={{ duration: 0.15 }} className={`ml-auto grid size-9 place-items-center rounded-full transition-colors ${can ? 'bg-gradient-to-br from-amy-300 to-amy-600 text-[#2a1406] shadow-[0_6px_16px_-6px_rgba(255,107,61,.8)]' : 'bg-[var(--card-2)] text-muted'}`} aria-label="Send">
                <Icon icon={ArrowUp02Icon} size={18} stroke={2.2} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <input
          ref={file}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          className="hidden"
          onChange={e => {
            const f = e.target.files?.[0];
            if (f) onAttach?.({ name: f.name, url: URL.createObjectURL(f), image: f.type.startsWith('image/') });
            e.target.value = '';
          }}
        />
      </div>
      <AnimatePresence>{call && <VoiceCall onEnd={() => setCall(false)} />}</AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Slides: Amy's reply, one idea at a time, big and easy to read        */
/* ------------------------------------------------------------------ */

export function SlidesToggle() {
  const { slides, set } = useChatSettings();
  return (
    <motion.button type="button" whileTap={{ scale: 0.95 }} onClick={() => set({ slides: !slides })} aria-pressed={slides} className={`inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors ${slides ? 'border-amy-400 bg-amy-400/15 text-[var(--fg)]' : 'hairline bg-[var(--card)] text-muted hover:text-[var(--fg)]'}`}>
      <Icon icon={SlideIcon} size={16} className={slides ? 'text-amy-500' : ''} />
      {slides ? 'Slides on' : 'Read as slides'}
    </motion.button>
  );
}

/** Shows one item at a time with big text, Back and Next, dots and the arrow keys. */
export function SlideDeck({ slides, deckKey }: { slides: { key: string; node: ReactNode }[]; deckKey: string | number }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  useEffect(() => {
    setI(0);
  }, [deckKey]);
  const n = slides.length;
  const at = Math.min(i, n - 1);
  const go = (d: number) => {
    setDir(d);
    setI(v => Math.min(n - 1, Math.max(0, v + d)));
  };
  useEffect(() => {
    const k = (e: globalThis.KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'TEXTAREA' || (e.target as HTMLElement)?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });
  if (!n) return null;
  return (
    <div className="flex flex-col">
      <div className="relative min-h-[300px] overflow-hidden rounded-3xl border hairline bg-[var(--card)] [perspective:1200px] sm:min-h-[340px]">
        <div aria-hidden className="absolute -right-24 -top-24 size-64 rounded-full glow-amy opacity-50" />
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={slides[at].key} custom={dir} initial={{ opacity: 0, x: 50 * dir, rotateY: 6 * dir }} animate={{ opacity: 1, x: 0, rotateY: 0 }} exit={{ opacity: 0, x: -50 * dir, rotateY: -6 * dir }} transition={{ duration: 0.38, ease: EASE }} className="relative flex min-h-[300px] flex-col justify-center p-6 text-[20px] leading-[1.6] sm:min-h-[340px] sm:p-10 sm:text-[24px]">
            {slides[at].node}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <button onClick={() => go(-1)} disabled={at === 0} className="inline-flex h-11 items-center gap-1.5 rounded-full border hairline px-4 text-[15px] font-medium transition-colors disabled:opacity-30 hover:bg-[var(--card-2)]">
          <Icon icon={ArrowLeft01Icon} size={17} /> Back
        </button>
        <div className="flex items-center gap-1.5" aria-label={`Slide ${at + 1} of ${n}`}>
          {slides.map((s, k) => (
            <button key={s.key} onClick={() => { setDir(k > at ? 1 : -1); setI(k); }} aria-label={`Slide ${k + 1}`} className={`h-2 rounded-full transition-all ${k === at ? 'w-7 bg-amy-500' : k < at ? 'w-2 bg-amy-400/50' : 'w-2 bg-[var(--line-2)]'}`} />
          ))}
        </div>
        <button onClick={() => go(1)} disabled={at === n - 1} className="inline-flex h-11 items-center gap-1.5 rounded-full bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 px-5 text-[15px] font-semibold text-[#2a1406] transition-opacity disabled:opacity-30">
          Next <Icon icon={ArrowRight01Icon} size={17} />
        </button>
      </div>
    </div>
  );
}

/** Splits text into slide-sized pieces: about two sentences each. */
export function chunk(paragraphs: string[]): string[] {
  const out: string[] = [];
  for (const p of paragraphs) {
    const sentences = p.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g)?.map(s => s.trim()).filter(Boolean) ?? [p];
    for (let i = 0; i < sentences.length; i += 2) out.push(sentences.slice(i, i + 2).join(' '));
  }
  return out;
}
