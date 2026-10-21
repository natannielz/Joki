import { useState } from 'react';
import { SPRINT } from './data.js';

const W = 360;
const H = 200;
const PAD = { l: 34, r: 16, t: 14, b: 26 };

export default function Burndown({ data }) {
  const [hover, setHover] = useState(null);
  const { total, actual, ideal } = data;
  const plotW = W - PAD.l - PAD.r;
  const plotH = H - PAD.t - PAD.b;
  const step = total > 40 ? 10 : 5;
  const max = Math.max(step, Math.ceil(total / step) * step);
  const x = (d) => PAD.l + (d / SPRINT.days) * plotW;
  const y = (v) => PAD.t + plotH - (v / max) * plotH;
  const ticks = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);

  const path = (values) => values.map((v, d) => `${d ? 'L' : 'M'}${x(d).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const last = actual.length - 1;
  const behind = actual[last] - ideal[last];

  function onMove(e) {
    const box = e.currentTarget.getBoundingClientRect();
    const rel = ((e.clientX - box.left) / box.width) * W - PAD.l;
    const d = Math.max(0, Math.min(SPRINT.days, Math.round((rel / plotW) * SPRINT.days)));
    setHover(d);
  }
  function onKey(e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const cur = hover ?? last;
    setHover(Math.max(0, Math.min(SPRINT.days, cur + (e.key === 'ArrowRight' ? 1 : -1))));
  }

  return (
    <figure className="burndown">
      <figcaption>
        <span className="burndown__title">Burndown sprint</span>
        <span className="legend">
          <span className="legend__item"><i className="key key--actual" />Sisa poin</span>
          <span className="legend__item"><i className="key key--ideal" />Laju ideal</span>
        </span>
      </figcaption>
      <div className="burndown__plot">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Burndown: sisa ${actual[last]} dari ${total} poin di hari ${SPRINT.today} dari ${SPRINT.days}. Laju ideal ${Math.round(ideal[last])}.`}
          tabIndex={0}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
          onKeyDown={onKey}
          onBlur={() => setHover(null)}
        >
          {ticks.map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(v) + 0.5} y2={y(v) + 0.5} className={v === 0 ? 'axis' : 'grid'} />
              <text x={PAD.l - 6} y={y(v)} className="tick" textAnchor="end" dominantBaseline="middle">{v}</text>
            </g>
          ))}
          {[0, 2, 4, 6, 8, 10].map((d) => (
            <text key={d} x={x(d)} y={H - 8} className="tick" textAnchor="middle">{d === 0 ? 'Mulai' : `Hari ${d}`}</text>
          ))}

          <path d={path(ideal)} className="line line--ideal" />
          <path d={path(actual)} className="line line--actual" />
          <circle cx={x(last)} cy={y(actual[last])} r="4" className="dot" />
          <text x={x(last) + 8} y={y(actual[last]) - 8} className="endlabel">sisa {actual[last]}</text>

          {hover !== null && (
            <g pointerEvents="none">
              <line x1={x(hover)} x2={x(hover)} y1={PAD.t} y2={PAD.t + plotH} className="cross" />
              {hover <= last && <circle cx={x(hover)} cy={y(actual[hover])} r="4" className="dot" />}
            </g>
          )}
        </svg>
        {hover !== null && (
          <div className="chart-tip" style={{ left: `${(x(hover) / W) * 100}%` }}>
            <b>{hover === 0 ? 'Awal sprint' : `Hari ${hover}`}</b>
            {hover <= last ? <span>sisa {actual[hover]} poin</span> : <span>Belum sampai hari ini</span>}
            <span>Ideal: {String(Math.round(ideal[hover] * 10) / 10).replace('.', ',')}</span>
          </div>
        )}
      </div>
      <p className={`burndown__note ${behind > 0 ? 'is-behind' : 'is-ahead'}`}>
        {behind > 0
          ? `Tertinggal ${Math.round(behind)} poin dari laju ideal, sisa ${SPRINT.days - SPRINT.today} hari.`
          : `Sesuai atau lebih cepat dari laju ideal, sisa ${SPRINT.days - SPRINT.today} hari.`}
      </p>
    </figure>
  );
}
