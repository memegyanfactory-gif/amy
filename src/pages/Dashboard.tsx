import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight02Icon, BookOpen02Icon, Calendar03Icon, CrownIcon, Edit02Icon, Home01Icon, Message01Icon, Settings02Icon, Target02Icon } from '@hugeicons/core-free-icons';
import { Icon, Logo, ThemeToggle } from '../components/ui';
import Home from '../components/dash/Home';
import Chat from '../components/dash/Chat';
import { Practice, Me } from '../components/dash/Other';
import { Courses } from '../components/dash/Courses';
import { CalendarView } from '../components/dash/Planner';
import Onboarding from '../components/dash/Onboarding';
import { useRegion } from '../region';
import { useProfile } from '../store';
import { query } from '../router';

export type View = 'home' | 'chat' | 'courses' | 'calendar' | 'practice' | 'me';

const NAV: { id: View; label: string; icon: typeof Home01Icon }[] = [
  { id: 'home', label: 'Home', icon: Home01Icon },
  { id: 'chat', label: 'Ask Amy', icon: Message01Icon },
  { id: 'courses', label: 'Courses', icon: BookOpen02Icon },
  { id: 'calendar', label: 'Calendar', icon: Calendar03Icon },
  { id: 'practice', label: 'Games', icon: Target02Icon }
];

export const initial = (name: string) => (name.trim()[0] ?? 'A').toUpperCase();

/** The round picture in the top bar, and the menu it opens. */
function ProfileMenu({ onGo }: { onGo: (v: View) => void }) {
  const { profile, setProfile } = useProfile();
  const { region } = useRegion();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const plus = profile.plan === 'plus';

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('pointerdown', away);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', away);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  const pick = (v: View) => {
    setOpen(false);
    onGo(v);
  };
  const row = 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-[var(--card-2)] transition-colors';

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} aria-label="Your profile" aria-expanded={open} className={`relative grid size-10 place-items-center rounded-full bg-gradient-to-br from-amy-200 to-amy-600 text-[15px] font-semibold text-[#2a1406] ring-offset-2 ring-offset-[var(--bg)] transition ${open ? 'ring-2 ring-amy-400' : ''}`}>
        {initial(profile.name)}
        {plus && <span className="absolute -right-1 -top-1 grid size-[18px] place-items-center rounded-full bg-[var(--bg)] text-amy-500"><Icon icon={CrownIcon} size={12} stroke={2} /></span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }} transition={{ duration: 0.16 }} className="absolute right-0 top-12 z-50 w-[300px] origin-top-right overflow-hidden rounded-2xl border border-[var(--line-2)] bg-[var(--card)] shadow-[0_30px_70px_-20px_rgba(0,0,0,.5)]" role="menu">
            <div className="flex items-center gap-3 p-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amy-200 to-amy-600 text-lg font-semibold text-[#2a1406]">{initial(profile.name)}</span>
              <div className="min-w-0">
                <div className="truncate font-semibold">{profile.name || 'Student'}</div>
                <div className="truncate text-sm text-muted">{[profile.klass || profile.stage, region.name].filter(Boolean).join(' · ')}</div>
              </div>
            </div>

            <div className="mx-3 mb-2 rounded-xl p-3" style={{ background: plus ? 'linear-gradient(135deg, rgba(255,208,106,.22), rgba(255,107,61,.18))' : 'var(--card-2)' }}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted">Your plan</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${plus ? 'bg-amy-500 text-[#2a1406]' : 'bg-[var(--bg)] text-fg2'}`}>{plus ? 'Amy+' : 'Free'}</span>
              </div>
              <div className="mt-1 text-sm">{plus ? '225 voice minutes every 2 days, 5 new courses a week.' : '15 voice minutes every 2 days, 2 courses of your own.'}</div>
              <button onClick={() => pick('me')} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amy-600 dark:text-amy-200">
                {plus ? 'Manage plan' : 'Get Amy+'} <Icon icon={ArrowRight02Icon} size={14} />
              </button>
            </div>

            <div className="border-t hairline p-2">
              <button role="menuitem" onClick={() => pick('me')} className={row}><Icon icon={Settings02Icon} size={18} className="text-muted" /> Profile and settings</button>
              <button role="menuitem" onClick={() => pick('calendar')} className={row}><Icon icon={Calendar03Icon} size={18} className="text-muted" /> My calendar</button>
              <button role="menuitem" onClick={() => { setOpen(false); setProfile({ onboarded: false }); }} className={row}><Icon icon={Edit02Icon} size={18} className="text-muted" /> Change my answers</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Dashboard() {
  const initialAsk = query().get('ask') ?? '';
  const { profile } = useProfile();
  const [view, setView] = useState<View>(initialAsk ? 'chat' : 'home');
  const [ask, setAsk] = useState(initialAsk);

  useEffect(() => {
    if (initialAsk) history.replaceState(null, '', '#/app');
  }, [initialAsk]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view, profile.onboarded]);

  const openChat = (q = '') => {
    setAsk(q);
    setView('chat');
  };

  if (!profile.onboarded) return <Onboarding />;

  return (
    <div className="site min-h-dvh flex flex-col">
      {/* One top bar on every screen size. Phones also get a tab bar at the bottom. */}
      <header className="sticky top-0 z-40 border-b hairline bg-[var(--bg)]/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-[max(16px,env(safe-area-inset-left))] sm:px-6">
          <Logo />
          <nav className="hidden md:flex mx-auto items-center gap-1 rounded-lg border hairline p-1" aria-label="App">
            {NAV.map(n => {
              const on = view === n.id;
              return (
                <button key={n.id} onClick={() => setView(n.id)} aria-current={on ? 'page' : undefined} className={`relative rounded-lg px-4 py-2 text-sm transition-colors ${on ? 'text-[var(--on-invert)]' : 'text-muted hover:text-[var(--fg)]'}`}>
                  {on && <motion.span layoutId="top-pill" className="absolute inset-0 rounded-lg bg-[var(--invert)]" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                  <span className="relative">{n.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="ml-auto md:ml-0 flex items-center gap-2">
            <ThemeToggle />
            <ProfileMenu onGo={setView} />
          </div>
        </div>
      </header>

      <main className={`flex-1 min-w-0 ${view === 'chat' ? '' : 'pb-28 md:pb-16'}`}>
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
            {view === 'home' && <Home onAsk={openChat} onGo={setView} />}
            {view === 'chat' && <Chat initial={ask} />}
            {view === 'courses' && <Courses />}
            {view === 'calendar' && <CalendarView />}
            {view === 'practice' && <Practice />}
            {view === 'me' && <Me />}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t hairline bg-[var(--bg)]/90 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]" aria-label="App">
        <div className="grid grid-cols-5 px-[max(8px,env(safe-area-inset-left))]">
          {NAV.map(n => {
            const on = view === n.id;
            return (
              <button key={n.id} onClick={() => setView(n.id)} aria-current={on ? 'page' : undefined} className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${on ? 'text-[var(--fg)]' : 'text-muted'}`}>
                <Icon icon={n.icon} size={22} stroke={on ? 2 : 1.6} />
                {n.id === 'chat' ? 'Ask' : n.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
