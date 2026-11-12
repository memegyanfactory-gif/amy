import Amy, { type AmyMood } from '../components/Amy';
import { useTheme } from '../theme';

const MOODS: { mood: AmyMood; name: string; when: string }[] = [
  { mood: 'calm', name: 'Calm', when: 'Default. Avatar, home, empty states.' },
  { mood: 'thinking', name: 'Thinking', when: 'While she writes a reply or a quiz.' },
  { mood: 'happy', name: 'Happy', when: 'Right answer, passed quiz, streak.' },
  { mood: 'listening', name: 'Listening', when: 'Voice calls, microphone on.' },
  { mood: 'encouraging', name: 'Encouraging', when: 'After a "Not yet".' }
];

export default function MascotSheet() {
  const { toggle } = useTheme();
  return (
    <main className="min-h-dvh px-[max(16px,env(safe-area-inset-left))] py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            Meet <span className="serif">Amy</span>
          </h1>
          <button className="btn btn-ghost" onClick={toggle}>
            Switch theme
          </button>
        </div>
        <p className="text-muted mt-3 max-w-xl">A small warm light that sits beside you while you study. Move your pointer: she watches.</p>
        <div className="mt-16 grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3 lg:grid-cols-5">
          {MOODS.map(m => (
            <div key={m.mood} className="flex flex-col items-center text-center gap-4">
              <Amy size={150} mood={m.mood} follow={m.mood === 'calm'} />
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-muted text-sm mt-1">{m.when}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-20 flex flex-wrap items-end gap-8">
          {[24, 32, 48, 64].map(s => (
            <Amy key={s} size={s} glow={s > 32} float={false} />
          ))}
        </div>
      </div>
    </main>
  );
}
