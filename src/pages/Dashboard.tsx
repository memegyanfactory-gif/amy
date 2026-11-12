import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { BookOpen02Icon, Home01Icon, Message01Icon, Target02Icon, UserIcon } from '@hugeicons/core-free-icons';
import { Icon, Logo, ThemeToggle } from '../components/ui';
import Home from '../components/dash/Home';
import Chat from '../components/dash/Chat';
import { Courses, Practice, Me } from '../components/dash/Other';
import { query } from '../router';

export type View = 'home' | 'chat' | 'courses' | 'practice' | 'me';

const NAV: { id: View; label: string; icon: typeof Home01Icon }[] = [
  { id: 'home', label: 'Home', icon: Home01Icon },
  { id: 'chat', label: 'Ask Amy', icon: Message01Icon },
  { id: 'courses', label: 'Courses', icon: BookOpen02Icon },
  { id: 'practice', label: 'Practice', icon: Target02Icon },
  { id: 'me', label: 'Me', icon: UserIcon }
];

export default function Dashboard() {
  const initialAsk = query().get('ask') ?? '';
  const [view, setView] = useState<View>(initialAsk ? 'chat' : 'home');
  const [ask, setAsk] = useState(initialAsk);

  useEffect(() => {
    if (initialAsk) history.replaceState(null, '', '#/app');
  }, [initialAsk]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view]);

  const openChat = (q = '') => {
    setAsk(q);
    setView('chat');
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* One top bar on every screen size. Phones also get a tab bar at the bottom. */}
      <header className="sticky top-0 z-40 border-b hairline bg-[var(--bg)]/80 backdrop-blur-xl pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-[max(16px,env(safe-area-inset-left))] sm:px-6">
          <Logo />
          <nav className="hidden md:flex mx-auto items-center gap-1 rounded-lg border hairline p-1" aria-label="App">
            {NAV.filter(n => n.id !== 'me').map(n => {
              const on = view === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setView(n.id)}
                  aria-current={on ? 'page' : undefined}
                  className={`relative rounded-lg px-4 py-2 text-sm transition-colors ${on ? 'text-[var(--on-invert)]' : 'text-muted hover:text-[var(--fg)]'}`}
                >
                  {on && <motion.span layoutId="top-pill" className="absolute inset-0 rounded-lg bg-[var(--invert)]" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                  <span className="relative">{n.label}</span>
                </button>
              );
            })}
          </nav>
          <div className="ml-auto md:ml-0 flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setView('me')}
              aria-label="Your profile"
              className={`grid size-10 place-items-center rounded-lg bg-gradient-to-br from-amy-200 to-amy-600 text-[#2a1406] text-sm font-semibold ring-offset-2 ring-offset-[var(--bg)] transition ${view === 'me' ? 'ring-2 ring-amy-400' : ''}`}
            >
              R
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-1 min-w-0 ${view === 'chat' ? '' : 'pb-28 md:pb-16'}`}>
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
            {view === 'home' && <Home onAsk={openChat} onGo={setView} />}
            {view === 'chat' && <Chat initial={ask} />}
            {view === 'courses' && <Courses />}
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
