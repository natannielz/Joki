import { useEffect, useRef, useState } from 'react';
import { COLUMNS, LABELS, POINTS, TEAM } from './data.js';

const EMPTY = { title: '', label: 'Backend', points: 3, assignee: 'dp', status: 'todo' };

export default function StoryDialog({ story, onSave, onDelete, onClose }) {
  const ref = useRef(null);
  const [form, setForm] = useState(story ?? EMPTY);
  const [error, setError] = useState('');
  const isNew = !story?.id;

  useEffect(() => {
    const dlg = ref.current;
    if (dlg && !dlg.open) dlg.showModal();
    const onCancel = (e) => { e.preventDefault(); onClose(); };
    dlg.addEventListener('cancel', onCancel);
    return () => dlg.removeEventListener('cancel', onCancel);
  }, [onClose]);

  const set = (key) => (e) => setForm({ ...form, [key]: key === 'points' ? Number(e.target.value) : e.target.value });

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Beri judul story agar tim tahu apa yang dikerjakan.');
      return;
    }
    onSave({ ...form, title: form.title.trim() });
  }

  return (
    <dialog ref={ref} className="dialog" aria-labelledby="dialog-title" onClick={(e) => e.target === ref.current && onClose()}>
      <form onSubmit={submit} noValidate>
        <h2 id="dialog-title">{isNew ? 'Story baru' : `Ubah ${story.id}`}</h2>

        <label className="field">
          <span>Judul</span>
          <input autoFocus value={form.title} onChange={set('title')} placeholder="Sebagai penyelenggara, saya bisa…" aria-invalid={!!error} aria-describedby={error ? 'title-error' : undefined} />
          {error && <small id="title-error" className="field__error">{error}</small>}
        </label>

        <div className="field-row">
          <label className="field">
            <span>Story point</span>
            <select value={form.points} onChange={set('points')}>
              {POINTS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Label</span>
            <select value={form.label} onChange={set('label')}>
              {LABELS.map((l) => <option key={l}>{l}</option>)}
            </select>
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Dikerjakan oleh</span>
            <select value={form.assignee} onChange={set('assignee')}>
              {TEAM.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Kolom</span>
            <select value={form.status} onChange={set('status')}>
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        </div>

        <div className="dialog__actions">
          {!isNew && (
            <button type="button" className="btn btn--danger" onClick={() => onDelete(story.id)}>Hapus story</button>
          )}
          <span className="spacer" />
          <button type="button" className="btn btn--ghost" onClick={onClose}>Batal</button>
          <button type="submit" className="btn">{isNew ? 'Tambah story' : 'Simpan perubahan'}</button>
        </div>
      </form>
    </dialog>
  );
}
