const rupiahFmt = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

/** Rp 15.000.000 */
export function rupiah(n: number): string {
  return rupiahFmt.format(n).replace(/ /g, ' ');
}

/** Rp 15 jt, Rp 2,5 jt: compact, as treasurers write it */
export function rupiahShort(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    const jt = n / 1_000_000;
    return 'Rp ' + jt.toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' jt';
  }
  return rupiah(n);
}

/** 27 Okt 2026, atau string kosong */
export function shortDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function toCsv(rows: (string | number)[][]): string {
  const cell = (v: string | number): string => {
    const s = String(v);
    return /[",\n;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return rows.map((r) => r.map(cell).join(',')).join('\n');
}
