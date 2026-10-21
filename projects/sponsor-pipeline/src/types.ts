export const STAGES = ['prospect', 'proposal', 'negotiating', 'committed', 'received', 'declined'] as const;
export type Stage = (typeof STAGES)[number];

export const STAGE_LABEL: Record<Stage, string> = {
  prospect: 'Prospek',
  proposal: 'Proposal terkirim',
  negotiating: 'Negosiasi',
  committed: 'Berkomitmen',
  received: 'Dana diterima',
  declined: 'Ditolak',
};

export const TIERS = ['Platinum', 'Gold', 'Silver', 'Barang'] as const;
export type Tier = (typeof TIERS)[number];

export interface Sponsor {
  id: string;
  name: string;
  contact: string;
  tier: Tier;
  /** Pledged or expected amount in rupiah */
  amount: number;
  stage: Stage;
  /** ISO date of the next follow-up, or empty when none is planned */
  followUp: string;
  notes: string;
}

export type SortKey = 'name' | 'tier' | 'amount' | 'stage' | 'followUp';

export interface ViewState {
  query: string;
  stage: Stage | 'all';
  sort: { key: SortKey; dir: 1 | -1 };
}

export interface Campaign {
  name: string;
  target: number;
  eventDate: string;
}
