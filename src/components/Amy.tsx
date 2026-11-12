import { useEffect, useId, useRef, useState } from 'react';
import { motion, useAnimationControls, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

export type AmyMood = 'calm' | 'thinking' | 'happy' | 'listening' | 'encouraging';

interface AmyProps {
  size?: number;
  mood?: AmyMood;
  /** Her face turns towards the pointer, like a ball rolling to look at you. */
  follow?: boolean;
  /** Fixed gaze, e.g. down at the box while you type. Wins over `follow`. */
  lookAt?: 'down' | 'up';
  /** Soft light around her. Off for small avatars. */
  glow?: boolean;
  /** Gentle up-and-down float. */
  float?: boolean;
  /** Click or tap her and she spins. */
  interactive?: boolean;
  className?: string;
  title?: string;
}

const INK = '#2a1406';

/**
 * Amy: a small warm light that keeps you company while you study.
 * A plain glowing sphere. Her face slides across it as she looks around, so she reads as a ball that turns.
 * She reacts to mood changes: a spin when happy, a tilt while thinking, a small nod when encouraging.
 */
export default function Amy({ size = 160, mood = 'calm', follow = false, lookAt, glow = true, float = true, interactive = false, className = '', title }: AmyProps) {
  const id = useId().replace(/:/g, '');
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [poked, setPoked] = useState(false);
  const shown: AmyMood = poked ? 'happy' : mood;

  const tx = useMotionValue(0);
  const ty = useMotionValue(0);
  const lookX = useSpring(tx, { stiffness: 140, damping: 16 });
  const lookY = useSpring(ty, { stiffness: 140, damping: 16 });
  const shineX = useTransform(lookX, v => -v * 0.45);
  const shineY = useTransform(lookY, v => -v * 0.45);
  const cheekX = useTransform(lookX, v => v * 0.8);
  const cheekY = useTransform(lookY, v => v * 0.8);
  const blink = useAnimationControls();
  const body = useAnimationControls();

  const fixed = shown === 'thinking' ? 'think' : lookAt;

  // Where she looks.
  useEffect(() => {
    if (fixed === 'think') {
      tx.set(9);
      ty.set(-10);
      return;
    }
    if (fixed === 'down') {
      tx.set(0);
      ty.set(11);
      return;
    }
    if (fixed === 'up') {
      tx.set(0);
      ty.set(-10);
      return;
    }
    tx.set(0);
    ty.set(0);
    if (!follow || reduce) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const d = Math.max(1, Math.hypot(dx, dy));
      const k = Math.min(1, d / 320);
      tx.set((dx / d) * 15 * k);
      ty.set((dy / d) * 12 * k);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [fixed, follow, reduce, tx, ty]);

  // How she moves when her mood changes.
  useEffect(() => {
    if (reduce) return;
    if (shown === 'happy') body.start({ rotateY: [0, 360], y: [0, -size * 0.1, 0], rotate: 0, scale: 1, transition: { duration: 0.9, ease: [0.23, 1, 0.32, 1] } });
    else if (shown === 'encouraging') body.start({ rotate: [0, -7, 6, -4, 0], rotateY: 0, scale: 1, y: 0, transition: { duration: 0.9 } });
    else if (shown === 'thinking') body.start({ rotate: -9, rotateY: 0, scale: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 14 } });
    else if (shown === 'listening') body.start({ rotate: 0, rotateY: 0, y: 0, scale: [1, 1.05, 1], transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' } });
    else body.start({ rotate: 0, rotateY: 0, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 16 } });
  }, [shown, body, reduce, size]);

  // Blink.
  useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    let alive = true;
    const loop = () => {
      t = setTimeout(async () => {
        if (!alive) return;
        await blink.start({ scaleY: [1, 0.08, 1], transition: { duration: 0.22, times: [0, 0.45, 1] } });
        loop();
      }, 2400 + Math.random() * 2800);
    };
    loop();
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [blink, reduce]);

  const poke = () => {
    if (!interactive || poked) return;
    setPoked(true);
    setTimeout(() => setPoked(false), 1300);
  };

  const openEyes = shown === 'calm' || shown === 'thinking' || shown === 'listening';
  const eye = (x: number) => (
    <>
      <rect x={x} y="87" width="12" height="21" rx="6" fill={INK} />
      <circle cx={x + 8.5} cy="92.5" r="2.6" fill="#fff" />
    </>
  );

  return (
    <motion.div
      ref={ref}
      className={`relative inline-grid place-items-center select-none ${interactive ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
      animate={float && !reduce ? { y: [0, -size * 0.035, 0] } : undefined}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      role="img"
      aria-label={title ?? `Amy, ${shown}`}
      onClick={poke}
    >
      {glow && (
        <motion.div
          aria-hidden
          className="absolute inset-[-30%] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,170,70,.42) 0%, rgba(255,120,60,.16) 38%, rgba(255,120,60,0) 68%)' }}
          animate={reduce ? undefined : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {shown === 'listening' &&
        !reduce &&
        [0, 1, 2].map(i => (
          <motion.span
            key={i}
            aria-hidden
            className="absolute rounded-full border-2 pointer-events-none"
            style={{ inset: '14%', borderColor: 'rgba(255,170,70,.55)' }}
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
          />
        ))}

      <motion.div animate={body} style={{ transformPerspective: 600 }} className="relative">
        <svg viewBox="0 0 200 200" width={size} height={size} className="block overflow-visible">
          <defs>
            <radialGradient id={`b${id}`} cx="36%" cy="30%" r="78%">
              <stop offset="0" stopColor="#fff4d6" />
              <stop offset=".28" stopColor="#ffd06a" />
              <stop offset=".66" stopColor="#ffa048" />
              <stop offset="1" stopColor="#ff6b3d" />
            </radialGradient>
            <radialGradient id={`r${id}`} cx="50%" cy="100%" r="60%">
              <stop offset="0" stopColor="#ff4d6d" stopOpacity=".45" />
              <stop offset="1" stopColor="#ff4d6d" stopOpacity="0" />
            </radialGradient>
            <filter id={`s${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" />
            </filter>
            <clipPath id={`c${id}`}>
              <circle cx="100" cy="100" r="72" />
            </clipPath>
          </defs>

          <circle cx="100" cy="100" r="72" fill={`url(#b${id})`} />
          <circle cx="100" cy="100" r="72" fill={`url(#r${id})`} />

          <g clipPath={`url(#c${id})`}>
            {/* shine slides the other way, which is what sells the turn */}
            <motion.g style={{ x: shineX, y: shineY }}>
              <ellipse cx="72" cy="62" rx="22" ry="12" fill="#fff" opacity=".7" transform="rotate(-34 72 62)" filter={`url(#s${id})`} />
              <circle cx="132" cy="56" r="4" fill="#fff" opacity=".5" filter={`url(#s${id})`} />
            </motion.g>

            <motion.g style={{ x: cheekX, y: cheekY }}>
              <ellipse cx="62" cy="118" rx="11" ry="6.5" fill="#ff5f6d" opacity=".34" />
              <ellipse cx="138" cy="118" rx="11" ry="6.5" fill="#ff5f6d" opacity=".34" />
            </motion.g>

            <motion.g style={{ x: lookX, y: lookY }}>
              {openEyes && (
                <motion.g animate={blink}>
                  {eye(72)}
                  {eye(116)}
                </motion.g>
              )}
              {shown === 'happy' && <path d="M70 101 Q78 89 86 101 M114 101 Q122 89 130 101" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />}
              {shown === 'encouraging' && (
                <>
                  <path d="M70 100 Q78 92 86 100" stroke={INK} strokeWidth="6" strokeLinecap="round" fill="none" />
                  <motion.g animate={blink}>{eye(116)}</motion.g>
                </>
              )}

              {(shown === 'calm' || shown === 'encouraging') && <path d="M92 120 Q100 127 108 120" stroke={INK} strokeWidth="4.2" strokeLinecap="round" fill="none" />}
              {shown === 'happy' && <path d="M89 116 Q100 132 111 116 Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />}
              {shown === 'thinking' && <path d="M94 122 H107" stroke={INK} strokeWidth="4.2" strokeLinecap="round" />}
              {shown === 'listening' && <ellipse cx="100" cy="122" rx="5.5" ry="5" fill={INK} />}
            </motion.g>
          </g>

          {shown === 'thinking' &&
            [0, 1, 2].map(i => (
              <motion.circle key={i} cx={160 + i * 12} cy={44 - i * 12} r={3 + i * 1.5} fill="#ffc46b" animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
            ))}
          {shown === 'happy' && (
            <>
              <path d="M172 44 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4z" fill="#ffd36b" />
              <path d="M24 62 l2.5 6 6 2.5 -6 2.5 -2.5 6 -2.5 -6 -6 -2.5 6 -2.5z" fill="#ffd36b" />
            </>
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
}
