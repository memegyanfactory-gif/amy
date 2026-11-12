import { useEffect, useState, useSyncExternalStore } from 'react';

/**
 * What the student told Amy about themselves, and their calendar.
 * Both live in this browser only (localStorage). Nothing is sent anywhere.
 */

/* ---------------- a tiny saved store ---------------- */

function createStore<T>(key: string, initial: T) {
  let value: T = initial;
  try {
    const raw = localStorage.getItem(key);
    if (raw) value = { ...initial, ...JSON.parse(raw) };
  } catch {
    /* storage blocked or old data: start fresh */
  }
  const subs = new Set<() => void>();
  return {
    get: () => value,
    set(next: T | ((v: T) => T)) {
      value = typeof next === 'function' ? (next as (v: T) => T)(value) : next;
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage blocked: keep it for this visit */
      }
      subs.forEach(f => f());
    },
    subscribe(f: () => void) {
      subs.add(f);
      return () => {
        subs.delete(f);
      };
    }
  };
}

/* ---------------- profile ---------------- */

export type Plan = 'free' | 'plus';
export interface Profile {
  onboarded: boolean;
  name: string;
  age: string;
  /** One of the four stages of the student's country, such as "Class 6 to 8". */
  stage: string;
  /** Their exact class, in their own words. */
  klass: string;
  subjects: string[];
  goal: string;
  hobbies: string;
  interests: string[];
  plan: Plan;
}

const profileStore = createStore<Profile>('amy-profile', { onboarded: false, name: '', age: '', stage: '', klass: '', subjects: [], goal: '', hobbies: '', interests: [], plan: 'free' });

try {
  const plan = new URLSearchParams(location.hash.split('?')[1] ?? location.search).get('plan');
  if (plan === 'plus' || plan === 'free') profileStore.set(p => ({ ...p, plan }));
} catch {
  /* no address to read */
}

export function useProfile() {
  const profile = useSyncExternalStore(profileStore.subscribe, profileStore.get);
  return { profile, setProfile: (patch: Partial<Profile>) => profileStore.set(p => ({ ...p, ...patch })) };
}

/* ---------------- dates: always the student's local day ---------------- */

const pad = (n: number) => String(n).padStart(2, '0');
/** A local date as YYYY-MM-DD. Never goes through UTC, so it cannot slip a day. */
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (s: string, n: number) => {
  const d = fromIso(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};
/** Whole days from a to b. Positive when b is later. */
export const daysBetween = (a: string, b: string) => Math.round((fromIso(b).getTime() - fromIso(a).getTime()) / 86_400_000);

export const longDate = (s: string) => fromIso(s).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
export const shortDate = (s: string) => fromIso(s).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
export const monthName = (y: number, m: number) => new Date(y, m, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

/** "today", "tomorrow", "in 5 days", "yesterday", "3 days ago". */
export function relative(from: string, to: string) {
  const n = daysBetween(from, to);
  if (n === 0) return 'today';
  if (n === 1) return 'tomorrow';
  if (n === -1) return 'yesterday';
  return n > 0 ? `in ${n} days` : `${-n} days ago`;
}

/** Today's date, kept right if the page stays open past midnight. */
export function useToday() {
  const [today, setToday] = useState(() => iso(new Date()));
  useEffect(() => {
    const t = setInterval(() => {
      const now = iso(new Date());
      setToday(prev => (prev === now ? prev : now));
    }, 30_000);
    return () => clearInterval(t);
  }, []);
  return today;
}

/** The weeks of a month, Monday first. Each cell is a date string; days outside the month are included. */
export function monthGrid(year: number, month: number): string[][] {
  const first = new Date(year, month, 1);
  const lead = (first.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - lead);
  const weeks: string[][] = [];
  for (let w = 0; w < 6; w++) {
    const row: string[] = [];
    for (let d = 0; d < 7; d++) row.push(iso(new Date(start.getFullYear(), start.getMonth(), start.getDate() + w * 7 + d)));
    if (w >= 4 && fromIso(row[0]).getMonth() !== month) break;
    weeks.push(row);
  }
  return weeks;
}

/* ---------------- calendar ---------------- */

export type Kind = 'exam' | 'study' | 'todo' | 'event';
export const KINDS: { id: Kind; label: string }[] = [
  { id: 'todo', label: 'To-do' },
  { id: 'exam', label: 'Exam or test' },
  { id: 'study', label: 'Study plan' },
  { id: 'event', label: 'Other' }
];

export interface Item {
  id: string;
  date: string;
  title: string;
  kind: Kind;
  /** HH:MM, optional. */
  time?: string;
  done?: boolean;
}

const calendarStore = createStore<{ items: Item[] }>('amy-calendar', { items: [] });
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
const byTime = (a: Item, b: Item) => (a.date + (a.time ?? '99')).localeCompare(b.date + (b.time ?? '99'));

export function useCalendar() {
  const { items } = useSyncExternalStore(calendarStore.subscribe, calendarStore.get);
  return {
    items,
    on: (date: string) => items.filter(i => i.date === date).sort(byTime),
    /** Items after `date`, soonest first. */
    after: (date: string) => items.filter(i => i.date > date).sort(byTime),
    add: (item: Omit<Item, 'id'>) => calendarStore.set(s => ({ items: [...s.items, { ...item, id: uid() }] })),
    addMany: (list: Omit<Item, 'id'>[]) => calendarStore.set(s => ({ items: [...s.items, ...list.map(i => ({ ...i, id: uid() }))] })),
    update: (id: string, patch: Partial<Item>) => calendarStore.set(s => ({ items: s.items.map(i => (i.id === id ? { ...i, ...patch } : i)) })),
    remove: (id: string) => calendarStore.set(s => ({ items: s.items.filter(i => i.id !== id) }))
  };
}

/* ---------------- reading a calendar file (.ics) ---------------- */

const looksLikeExam = (t: string) => /\b(exam|test|paper|quiz|assessment|viva|boards?|olympiad|neet|sat|act|jamb|waec)\b/i.test(t);

/**
 * Read an iCalendar (.ics) file, the format Google Calendar, Outlook, Apple Calendar and most
 * school systems export. Returns one item per event, on the student's local date.
 */
export function parseIcs(text: string): Omit<Item, 'id'>[] {
  const lines = text.replace(/\r\n?/g, '\n').replace(/\n[ \t]/g, '').split('\n');
  const out: Omit<Item, 'id'>[] = [];
  let cur: { start?: string; summary?: string } | null = null;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') cur = {};
    else if (line === 'END:VEVENT') {
      if (cur?.start && cur.summary) {
        const m = cur.start.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/);
        if (m) {
          const [, y, mo, d, hh, mm, , z] = m;
          let date = `${y}-${mo}-${d}`;
          let time: string | undefined;
          if (hh) {
            if (z) {
              const local = new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mm));
              date = iso(local);
              time = `${pad(local.getHours())}:${pad(local.getMinutes())}`;
            } else time = `${hh}:${mm}`;
          }
          const title = cur.summary.replace(/\\([,;])/g, '$1').replace(/\\n/gi, ' ').trim();
          out.push({ date, time, title, kind: looksLikeExam(title) ? 'exam' : 'event' });
        }
      }
      cur = null;
    } else if (cur) {
      const i = line.indexOf(':');
      if (i < 0) continue;
      const name = line.slice(0, i).split(';')[0].toUpperCase();
      if (name === 'DTSTART') cur.start = line.slice(i + 1).trim();
      else if (name === 'SUMMARY') cur.summary = line.slice(i + 1);
    }
  }
  return out;
}

/* ---------------- lesson progress ---------------- */

/** Concepts passed in each course, counted from the start. Overrides the sample numbers once a quiz is passed. */
const progressStore = createStore<{ done: Record<string, number> }>('amy-progress', { done: {} });

export function useProgress() {
  const { done } = useSyncExternalStore(progressStore.subscribe, progressStore.get);
  return {
    doneIn: (course: string, fallback = 0) => done[course] ?? fallback,
    /** Mark the concept at `index` passed. Only moves forward. */
    pass: (course: string, index: number, fallback = 0) => progressStore.set(s => ({ done: { ...s.done, [course]: Math.max(s.done[course] ?? fallback, index + 1) } }))
  };
}
