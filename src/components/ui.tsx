import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../theme';
import Amy from './Amy';

export function Icon({ icon, size = 20, className = '', stroke = 1.6 }: { icon: IconSvgElement; size?: number; className?: string; stroke?: number }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={stroke} className={className} aria-hidden />;
}

/** Amy's logo: her face in a round badge and her name in black, on a cream pill, so it reads on any background. */
export function Logo({ onClick }: { size?: number; onClick?: () => void }) {
  return (
    <a href="#/" onClick={onClick} aria-label="Amy home" className="flex shrink-0 items-center gap-2 rounded-full bg-[#fffaf0] py-1 pl-1 pr-3.5 shadow-[0_6px_20px_-10px_rgba(0,0,0,.45)] ring-1 ring-black/5 transition-transform hover:scale-[1.03]">
      <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-[#fff1dc]">
        <Amy size={32} glow={false} float={false} />
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-[#0a0a0b]">Amy</span>
    </a>
  );
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className={`relative grid size-10 place-items-center rounded-lg border hairline hover:bg-[var(--card-2)] transition-colors ${className}`}
      aria-label={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={theme} initial={{ rotate: -90, opacity: 0, scale: 0.6 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0.6 }} transition={{ duration: 0.25 }}>
          <Icon icon={theme === 'dark' ? Sun03Icon : Moon02Icon} size={18} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

/** A photo from public/art. */
export const art = (name: string) => `${import.meta.env.BASE_URL}art/${name}.webp`;

export const SUBJECT_ART: Record<string, string> = { Physics: 'physics', Maths: 'maths', Chemistry: 'science', Biology: 'biology', English: 'reading', Economics: 'world', French: 'reading', 'Computer Science': 'coding' };

export const SUBJECT_COLOR: Record<string, string> = {
  Physics: 'var(--color-physics)',
  Maths: 'var(--color-maths)',
  Chemistry: 'var(--color-chem)',
  Biology: 'var(--color-bio)',
  English: 'var(--color-english)',
  Economics: 'var(--color-chem)',
  French: 'var(--color-english)',
  'Computer Science': 'var(--color-physics)'
};

export function SubjectDot({ subject }: { subject: string }) {
  return <span className="inline-block size-2 rounded-lg" style={{ background: SUBJECT_COLOR[subject] ?? 'var(--muted)' }} />;
}
