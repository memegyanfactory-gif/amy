import { useMemo, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft02Icon, ArrowRight02Icon, Calendar03Icon, Delete02Icon, FileUploadIcon, PlusSignIcon, Tick02Icon } from '@hugeicons/core-free-icons';
import { Icon } from '../ui';
import { useRegion } from '../../region';
import { daysBetween, fromIso, iso, KINDS, longDate, monthGrid, monthName, parseIcs, relative, shortDate, useCalendar, useToday, type Item, type Kind } from '../../store';

const EASE = [0.23, 1, 0.32, 1] as const;

export const KIND_STYLE: Record<Kind, { dot: string; label: string }> = {
  exam: { dot: 'var(--notyet)', label: 'Exam' },
  study: { dot: '#ff8a3d', label: 'Study' },
  todo: { dot: 'var(--fg)', label: 'To-do' },
  event: { dot: 'var(--muted)', label: 'Event' }
};

const fmtTime = (t?: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
};

/* ------------------------------------------------------------------ */
/* Reading a pasted timetable                                           */
/* ------------------------------------------------------------------ */

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MON = '(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\\.?';
const isExam = (t: string) => /\b(exam|test|paper|quiz|assessment|viva|boards?|olympiad|neet|sat|act|jamb|waec|mock)\b/i.test(t);
const isStudy = (t: string) => /\b(revise|revision|study|practi[cs]e|homework|read|chapter|lesson|assignment|project)\b/i.test(t);

/**
 * One line per thing, with a date somewhere in it. Understands 2026-12-15, 15/12, 15.12.2026,
 * "15 Dec", "December 15th", and a time like 9:30 or 4 pm. `monthFirst` reads 12/15 as 15 December.
 */
export function parseText(text: string, today: string, monthFirst: boolean): Omit<Item, 'id'>[] {
  const out: Omit<Item, 'id'>[] = [];
  const thisYear = fromIso(today).getFullYear();
  for (const raw of text.split(/\n|;/)) {
    let line = raw.trim();
    if (!line) continue;
    let y: number | undefined, mo: number, d: number, m: RegExpMatchArray | null;
    if ((m = line.match(/\b(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})\b/))) [y, mo, d] = [+m[1], +m[2], +m[3]];
    else if ((m = line.match(/\b(\d{1,2})[/.-](\d{1,2})(?:[/.-](\d{2,4}))?\b/))) {
      [mo, d] = monthFirst ? [+m[1], +m[2]] : [+m[2], +m[1]];
      if (m[3]) y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    } else if ((m = line.match(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+${MON}(?:,?\\s+(\\d{4}))?`, 'i')))) {
      d = +m[1];
      mo = MONTHS.indexOf(m[2].slice(0, 3).toLowerCase()) + 1;
      if (m[3]) y = +m[3];
    } else if ((m = line.match(new RegExp(`\\b${MON}\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s+(\\d{4}))?`, 'i')))) {
      mo = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase()) + 1;
      d = +m[2];
      if (m[3]) y = +m[3];
    } else continue;

    if (mo < 1 || mo > 12 || d < 1 || d > 31) continue;
    let year = y ?? thisYear;
    let date = new Date(year, mo - 1, d);
    if (date.getMonth() !== mo - 1) continue; // 31 June and the like
    // No year written: a date long past means next year.
    if (y === undefined && daysBetween(today, iso(date)) < -60) {
      year += 1;
      date = new Date(year, mo - 1, d);
    }
    line = line.replace(m[0], ' ');

    let time: string | undefined;
    const t = line.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i) ?? line.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
    if (t) {
      let h = +t[1];
      const ap = t[3]?.toLowerCase();
      if (ap === 'pm' && h < 12) h += 12;
      if (ap === 'am' && h === 12) h = 0;
      if (h < 24) time = `${String(h).padStart(2, '0')}:${t[2] ?? '00'}`;
      line = line.replace(t[0], ' ');
    }

    const title =
      line
        .replace(/\b(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)(day)?\b\.?/gi, ' ')
        .replace(/^[\s,:;|–—\-.]+|[\s,:;|–—\-.]+$/g, '')
        .replace(/\s{2,}/g, ' ') || 'Untitled';
    out.push({ date: iso(date), time, title, kind: isExam(title) ? 'exam' : isStudy(title) ? 'study' : 'todo' });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Pieces                                                               */
/* ------------------------------------------------------------------ */

function KindDot({ kind }: { kind: Kind }) {
  return <span className="inline-block size-2 shrink-0 rounded-full" style={{ background: KIND_STYLE[kind].dot }} />;
}

/** One thing on the calendar: tick it off, see its kind and time, delete it. */
export function ItemRow({ item, showDate = false, today }: { item: Item; showDate?: boolean; today: string }) {
  const { update, remove } = useCalendar();
  const checkable = item.kind !== 'exam' && item.kind !== 'event';
  return (
    <motion.li layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -12, transition: { duration: 0.15 } }} className="group flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[var(--card-2)] transition-colors">
      {checkable ? (
        <button onClick={() => update(item.id, { done: !item.done })} aria-label={item.done ? `Mark "${item.title}" not done` : `Mark "${item.title}" done`} className={`grid size-[22px] shrink-0 place-items-center rounded-[7px] border-2 transition-colors ${item.done ? 'border-amy-500 bg-amy-500 text-[#2a1406]' : 'border-[var(--line-2)] hover:border-amy-400'}`}>
          <AnimatePresence>{item.done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Icon icon={Tick02Icon} size={14} stroke={3} /></motion.span>}</AnimatePresence>
        </button>
      ) : (
        <span className="grid size-[22px] shrink-0 place-items-center"><KindDot kind={item.kind} /></span>
      )}
      <span className="min-w-0 flex-1">
        <span className={`block truncate text-[15px] transition-colors ${item.done ? 'text-muted line-through' : ''}`}>{item.title}</span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <KindDot kind={item.kind} /> {KIND_STYLE[item.kind].label}
          {item.time && <> · {fmtTime(item.time)}</>}
          {showDate && <> · {shortDate(item.date)}, {relative(today, item.date)}</>}
        </span>
      </span>
      <button onClick={() => remove(item.id)} aria-label={`Delete "${item.title}"`} className="grid size-8 shrink-0 place-items-center rounded-lg text-muted opacity-60 hover:bg-[var(--card)] hover:text-[var(--notyet)] hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100 transition">
        <Icon icon={Delete02Icon} size={16} />
      </button>
    </motion.li>
  );
}

/** Add one thing. With `fixedDate` it adds to that day; otherwise it asks for the date. */
export function AddForm({ date, fixedDate = false, defaultKind = 'todo', onAdded }: { date: string; fixedDate?: boolean; defaultKind?: Kind; onAdded?: () => void }) {
  const { add } = useCalendar();
  const [title, setTitle] = useState('');
  const [day, setDay] = useState(date);
  const [time, setTime] = useState('');
  const [kind, setKind] = useState<Kind>(defaultKind);
  const when = fixedDate ? date : day;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !when) return;
    add({ date: when, title: title.trim(), kind, time: time || undefined });
    setTitle('');
    setTime('');
    onAdded?.();
  };
  const field = 'h-10 rounded-lg border hairline bg-[var(--bg)] px-3 text-sm outline-none focus:border-amy-400/70 transition-colors';
  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={`add-${defaultKind}-${fixedDate}`}>What is it?</label>
        <input id={`add-${defaultKind}-${fixedDate}`} value={title} onChange={e => setTitle(e.target.value)} placeholder={kind === 'exam' ? 'e.g. Maths unit test, chapters 3 to 5' : 'e.g. Revise chemical bonding'} className={`${field} min-w-0 flex-1`} autoComplete="off" />
        <button disabled={!title.trim()} className="grid size-10 shrink-0 place-items-center rounded-lg bg-[var(--invert)] text-[var(--on-invert)] transition-opacity disabled:opacity-35" aria-label="Add">
          <Icon icon={PlusSignIcon} size={18} />
        </button>
      </div>
      <AnimatePresence initial={false}>
      {(!fixedDate || title.trim()) && (
      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="flex flex-wrap gap-2 overflow-hidden">
        {!fixedDate && (
          <label className="flex items-center gap-1.5 text-sm text-muted">
            <span className="sr-only">Date</span>
            <input type="date" value={day} onChange={e => setDay(e.target.value)} className={field} required />
          </label>
        )}
        <label className="flex items-center text-sm text-muted">
          <span className="sr-only">Time (optional)</span>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className={`${field} w-[118px]`} aria-label="Time, optional" />
        </label>
        <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Kind">
          {KINDS.map(k => (
            <button key={k.id} type="button" role="radio" aria-checked={kind === k.id} onClick={() => setKind(k.id)} className={`inline-flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm transition-colors ${kind === k.id ? 'border-[var(--fg)] bg-[var(--card-2)]' : 'hairline text-muted hover:text-[var(--fg)]'}`}>
              <KindDot kind={k.id} /> {k.label}
            </button>
          ))}
        </div>
      </motion.div>
      )}
      </AnimatePresence>
    </form>
  );
}

/** Bring a whole calendar in: a calendar file, or pasted text. Shows what it found before adding it. */
export function ImportCalendar({ onDone }: { onDone?: () => void }) {
  const { region } = useRegion();
  const today = useToday();
  const { items, addMany } = useCalendar();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [found, setFound] = useState<Omit<Item, 'id'>[] | null>(null);
  const [note, setNote] = useState('');
  const [drag, setDrag] = useState(false);

  const fresh = (list: Omit<Item, 'id'>[]) => list.filter(n => !items.some(i => i.date === n.date && i.title.toLowerCase() === n.title.toLowerCase()));
  const show = (list: Omit<Item, 'id'>[], from: string) => {
    const kept = fresh(list).sort((a, b) => a.date.localeCompare(b.date));
    setFound(kept);
    setNote(kept.length ? '' : list.length ? `Everything in ${from} is already in your calendar.` : `No dates found in ${from}. Each line needs a date, such as "15 Dec Maths test".`);
  };

  const readFile = async (f: File) => {
    if (/^image\/|pdf$/i.test(f.type) || /\.(png|jpe?g|webp|heic|pdf)$/i.test(f.name)) {
      setFound(null);
      setNote('Photos and PDFs need Amy’s AI tutor to read them, which this preview does not have yet. Export your calendar as a .ics file, or paste its text below.');
      return;
    }
    const body = await f.text();
    show(/BEGIN:VCALENDAR/.test(body) ? parseIcs(body) : parseText(body, today, region.code === 'US'), f.name);
  };

  const months = found ? [...new Set(found.map(i => i.date.slice(0, 7)))] : [];

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files[0];
          if (f) void readFile(f);
        }}
        className={`flex items-center gap-4 rounded-xl border-2 border-dashed p-4 text-left transition-colors ${drag ? 'border-amy-400 bg-amy-400/10' : 'border-[var(--line-2)] hover:border-amy-400 hover:bg-[var(--card-2)]'}`}
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-amy-400/15 text-amy-500">
          <Icon icon={FileUploadIcon} size={22} />
        </span>
        <span>
          <span className="block font-medium">Upload a calendar file</span>
          <span className="block text-sm text-muted">A .ics file from Google Calendar, Outlook, Apple Calendar or your school. Drop it here or choose it.</span>
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".ics,.txt,.csv,text/calendar,text/plain,text/csv,image/*,application/pdf"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) void readFile(f);
          e.target.value = '';
        }}
      />

      <div className="rounded-xl border hairline p-3">
        <label htmlFor="paste-cal" className="text-sm font-medium">
          Or paste your timetable or date sheet
        </label>
        <textarea
          id="paste-cal"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
          placeholder={region.code === 'US' ? '12/15 Math unit test 9 am\n12/18 Science project due\nDecember 20 Book report' : '15 Dec Maths unit test 9 am\n18/12 Science project due\n20 December Revise chapter 4'}
          className="mt-2 w-full resize-y rounded-lg border hairline bg-[var(--bg)] p-3 text-sm leading-relaxed outline-none focus:border-amy-400/70"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-muted">One line per date. {region.code === 'US' ? 'Numbers are read month first (12/15).' : 'Numbers are read day first (15/12).'}</span>
          <button type="button" disabled={!text.trim()} onClick={() => show(parseText(text, today, region.code === 'US'), 'that text')} className="btn btn-ghost !min-h-9 shrink-0 text-sm disabled:opacity-40">
            Read it
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {note && (
          <motion.p key={note} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-lg bg-[var(--card-2)] px-3 py-2.5 text-sm text-fg2">
            {note}
          </motion.p>
        )}
        {found && found.length > 0 && (
          <motion.div key="found" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-xl border border-amy-400/50 bg-amy-400/5 p-3">
            <div className="text-sm font-medium">
              Found {found.length} {found.length === 1 ? 'date' : 'dates'} in {months.map(k => monthName(+k.slice(0, 4), +k.slice(5) - 1)).join(', ')}
            </div>
            <ul className="mt-2 max-h-56 overflow-y-auto">
              {found.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 border-t hairline py-2 text-sm first:border-t-0">
                  <KindDot kind={f.kind} />
                  <span className="w-[92px] shrink-0 text-muted tabular-nums">{shortDate(f.date)}</span>
                  <span className="min-w-0 flex-1 truncate">{f.title}</span>
                  {f.time && <span className="shrink-0 text-muted">{fmtTime(f.time)}</span>}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  addMany(found);
                  setNote(`Added ${found.length} ${found.length === 1 ? 'date' : 'dates'} to your calendar.`);
                  setFound(null);
                  setText('');
                  onDone?.();
                }}
                className="btn !min-h-10 font-semibold text-[#2a1406] bg-gradient-to-br from-amy-200 via-amy-400 to-amy-500 hover:brightness-105"
              >
                Add {found.length} to my calendar
              </button>
              <button type="button" onClick={() => setFound(null)} className="btn btn-ghost !min-h-10">
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Month end: ask for next month's calendar                              */
/* ------------------------------------------------------------------ */

const seenKey = (ym: string) => `amy-month-asked-${ym}`;

/** In the last 3 days of a month, if next month is still empty, ask for its calendar once. */
export function MonthEndPrompt({ onPlan }: { onPlan: () => void }) {
  const today = useToday();
  const { items } = useCalendar();
  const t = fromIso(today);
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  const next = new Date(t.getFullYear(), t.getMonth() + 1, 1);
  const ym = iso(next).slice(0, 7);
  const [hidden, setHidden] = useState(() => {
    try {
      return localStorage.getItem(seenKey(ym)) === '1';
    } catch {
      return false;
    }
  });
  const empty = !items.some(i => i.date.startsWith(ym));
  if (last - t.getDate() > 3 || !empty || hidden) return null;
  const dismiss = () => {
    try {
      localStorage.setItem(seenKey(ym), '1');
    } catch {
      /* storage blocked */
    }
    setHidden(true);
  };
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 rounded-2xl border border-amy-400/50 bg-amy-400/10 p-4 sm:flex-row sm:items-center">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amy-400/20 text-amy-500">
        <Icon icon={Calendar03Icon} size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{monthName(next.getFullYear(), next.getMonth())} starts {relative(today, iso(next))}</div>
        <div className="text-sm text-muted">Add next month’s calendar or test dates, and Amy will plan your days around them.</div>
      </div>
      <div className="flex gap-2">
        <button onClick={onPlan} className="btn btn-primary !min-h-10 text-sm">Add next month</button>
        <button onClick={dismiss} className="btn btn-ghost !min-h-10 text-sm">Not now</button>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* For Home: today's list and the next exam                              */
/* ------------------------------------------------------------------ */

export function TodayPlan({ onOpenCalendar }: { onOpenCalendar: () => void }) {
  const today = useToday();
  const { on, after } = useCalendar();
  const list = on(today);
  const left = list.filter(i => !i.done && i.kind !== 'exam' && i.kind !== 'event').length;
  const soon = after(today).slice(0, 2);
  return (
    <div className="card flex min-w-0 flex-col p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-medium">Today’s plan</h2>
        <span className="text-sm text-muted">{longDate(today)}</span>
      </div>
      {list.length > 0 ? (
        <p className="mt-1 text-sm text-muted">{left === 0 ? 'All done for today. Nice work.' : `${left} still to do.`}</p>
      ) : (
        <p className="mt-1 text-sm text-muted">Nothing planned for today yet. Add what you want to get done.</p>
      )}
      <ul className="mt-3 -mx-2">
        <AnimatePresence initial={false}>
          {list.map(i => (
            <ItemRow key={i.id} item={i} today={today} />
          ))}
        </AnimatePresence>
      </ul>
      <div className="mt-3">
        <AddForm date={today} fixedDate />
      </div>
      {soon.length > 0 && (
        <div className="mt-5 border-t hairline pt-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted">Coming up</div>
          <ul className="mt-1 -mx-2">
            {soon.map(i => (
              <ItemRow key={i.id} item={i} today={today} showDate />
            ))}
          </ul>
        </div>
      )}
      <button onClick={onOpenCalendar} className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-medium hover:text-amy-500 transition-colors">
        Open calendar <Icon icon={ArrowRight02Icon} size={15} />
      </button>
    </div>
  );
}

/** The next exam on the calendar, or a way to add one. */
export function useNextExam() {
  const today = useToday();
  const { items } = useCalendar();
  return useMemo(() => items.filter(i => i.kind === 'exam' && i.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0], [items, today]);
}

/* ------------------------------------------------------------------ */
/* The calendar page                                                    */
/* ------------------------------------------------------------------ */

export function CalendarView() {
  const today = useToday();
  const { items, on, after } = useCalendar();
  const [sel, setSel] = useState(today);
  const [cursor, setCursor] = useState(() => {
    const t = fromIso(today);
    return { y: t.getFullYear(), m: t.getMonth() };
  });
  const [importing, setImporting] = useState(false);
  const weeks = monthGrid(cursor.y, cursor.m);
  const dayNames = weeks[0].map(d => fromIso(d).toLocaleDateString(undefined, { weekday: 'short' }));
  const byDate = useMemo(() => {
    const m = new Map<string, Item[]>();
    for (const i of items) m.set(i.date, [...(m.get(i.date) ?? []), i]);
    return m;
  }, [items]);
  const move = (n: number) => setCursor(c => {
    const d = new Date(c.y, c.m + n, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const goToday = () => {
    const t = fromIso(today);
    setCursor({ y: t.getFullYear(), m: t.getMonth() });
    setSel(today);
  };
  const dayItems = on(sel);
  const upcoming = after(today).slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
            Your <span className="serif">calendar</span>
          </motion.h1>
          <p className="mt-1 text-muted">Exams, study plans and to-dos. Amy plans your days around them.</p>
        </div>
        <button onClick={() => setImporting(v => !v)} className="btn btn-ghost">
          <Icon icon={FileUploadIcon} size={17} /> {importing ? 'Close import' : 'Import a calendar'}
        </button>
      </div>

      <div className="mt-6">
        <MonthEndPrompt onPlan={() => setImporting(true)} />
      </div>

      <AnimatePresence>
        {importing && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <div className="card mt-4 p-4 sm:p-5">
              <ImportCalendar onDone={() => setImporting(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* month */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <h2 className="mr-auto text-xl font-semibold tracking-tight">{monthName(cursor.y, cursor.m)}</h2>
            <button onClick={goToday} className="h-9 rounded-lg border hairline px-3 text-sm hover:bg-[var(--card-2)] transition-colors">Today</button>
            <button onClick={() => move(-1)} aria-label="Previous month" className="grid size-9 place-items-center rounded-lg border hairline hover:bg-[var(--card-2)] transition-colors"><Icon icon={ArrowLeft02Icon} size={17} /></button>
            <button onClick={() => move(1)} aria-label="Next month" className="grid size-9 place-items-center rounded-lg border hairline hover:bg-[var(--card-2)] transition-colors"><Icon icon={ArrowRight02Icon} size={17} /></button>
          </div>
          <div className="mt-4 grid grid-cols-7 text-center text-xs text-muted">
            {dayNames.map(n => (
              <div key={n} className="pb-2">{n}</div>
            ))}
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${cursor.y}-${cursor.m}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="grid grid-cols-7 gap-1">
              {weeks.flat().map(d => {
                const inMonth = fromIso(d).getMonth() === cursor.m;
                const isToday = d === today;
                const isSel = d === sel;
                const list = byDate.get(d) ?? [];
                return (
                  <button
                    key={d}
                    onClick={() => setSel(d)}
                    aria-label={`${longDate(d)}${list.length ? `, ${list.length} planned` : ''}`}
                    aria-pressed={isSel}
                    className={`relative flex aspect-square flex-col items-center justify-start gap-1 rounded-xl pt-1.5 text-sm transition-colors sm:pt-2 ${isSel ? 'bg-[var(--invert)] text-[var(--on-invert)]' : 'hover:bg-[var(--card-2)]'} ${inMonth ? '' : 'opacity-35'}`}
                  >
                    <span className={`grid size-7 place-items-center rounded-full tabular-nums ${isToday && !isSel ? 'ring-2 ring-amy-500 font-semibold' : ''}`}>{fromIso(d).getDate()}</span>
                    <span className="flex gap-0.5">
                      {list.slice(0, 3).map(i => (
                        <span key={i.id} className="size-1.5 rounded-full" style={{ background: isSel && i.kind === 'todo' ? 'var(--on-invert)' : KIND_STYLE[i.kind].dot }} />
                      ))}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            {KINDS.map(k => (
              <span key={k.id} className="inline-flex items-center gap-1.5"><KindDot kind={k.id} /> {k.label}</span>
            ))}
          </div>
        </div>

        {/* the chosen day */}
        <div className="flex flex-col gap-4">
          <div className="card p-4 sm:p-6">
            <div className="text-sm text-muted first-letter:uppercase">{relative(today, sel)}</div>
            <h2 className="text-xl font-semibold tracking-tight">{longDate(sel)}</h2>
            <ul className="mt-3 -mx-2">
              <AnimatePresence initial={false}>
                {dayItems.map(i => (
                  <ItemRow key={i.id} item={i} today={today} />
                ))}
              </AnimatePresence>
            </ul>
            {dayItems.length === 0 && <p className="mb-3 text-sm text-muted">Nothing on this day.</p>}
            <AddForm key={sel} date={sel} fixedDate />
          </div>

          <div className="card p-4 sm:p-6">
            <h2 className="font-medium">Coming up</h2>
            {upcoming.length ? (
              <ul className="mt-2 -mx-2">
                {upcoming.map(i => (
                  <ItemRow key={i.id} item={i} today={today} showDate />
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-muted">Nothing after today yet.</p>
            )}
          </div>
        </div>
      </div>
      <p className="mt-6 pb-4 text-xs text-muted">Your calendar is saved in this browser.</p>
    </div>
  );
}
