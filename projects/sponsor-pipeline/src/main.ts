import { CAMPAIGN } from './data';
import { escapeHtml as esc, rupiah, rupiahShort, shortDate, toCsv } from './format';
import { Store, totals, visibleSponsors } from './store';
import { STAGES, STAGE_LABEL, TIERS, type SortKey, type Sponsor, type Stage, type Tier } from './types';

/** The demo is frozen at this date so "overdue" stays meaningful. */
const TODAY = '2026-10-21';

const store = new Store();

function $<T extends Element = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing element: ${selector}`);
  return el;
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / 86_400_000);
}

/* ------------------------------------------------------------------
   Rendering
------------------------------------------------------------------- */

function renderProgress(): void {
  const t = totals(store.sponsors);
  const target = CAMPAIGN.target;
  const pct = (n: number) => Math.min(100, (n / target) * 100);
  const secured = t.received + t.committed;
  const toGo = Math.max(0, target - secured);

  $('#meter-received').style.width = pct(t.received) + '%';
  $('#meter-committed').style.width = Math.min(100 - pct(t.received), pct(t.committed)) + '%';
  $('#meter').setAttribute('aria-valuenow', String(Math.round(pct(secured))));
  $('#meter').setAttribute('aria-valuetext', `${rupiah(secured)} dari ${rupiah(target)} terkumpul`);

  $('#secured').textContent = `${Math.round((secured / target) * 100)}% terkumpul`;
  $('#figures').innerHTML = `
    <div><dt><i class="swatch swatch--received"></i>Dana diterima</dt><dd>${rupiahShort(t.received)}</dd></div>
    <div><dt><i class="swatch swatch--committed"></i>Berkomitmen, belum dibayar</dt><dd>${rupiahShort(t.committed)}</dd></div>
    <div><dt><i class="swatch swatch--gap"></i>Masih harus dikumpulkan</dt><dd>${rupiahShort(toGo)}</dd></div>
    <div><dt>Masih dalam proses</dt><dd>${rupiahShort(t.open)}</dd></div>`;
}

function renderStages(): void {
  const t = totals(store.sponsors);
  const current = store.view.stage;
  const all = `<button type="button" class="stage" data-stage="all" aria-pressed="${current === 'all'}">
      <span class="stage__name">Semua tahap</span>
      <span class="stage__count">${store.sponsors.length} sponsor</span>
    </button>`;
  $('#stages').innerHTML = all + STAGES.map((s) => `
    <button type="button" class="stage stage--${s}" data-stage="${s}" aria-pressed="${current === s}">
      <span class="stage__name">${STAGE_LABEL[s]}</span>
      <span class="stage__count">${t.byStage[s].count} sponsor</span>
      <span class="stage__amount">${rupiahShort(t.byStage[s].amount)}</span>
    </button>`).join('');
}

const COLUMNS: { key: SortKey; label: string; num?: boolean }[] = [
  { key: 'name', label: 'Sponsor' },
  { key: 'tier', label: 'Tingkat' },
  { key: 'amount', label: 'Nilai', num: true },
  { key: 'stage', label: 'Tahap' },
  { key: 'followUp', label: 'Tindak lanjut berikutnya' },
];

function followUpCell(s: Sponsor): string {
  if (!s.followUp) return '<span class="muted">Belum dijadwalkan</span>';
  const d = daysBetween(TODAY, s.followUp);
  const flag = d < 0 ? '<span class="flag flag--late">Terlambat</span>'
    : d <= 3 ? '<span class="flag flag--soon">Segera</span>' : '';
  return `${shortDate(s.followUp)} ${flag}`;
}

function renderTable(): void {
  const { sort } = store.view;
  $('#thead').innerHTML = '<tr>' + COLUMNS.map((c) => {
    const active = sort.key === c.key;
    const aria = active ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none';
    return `<th scope="col" aria-sort="${aria}"${c.num ? ' class="num"' : ''}>
      <button type="button" data-sort="${c.key}">${c.label}<span class="sort" aria-hidden="true">${active ? (sort.dir === 1 ? '▲' : '▼') : ''}</span></button>
    </th>`;
  }).join('') + '<th scope="col"><span class="sr-only">Aksi</span></th></tr>';

  const rows = visibleSponsors(store.sponsors, store.view);
  $('#count').textContent = rows.length === store.sponsors.length
    ? `${rows.length} sponsor`
    : `Menampilkan ${rows.length} dari ${store.sponsors.length} sponsor`;

  if (!rows.length) {
    $('#tbody').innerHTML = `<tr><td colspan="6" class="empty">Tidak ada sponsor yang cocok. Kosongkan pencarian atau pilih “Semua tahap”.</td></tr>`;
    return;
  }

  $('#tbody').innerHTML = rows.map((s) => `
    <tr>
      <td><span class="name">${esc(s.name)}</span><span class="contact">${esc(s.contact)}</span></td>
      <td>${s.tier}</td>
      <td class="num">${rupiah(s.amount)}</td>
      <td>
        <label class="sr-only" for="stage-${s.id}">Tahap untuk ${esc(s.name)}</label>
        <select id="stage-${s.id}" class="stage-select stage-select--${s.stage}" data-id="${s.id}">
          ${STAGES.map((st) => `<option value="${st}"${st === s.stage ? ' selected' : ''}>${STAGE_LABEL[st]}</option>`).join('')}
        </select>
      </td>
      <td class="follow">${followUpCell(s)}</td>
      <td class="actions"><button type="button" class="link" data-edit="${s.id}">Ubah<span class="sr-only"> ${esc(s.name)}</span></button></td>
    </tr>`).join('');
}

function render(): void {
  renderProgress();
  renderStages();
  renderTable();
}

/* ------------------------------------------------------------------
   Dialog
------------------------------------------------------------------- */

const dialog = $<HTMLDialogElement>('#dialog');
const form = $<HTMLFormElement>('#form');
const deleteBtn = $<HTMLButtonElement>('#delete');
let editingId: string | null = null;

$('#f-tier').innerHTML = TIERS.map((t) => `<option>${t}</option>`).join('');
$('#f-stage').innerHTML = STAGES.map((s) => `<option value="${s}">${STAGE_LABEL[s]}</option>`).join('');

function field<T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(name: string): T {
  return form.elements.namedItem(name) as T;
}

function openDialog(s?: Sponsor): void {
  editingId = s?.id ?? null;
  form.reset();
  form.querySelectorAll('.error').forEach((e) => (e.textContent = ''));
  $('#dialog-title').textContent = s ? `Ubah ${s.name}` : 'Tambah sponsor';
  $('#save').textContent = s ? 'Simpan perubahan' : 'Tambah sponsor';
  deleteBtn.hidden = !s;
  deleteBtn.textContent = 'Hapus sponsor';
  deleteBtn.dataset.confirm = '';
  if (s) {
    field<HTMLInputElement>('name').value = s.name;
    field<HTMLInputElement>('contact').value = s.contact;
    field<HTMLSelectElement>('tier').value = s.tier;
    field<HTMLInputElement>('amount').value = String(s.amount);
    field<HTMLSelectElement>('stage').value = s.stage;
    field<HTMLInputElement>('followUp').value = s.followUp;
    field<HTMLTextAreaElement>('notes').value = s.notes;
  }
  dialog.showModal();
  field<HTMLInputElement>('name').focus();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = field<HTMLInputElement>('name').value.trim();
  const amount = Number(field<HTMLInputElement>('amount').value);
  let ok = true;
  const setError = (id: string, msg: string) => { $(`#${id}`).textContent = msg; if (msg) ok = false; };
  setError('err-name', name ? '' : 'Isi nama sponsor.');
  setError('err-amount', Number.isFinite(amount) && amount > 0 ? '' : 'Isi nilai dalam rupiah, misalnya 2500000.');
  if (!ok) return;

  store.upsert({
    id: editingId ?? undefined,
    name,
    contact: field<HTMLInputElement>('contact').value.trim(),
    tier: field<HTMLSelectElement>('tier').value as Tier,
    amount: Math.round(amount),
    stage: field<HTMLSelectElement>('stage').value as Stage,
    followUp: field<HTMLInputElement>('followUp').value,
    notes: field<HTMLTextAreaElement>('notes').value.trim(),
  });
  dialog.close();
});

deleteBtn.addEventListener('click', () => {
  if (!editingId) return;
  if (!deleteBtn.dataset.confirm) {
    deleteBtn.dataset.confirm = 'yes';
    deleteBtn.textContent = 'Klik sekali lagi untuk menghapus';
    return;
  }
  store.remove(editingId);
  dialog.close();
});

$('#cancel').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

/* ------------------------------------------------------------------
   Events
------------------------------------------------------------------- */

document.addEventListener('click', (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>('[data-stage], [data-sort], [data-edit]');
  if (!target) return;
  if (target.dataset.stage) {
    const stage = target.dataset.stage;
    store.setView({ stage: stage as Stage | 'all' });
    document.querySelector<HTMLButtonElement>(`[data-stage="${stage}"]`)?.focus();
  } else if (target.dataset.sort) {
    const key = target.dataset.sort as SortKey;
    const { sort } = store.view;
    store.setView({ sort: { key, dir: sort.key === key ? (sort.dir === 1 ? -1 : 1) : key === 'amount' ? -1 : 1 } });
    document.querySelector<HTMLButtonElement>(`[data-sort="${key}"]`)?.focus();
  } else if (target.dataset.edit) {
    openDialog(store.find(target.dataset.edit));
  }
});

document.addEventListener('change', (e) => {
  const el = e.target as HTMLElement;
  if (el instanceof HTMLSelectElement && el.classList.contains('stage-select') && el.dataset.id) {
    store.setStage(el.dataset.id, el.value as Stage);
    $('#live').textContent = `Dipindahkan ke ${STAGE_LABEL[el.value as Stage]}.`;
    document.getElementById(el.id)?.focus();
  }
});

$<HTMLInputElement>('#search').addEventListener('input', (e) => {
  store.setView({ query: (e.target as HTMLInputElement).value });
});

$('#add').addEventListener('click', () => openDialog());

$('#export').addEventListener('click', () => {
  const rows = visibleSponsors(store.sponsors, store.view);
  const csv = toCsv([
    ['Sponsor', 'Kontak', 'Tingkat', 'Nilai (Rp)', 'Tahap', 'Tindak lanjut berikutnya', 'Catatan'],
    ...rows.map((s) => [s.name, s.contact, s.tier, s.amount, STAGE_LABEL[s.stage], s.followUp, s.notes]),
  ]);
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'daftar-sponsor.csv';
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 0);
});

$('#reset').addEventListener('click', () => {
  store.reset();
  $<HTMLInputElement>('#search').value = '';
  $('#live').textContent = 'Data contoh dikembalikan.';
});

$('#campaign').textContent = CAMPAIGN.name;
$('#target').textContent = `Target ${rupiah(CAMPAIGN.target)} sebelum ${shortDate(CAMPAIGN.eventDate)}`;

store.subscribe(render);
render();
