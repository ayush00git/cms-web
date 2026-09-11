import { useEffect, useState } from 'react';

interface MeterProps {
  title: string;
  caption?: string;
  /** Left-hand label, count and colour: the filled part. */
  a: { label: string; value: number; color: string };
  /** Right-hand label, count and colour: the track. */
  b: { label: string; value: number; color: string };
}

// Meter is the right form for a two-way split. A 2-slice pie is an anti-pattern;
// the ratio reads better as one bar on a same-ramp track.
export function Meter({ title, caption, a, b }: MeterProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const total = a.value + b.value;
  const shareA = total === 0 ? 0 : (a.value / total) * 100;
  const shareB = total === 0 ? 0 : 100 - shareA;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4 min-w-0">
      <div>
        <h3 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h3>
        {caption && <p className="text-[11px] text-gray-400 mt-0.5">{caption}</p>}
      </div>

      {total === 0 ? (
        <p className="text-xs text-gray-400 italic py-6 text-center">Nothing to chart yet.</p>
      ) : (
        <>
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">{Math.round(shareA)}%</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-1.5">{a.label}</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">{Math.round(shareB)}%</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-1.5">{b.label}</div>
            </div>
          </div>

          <div
            className="relative h-3 rounded-full overflow-hidden"
            style={{ background: b.color }}
            role="img"
            aria-label={`${a.label} ${a.value}, ${b.label} ${b.value}`}
            title={`${a.label}: ${a.value} · ${b.label}: ${b.value}`}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: mounted ? `${shareA}%` : '0%',
                background: a.color,
                boxShadow: '2px 0 0 #ffffff', // 2px surface gap between fills
                transition: 'width 700ms cubic-bezier(.2,.8,.2,1)',
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-600">
            <span className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: a.color }} />
              {a.label} <span className="font-mono text-gray-800">{a.value}</span>
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="font-mono text-gray-800">{b.value}</span> {b.label}
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: b.color }} />
            </span>
          </div>
        </>
      )}
    </div>
  );
}
