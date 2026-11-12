import type { ReactNode } from 'react';
import { motion } from 'motion/react';

/** The things Amy can show inside a reply. Each one animates in as it is drawn. */
export type Block =
  | { kind: 'steps'; title: string; lines: { expr: string; note: string }[] }
  | { kind: 'graph'; a: number; b: number; c: number }
  | { kind: 'forces' }
  | { kind: 'map'; center: string; nodes: string[] };

const EASE = [0.23, 1, 0.32, 1] as const;
export const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '')).replace('-', '−');

function Panel({ title, children, caption }: { title: string; children: ReactNode; caption?: string }) {
  return (
    <motion.figure initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="rounded-xl border hairline bg-[var(--card)] overflow-hidden">
      <div className="flex items-center gap-2 border-b hairline px-4 h-10 text-xs text-muted">
        <span className="size-1.5 rounded-full bg-amy-500" />
        {title}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
      {caption && <figcaption className="border-t hairline px-4 py-2.5 text-[13px] text-muted">{caption}</figcaption>}
    </motion.figure>
  );
}

function Steps({ title, lines }: { title: string; lines: { expr: string; note: string }[] }) {
  return (
    <Panel title={title}>
      <ol className="flex flex-col">
        {lines.map((l, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.45, duration: 0.45, ease: EASE }}
            className={`grid grid-cols-[24px_1fr] sm:grid-cols-[24px_minmax(0,1fr)_minmax(0,1fr)] items-baseline gap-x-3 py-2.5 ${i ? 'border-t hairline' : ''}`}
          >
            <span className="text-xs tabular-nums text-muted">{i + 1}</span>
            <span className={`font-mono text-[15px] ${i === lines.length - 1 ? 'text-amy-500 font-medium' : ''}`}>{l.expr}</span>
            <span className="col-start-2 sm:col-start-3 text-[13px] text-muted">{l.note}</span>
          </motion.li>
        ))}
      </ol>
    </Panel>
  );
}

function Graph({ a, b, c }: { a: number; b: number; c: number }) {
  const W = 460;
  const H = 250;
  const L = 44;
  const R = 16;
  const T = 16;
  const B = 30;
  const sol = (c - b) / a;
  const xmin = Math.floor(Math.min(0, sol)) - 1;
  const xmax = Math.ceil(Math.max(0, sol)) + 2;
  const f = (x: number) => a * x + b;
  let ymin = Math.min(f(xmin), f(xmax), c, 0);
  let ymax = Math.max(f(xmin), f(xmax), c, 0);
  const pad = (ymax - ymin) * 0.1 || 1;
  ymin -= pad;
  ymax += pad;
  const sx = (x: number) => L + ((x - xmin) / (xmax - xmin)) * (W - L - R);
  const sy = (y: number) => H - B - ((y - ymin) / (ymax - ymin)) * (H - T - B);
  const xstep = Math.max(1, Math.ceil((xmax - xmin) / 8));
  const xt: number[] = [];
  for (let x = xmin; x <= xmax; x += xstep) xt.push(x);
  const yt = [0, 1, 2, 3, 4].map(i => ymin + pad + (i * (ymax - ymin - 2 * pad)) / 4);
  const eq = `y = ${a === 1 ? '' : a === -1 ? '−' : fmt(a)}x${b ? ` ${b < 0 ? '−' : '+'} ${fmt(Math.abs(b))}` : ''}`;
  const zeroY = Math.min(Math.max(sy(0), T), H - B);

  return (
    <Panel title={`Graph · ${eq}`} caption={`The line ${eq} reaches ${fmt(c)} exactly when x = ${fmt(sol)}.`}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Graph of ${eq} crossing y = ${fmt(c)} at x = ${fmt(sol)}`}>
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
          {yt.map((y, i) => (
            <g key={i}>
              <line x1={L} x2={W - R} y1={sy(y)} y2={sy(y)} stroke="var(--line)" />
              <text x={L - 8} y={sy(y) + 4} textAnchor="end" fontSize="11" fill="var(--muted)">
                {fmt(Math.round(y))}
              </text>
            </g>
          ))}
          {xt.map(x => (
            <text key={x} x={sx(x)} y={H - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">
              {fmt(x)}
            </text>
          ))}
          <line x1={L} x2={W - R} y1={zeroY} y2={zeroY} stroke="var(--line-2)" />
          <line x1={sx(0)} x2={sx(0)} y1={T} y2={H - B} stroke="var(--line-2)" />
        </motion.g>

        {/* the target value */}
        <motion.line x1={L} x2={W - R} y1={sy(c)} y2={sy(c)} stroke="var(--muted)" strokeDasharray="4 5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
        <motion.text x={W - R - 4} y={sy(c) - 7} textAnchor="end" fontSize="12" fill="var(--muted)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          y = {fmt(c)}
        </motion.text>

        {/* the line draws itself */}
        <motion.path d={`M${sx(xmin)} ${sy(f(xmin))} L${sx(xmax)} ${sy(f(xmax))}`} fill="none" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.7, duration: 1.1, ease: 'easeInOut' }} />

        {/* drop to the answer */}
        <motion.path d={`M${sx(sol)} ${sy(c)} V${zeroY}`} fill="none" stroke="var(--color-physics)" strokeWidth="2" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.9, duration: 0.5 }} />
        <motion.circle cx={sx(sol)} cy={sy(c)} r="6" fill="#ff8a3d" stroke="var(--card)" strokeWidth="3" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.75, type: 'spring', stiffness: 400, damping: 14 }} style={{ transformOrigin: `${sx(sol)}px ${sy(c)}px` }} />
        <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.3 }}>
          <rect x={sx(sol) + 10} y={sy(c) + 10} width={50 + fmt(sol).length * 8} height="24" rx="6" fill="var(--color-physics)" />
          <text x={sx(sol) + 20} y={sy(c) + 26.5} fontSize="12.5" fontWeight="600" fill="#fff">
            x = {fmt(sol)}
          </text>
        </motion.g>
      </svg>
    </Panel>
  );
}

function Forces() {
  const draw = (delay: number) => ({ initial: { pathLength: 0 }, animate: { pathLength: 1 }, transition: { duration: 0.9, ease: 'easeInOut' as const, delay } });
  return (
    <Panel title="Diagram · action and reaction" caption="Same size, opposite direction, acting on different things.">
      <svg viewBox="0 0 360 170" className="w-full max-w-[460px] mx-auto block" role="img" aria-label="You push the wall, the wall pushes you back">
        <motion.rect x="236" y="20" width="26" height="130" rx="5" fill="none" stroke="var(--fg)" strokeWidth="2.5" {...draw(0)} />
        <motion.circle cx="120" cy="62" r="20" fill="none" stroke="var(--fg)" strokeWidth="2.5" {...draw(0.1)} />
        <motion.path d="M120 82 V140 M120 100 H170" fill="none" stroke="var(--fg)" strokeWidth="2.5" strokeLinecap="round" {...draw(0.2)} />
        <motion.path d="M176 92 H228 M216 84 L228 92 L216 100" fill="none" stroke="var(--color-physics)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...draw(0.9)} />
        <motion.path d="M228 112 H176 M188 104 L176 112 L188 120" fill="none" stroke="#ff8a3d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...draw(1.5)} />
        <motion.text x="202" y="78" textAnchor="middle" fill="var(--color-physics)" fontSize="13" fontWeight="500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          you push
        </motion.text>
        <motion.text x="228" y="140" textAnchor="end" fill="#ff8a3d" fontSize="13" fontWeight="500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.1 }}>
          wall pushes back
        </motion.text>
      </svg>
    </Panel>
  );
}

function ConceptMap({ center, nodes }: { center: string; nodes: string[] }) {
  const xs = nodes.map((_, i) => ((i + 0.5) / nodes.length) * 300);
  return (
    <Panel title="How Amy will teach this">
      <div className="flex justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="max-w-full truncate rounded-lg bg-[var(--invert)] text-[var(--on-invert)] px-4 py-2 text-sm font-medium">
          {center}
        </motion.div>
      </div>
      <motion.svg viewBox="0 0 300 56" preserveAspectRatio="none" className="w-full h-14 block" aria-hidden initial={{ clipPath: 'inset(0 0 100% 0)' }} animate={{ clipPath: 'inset(0 0 0% 0)' }} transition={{ delay: 0.3, duration: 0.8, ease: 'easeInOut' }}>
        {xs.map((x, i) => (
          <path key={i} d={`M150 0 C150 34 ${x} 22 ${x} 56`} fill="none" stroke="#ff8a3d" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
        ))}
      </motion.svg>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${nodes.length}, minmax(0, 1fr))` }}>
        {nodes.map((n, i) => (
          <motion.div key={n} initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: 0.9 + i * 0.25, duration: 0.4, ease: EASE }} className="rounded-lg border hairline bg-[var(--card-2)] px-3 py-2.5 text-center text-[13px] leading-snug">
            {n}
          </motion.div>
        ))}
      </div>
    </Panel>
  );
}

export function BlockView({ block }: { block: Block }) {
  if (block.kind === 'steps') return <Steps title={block.title} lines={block.lines} />;
  if (block.kind === 'graph') return <Graph a={block.a} b={block.b} c={block.c} />;
  if (block.kind === 'forces') return <Forces />;
  return <ConceptMap center={block.center} nodes={block.nodes} />;
}
