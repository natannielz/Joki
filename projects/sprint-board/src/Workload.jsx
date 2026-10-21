import { TEAM } from './data.js';

// Points per team member, split into done and still open.
export default function Workload({ stories }) {
  const rows = TEAM.map((m) => {
    const mine = stories.filter((s) => s.assignee === m.id);
    const done = mine.filter((s) => s.status === 'done').reduce((n, s) => n + s.points, 0);
    const open = mine.filter((s) => s.status !== 'done').reduce((n, s) => n + s.points, 0);
    return { ...m, done, open, total: done + open };
  });
  const max = Math.max(1, ...rows.map((r) => r.total));

  return (
    <figure className="workload">
      <figcaption>
        <span className="workload__title">Beban kerja tim</span>
        <span className="legend">
          <span className="legend__item"><i className="swatch swatch--done" />Selesai</span>
          <span className="legend__item"><i className="swatch swatch--open" />Belum selesai</span>
        </span>
      </figcaption>
      <ul className="workload__list">
        {rows.map((r) => (
          <li key={r.id} title={`${r.name}: ${r.done} poin selesai, ${r.open} poin belum selesai`}>
            <span className="workload__name">{r.name}</span>
            <span className="workload__bar" aria-hidden="true">
              {r.done > 0 && <i className="seg seg--done" style={{ width: `${(r.done / max) * 100}%` }} />}
              {r.open > 0 && <i className="seg seg--open" style={{ width: `${(r.open / max) * 100}%` }} />}
            </span>
            <span className="workload__num">{r.done}/{r.total} pt</span>
            <span className="sr-only">{r.name}: {r.done} dari {r.total} poin selesai</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
