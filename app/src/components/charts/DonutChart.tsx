import { useEffect, useState } from 'react';
import { Table2, PieChart } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  color: string;
  /** Optional secondary line shown in the tooltip and legend. */
  detail?: string;
}

interface DonutChartProps {
  title: string;
  caption?: string;
  segments: DonutSegment[];
  /** Text under the hero number in the centre. */
  centreLabel?: string;
  /** Currently selected segment key, if the chart doubles as a filter. */
  selected?: string | null;
  onSelect?: (key: string | null) => void;
}

// ── Geometry ──────────────────────────────────────────────────────────────────

const R = 42;                 // ring radius (viewBox units)
const C = 2 * Math.PI * R;    // circumference
const STROKE = 14;            // ring thickness
const GAP = 2;                // surface gap between segments (px in viewBox)
const SURFACE = '#ffffff';

const pct = (v: number, total: number) => (total === 0 ? 0 : (v / total) * 100);
const fmtPct = (p: number) => (p < 1 && p > 0 ? '<1%' : `${Math.round(p)}%`);

// ── Component ─────────────────────────────────────────────────────────────────

export function DonutChart({ title, caption, segments, centreLabel = 'total', selected = null, onSelect }: DonutChartProps) {
  const [hover, setHover] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [tableView, setTableView] = useState(false);

  // Sweep-in on first paint: segments start at zero length, then transition.
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const visible = segments.filter(s => s.value > 0);
  const total = segments.reduce((a, s) => a + s.value, 0);
  const active = hover ?? selected;
  const activeSeg = active ? segments.find(s => s.key === active) : undefined;

  // Centre readout: the hovered/selected segment, else the whole.
  const heroValue = activeSeg ? activeSeg.value : total;
  const heroLabel = activeSeg ? `${activeSeg.label} · ${fmtPct(pct(activeSeg.value, total))}` : centreLabel;

  const clickable = Boolean(onSelect);
  const toggle = (key: string) => onSelect?.(selected === key ? null : key);

  // Precompute arc offsets.
  const arcs = visible.reduce<(DonutSegment & { start: number; len: number })[]>((acc, s) => {
    const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].len : 0;
    return [...acc, { ...s, start, len: (s.value / total) * C }];
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col gap-4 min-w-0">
      <div className="flex items-start gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h3>
          {caption && <p className="text-[11px] text-gray-400 mt-0.5">{caption}</p>}
        </div>
        <button
          onClick={() => setTableView(v => !v)}
          className="ml-auto shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 rounded-md px-2 py-1 transition-colors cursor-pointer"
          aria-pressed={tableView}
          title={tableView ? 'Show chart' : 'Show as table'}
        >
          {tableView ? <PieChart className="w-3 h-3" /> : <Table2 className="w-3 h-3" />}
          {tableView ? 'Chart' : 'Table'}
        </button>
      </div>

      {total === 0 ? (
        <p className="text-xs text-gray-400 italic py-6 text-center">Nothing to chart yet.</p>
      ) : tableView ? (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="text-left py-1.5 font-semibold">Segment</th>
              <th className="text-right py-1.5 font-semibold">Count</th>
              <th className="text-right py-1.5 font-semibold">Share</th>
            </tr>
          </thead>
          <tbody>
            {segments.map(s => (
              <tr key={s.key} className="border-b border-gray-50 last:border-0">
                <td className="py-1.5 text-gray-700 inline-flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                  {s.label}
                </td>
                <td className="py-1.5 text-right font-mono text-gray-800">{s.value}</td>
                <td className="py-1.5 text-right text-gray-500">{fmtPct(pct(s.value, total))}</td>
              </tr>
            ))}
            <tr className="font-semibold">
              <td className="py-1.5 text-gray-800">Total</td>
              <td className="py-1.5 text-right font-mono text-gray-800">{total}</td>
              <td className="py-1.5 text-right text-gray-500">100%</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Ring */}
          <div className="relative shrink-0 w-44 h-44" onMouseLeave={() => setHover(null)}>
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" role="img" aria-label={`${title}: ${segments.map(s => `${s.label} ${s.value}`).join(', ')}`}>
              {/* recessive track */}
              <circle cx="60" cy="60" r={R} fill="none" stroke="#f3f4f6" strokeWidth={STROKE} />
              {arcs.map(a => {
                const isActive = active === a.key;
                const dimmed = active !== null && !isActive;
                const drawn = mounted ? Math.max(a.len - GAP, 0) : 0;
                return (
                  <circle
                    key={a.key}
                    cx="60" cy="60" r={R}
                    fill="none"
                    stroke={a.color}
                    strokeWidth={isActive ? STROKE + 4 : STROKE}
                    strokeDasharray={`${drawn} ${C - drawn}`}
                    strokeDashoffset={-(a.start + GAP / 2)}
                    opacity={dimmed ? 0.35 : 1}
                    style={{
                      transition: 'stroke-dasharray 700ms cubic-bezier(.2,.8,.2,1), stroke-width 150ms ease, opacity 150ms ease',
                      cursor: clickable ? 'pointer' : 'default',
                    }}
                    onMouseEnter={() => setHover(a.key)}
                    onClick={() => clickable && toggle(a.key)}
                    tabIndex={clickable ? 0 : -1}
                    onFocus={() => setHover(a.key)}
                    onBlur={() => setHover(null)}
                    onKeyDown={e => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); toggle(a.key); } }}
                  >
                    <title>{`${a.label}: ${a.value} (${fmtPct(pct(a.value, total))})`}</title>
                  </circle>
                );
              })}
              {/* surface ring keeps the gap crisp on the inner edge */}
              <circle cx="60" cy="60" r={R - STROKE / 2 - 1} fill="none" stroke={SURFACE} strokeWidth={2} />
            </svg>

            {/* Centre hero figure */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
              <span className="text-3xl font-extrabold text-gray-900 tabular-nums leading-none">{heroValue}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-1.5 leading-tight line-clamp-2">{heroLabel}</span>
            </div>
          </div>

          {/* Legend with direct values */}
          <ul className="flex-1 w-full min-w-0 flex flex-col gap-1">
            {segments.map(s => {
              const isActive = active === s.key;
              const isSel = selected === s.key;
              const share = pct(s.value, total);
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    disabled={!clickable}
                    onMouseEnter={() => setHover(s.key)}
                    onMouseLeave={() => setHover(null)}
                    onClick={() => clickable && toggle(s.key)}
                    className={`w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors ${clickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'} ${isSel ? 'bg-gray-50 ring-1 ring-gray-200' : ''}`}
                  >
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color, opacity: active && !isActive ? 0.4 : 1 }} />
                    <span className={`text-xs truncate ${isActive ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>{s.label}</span>
                    {s.detail && <span className="text-[10px] text-gray-400 truncate hidden md:inline">{s.detail}</span>}
                    <span className="ml-auto text-xs font-mono text-gray-800 tabular-nums">{s.value}</span>
                    <span className="w-9 text-right text-[11px] text-gray-400 tabular-nums">{fmtPct(share)}</span>
                  </button>
                  {/* thin proportional bar under each legend row */}
                  <div className="mx-2 h-0.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: mounted ? `${share}%` : '0%', background: s.color, transition: 'width 700ms cubic-bezier(.2,.8,.2,1)' }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {clickable && !tableView && total > 0 && (
        <p className="text-[10px] text-gray-400">
          {selected ? 'Click the highlighted segment again to clear the filter.' : 'Click a segment to filter the lists below.'}
        </p>
      )}
    </div>
  );
}
