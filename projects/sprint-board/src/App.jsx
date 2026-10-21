import { useEffect, useMemo, useReducer, useState, useCallback } from 'react';
import { COLUMNS, SPRINT, TEAM } from './data.js';
import { burndown, loadStories, reducer, saveStories } from './store.js';
import Burndown from './Burndown.jsx';
import Workload from './Workload.jsx';
import StoryDialog from './StoryDialog.jsx';

const memberName = (id) => TEAM.find((m) => m.id === id)?.name ?? 'Belum ditugaskan';
const initials = (id) => memberName(id).split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase();

function formatRange() {
  const start = new Date(SPRINT.start + 'T00:00:00');
  const end = new Date(start);
  end.setDate(start.getDate() + 11); // sepuluh hari kerja
  const opts = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString('id-ID', opts)} sampai ${end.toLocaleDateString('id-ID', { ...opts, year: 'numeric' })}`;
}

function Card({ story, columnIndex, onMove, onOpen }) {
  const left = COLUMNS[columnIndex - 1];
  const right = COLUMNS[columnIndex + 1];
  return (
    <li
      className="card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', story.id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('is-dragging');
      }}
      onDragEnd={(e) => e.currentTarget.classList.remove('is-dragging')}
    >
      <div className="card__top">
        <span className="card__id">{story.id}</span>
        <span className={`tag tag--${story.label.toLowerCase()}`}>{story.label}</span>
      </div>
      <button type="button" className="card__title" onClick={() => onOpen(story)}>{story.title}</button>
      <div className="card__foot">
        <span className="avatar" title={memberName(story.assignee)} aria-label={`Dikerjakan ${memberName(story.assignee)}`}>{initials(story.assignee)}</span>
        <span className="points" aria-label={`${story.points} story point`}>{story.points} pt</span>
        <span className="card__move">
          <button type="button" disabled={!left} onClick={() => onMove(story.id, left.id)} aria-label={left ? `Pindahkan ${story.id} ke ${left.name}` : 'Sudah di kolom pertama'}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" /></svg>
          </button>
          <button type="button" disabled={!right} onClick={() => onMove(story.id, right.id)} aria-label={right ? `Pindahkan ${story.id} ke ${right.name}` : 'Sudah di kolom terakhir'}>
            <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" /></svg>
          </button>
        </span>
      </div>
    </li>
  );
}

function Column({ column, index, stories, onMove, onOpen }) {
  const [over, setOver] = useState(false);
  const points = stories.reduce((s, x) => s + x.points, 0);
  return (
    <section
      className={`column${over ? ' is-over' : ''}`}
      aria-labelledby={`col-${column.id}`}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setOver(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) onMove(id, column.id);
      }}
    >
      <header className="column__head">
        <h2 id={`col-${column.id}`}>{column.name}</h2>
        <span className="column__meta">{stories.length} story, {points} pt</span>
      </header>
      <ul className="column__list">
        {stories.map((s) => (
          <Card key={s.id} story={s} columnIndex={index} onMove={onMove} onOpen={onOpen} />
        ))}
        {stories.length === 0 && <li className="column__empty">Geser story ke sini</li>}
      </ul>
    </section>
  );
}

export default function App() {
  const [stories, dispatch] = useReducer(reducer, undefined, loadStories);
  const [who, setWho] = useState('all');
  const [editing, setEditing] = useState(null); // story, {} untuk story baru, atau null

  useEffect(() => saveStories(stories), [stories]);

  const visible = who === 'all' ? stories : stories.filter((s) => s.assignee === who);
  const chart = useMemo(() => burndown(stories), [stories]);
  const donePoints = stories.filter((s) => s.status === 'done').reduce((sum, s) => sum + s.points, 0);

  const move = useCallback((id, status) => dispatch({ type: 'move', id, status }), []);
  const close = useCallback(() => setEditing(null), []);

  return (
    <div className="page">
      <header className="top">
        <div>
          <a className="top__back" href="../../index.html#projects">Kembali ke portofolio</a>
          <h1>{SPRINT.name}: Aplikasi event kampus</h1>
          <p className="top__goal">Tujuan sprint: {SPRINT.goal}.</p>
        </div>
        <dl className="stats">
          <div><dt>Periode</dt><dd>{formatRange()}</dd></div>
          <div><dt>Progres</dt><dd>Hari {SPRINT.today} dari {SPRINT.days}</dd></div>
          <div><dt>Selesai</dt><dd>{donePoints} dari {chart.total} poin</dd></div>
        </dl>
      </header>

      <div className="toolbar">
        <div className="filter" role="group" aria-label="Tampilkan story milik">
          <button type="button" aria-pressed={who === 'all'} onClick={() => setWho('all')}>Semua anggota</button>
          {TEAM.map((m) => (
            <button key={m.id} type="button" aria-pressed={who === m.id} onClick={() => setWho(m.id)}>
              <span className="avatar avatar--small" aria-hidden="true">{initials(m.id)}</span>{m.name}
            </button>
          ))}
        </div>
        <button type="button" className="btn" onClick={() => setEditing({})}>Story baru</button>
      </div>

      <div className="layout">
        <main className="board">
          {COLUMNS.map((c, i) => (
            <Column key={c.id} column={c} index={i} stories={visible.filter((s) => s.status === c.id)} onMove={move} onOpen={setEditing} />
          ))}
        </main>
        <aside className="side">
          <Burndown data={chart} />
          <Workload stories={stories} />
          <div className="side__foot">
            <p>Perubahan tersimpan di browser ini. Sprint dibekukan di hari ke-{SPRINT.today}, jadi story yang Anda selesaikan dihitung untuk hari ini.</p>
            <button type="button" className="btn btn--ghost" onClick={() => { dispatch({ type: 'reset' }); setWho('all'); }}>Kembalikan data contoh</button>
          </div>
        </aside>
      </div>

      {editing && (
        <StoryDialog
          story={editing.id ? editing : null}
          onClose={close}
          onSave={(story) => { dispatch({ type: 'save', story }); close(); }}
          onDelete={(id) => { dispatch({ type: 'delete', id }); close(); }}
        />
      )}
    </div>
  );
}
