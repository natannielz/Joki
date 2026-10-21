import { SEED } from './data';
import { STAGES, TIERS, type Sponsor, type Stage, type ViewState } from './types';

const KEY = 'sponsor-pipeline:v2';

type Listener = () => void;

function isSponsor(x: unknown): x is Sponsor {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Record<string, unknown>;
  return typeof s.id === 'string'
    && typeof s.name === 'string'
    && typeof s.amount === 'number'
    && STAGES.includes(s.stage as Stage)
    && (TIERS as readonly string[]).includes(s.tier as string);
}

function load(): Sponsor[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(SEED);
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.every(isSponsor)) return parsed;
  } catch {
    // blocked or corrupt storage: start from the seed
  }
  return structuredClone(SEED);
}

export class Store {
  sponsors: Sponsor[] = load();
  view: ViewState = { query: '', stage: 'all', sort: { key: 'followUp', dir: 1 } };
  private listeners: Listener[] = [];

  subscribe(fn: Listener): void {
    this.listeners.push(fn);
  }

  private commit(persist = true): void {
    if (persist) {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.sponsors));
      } catch {
        // the app keeps working for this visit
      }
    }
    this.listeners.forEach((fn) => fn());
  }

  upsert(input: Omit<Sponsor, 'id'> & { id?: string }): void {
    if (input.id) {
      this.sponsors = this.sponsors.map((s) => (s.id === input.id ? { ...s, ...input, id: s.id } : s));
    } else {
      const id = 's' + (Date.now().toString(36) + Math.random().toString(36).slice(2, 6));
      this.sponsors = [...this.sponsors, { ...input, id }];
    }
    this.commit();
  }

  setStage(id: string, stage: Stage): void {
    this.sponsors = this.sponsors.map((s) => (s.id === id ? { ...s, stage } : s));
    this.commit();
  }

  remove(id: string): void {
    this.sponsors = this.sponsors.filter((s) => s.id !== id);
    this.commit();
  }

  reset(): void {
    this.sponsors = structuredClone(SEED);
    this.view = { query: '', stage: 'all', sort: { key: 'followUp', dir: 1 } };
    this.commit();
  }

  setView(patch: Partial<ViewState>): void {
    this.view = { ...this.view, ...patch };
    this.commit(false);
  }

  find(id: string): Sponsor | undefined {
    return this.sponsors.find((s) => s.id === id);
  }
}

/* ---------- derived values ---------- */

export interface Totals {
  received: number;
  committed: number;
  open: number;
  byStage: Record<Stage, { count: number; amount: number }>;
}

export function totals(sponsors: Sponsor[]): Totals {
  const byStage = Object.fromEntries(STAGES.map((s) => [s, { count: 0, amount: 0 }])) as Totals['byStage'];
  for (const s of sponsors) {
    byStage[s.stage].count += 1;
    byStage[s.stage].amount += s.amount;
  }
  return {
    received: byStage.received.amount,
    committed: byStage.committed.amount,
    open: byStage.prospect.amount + byStage.proposal.amount + byStage.negotiating.amount,
    byStage,
  };
}

const TIER_ORDER: Record<string, number> = { Platinum: 0, Gold: 1, Silver: 2, Barang: 3 };

export function visibleSponsors(sponsors: Sponsor[], view: ViewState): Sponsor[] {
  const q = view.query.trim().toLowerCase();
  const rows = sponsors.filter((s) =>
    (view.stage === 'all' || s.stage === view.stage) &&
    (!q || s.name.toLowerCase().includes(q) || s.contact.toLowerCase().includes(q) || s.notes.toLowerCase().includes(q)),
  );
  const { key, dir } = view.sort;
  return rows.sort((a, b) => {
    let cmp: number;
    switch (key) {
      case 'amount': cmp = a.amount - b.amount; break;
      case 'tier': cmp = TIER_ORDER[a.tier] - TIER_ORDER[b.tier]; break;
      case 'stage': cmp = STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage); break;
      case 'followUp':
        // rows without a follow-up date sink to the bottom
        cmp = (a.followUp || '9999') < (b.followUp || '9999') ? -1 : (a.followUp || '9999') > (b.followUp || '9999') ? 1 : 0;
        break;
      default: cmp = a.name.localeCompare(b.name, 'id');
    }
    return cmp * dir || a.name.localeCompare(b.name, 'id');
  });
}
