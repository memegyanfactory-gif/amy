import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import { Moon02Icon, Sun03Icon } from '@hugeicons/core-free-icons';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../theme';

export function Icon({ icon, size = 20, className = '', stroke = 1.6 }: { icon: IconSvgElement; size?: number; className?: string; stroke?: number }) {
  return <HugeiconsIcon icon={icon} size={size} strokeWidth={stroke} className={className} aria-hidden />;
}

export function Logo({ size = 30, onClick }: { size?: number; onClick?: () => void }) {
  return (
    <a href="#/" onClick={onClick} className="flex items-center gap-2 font-semibold tracking-tight text-[19px]" aria-label="Amy home">
      <span aria-hidden className="block rounded-full" style={{ width: size * 0.62, height: size * 0.62, background: 'radial-gradient(circle at 35% 30%, #fff4d6, #ffa048 55%, #ff6b3d)' }} />
      <span>Amy</span>
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
