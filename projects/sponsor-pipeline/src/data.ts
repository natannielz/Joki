import type { Campaign, Sponsor } from './types';

// Semua usaha dan orang di bawah ini fiktif.
export const CAMPAIGN: Campaign = {
  name: 'Perayaan Natal 2026',
  target: 45_000_000,
  eventDate: '2026-12-12',
};

export const SEED: Sponsor[] = [
  { id: 's1', name: 'PT Sinar Digital Nusantara', contact: 'Bpk. Hendra (HR)', tier: 'Platinum', amount: 15_000_000, stage: 'committed', followUp: '2026-10-27', notes: 'Minta logo di banner panggung utama.' },
  { id: 's2', name: 'Toko Buku Pelita', contact: 'Ibu Ratna', tier: 'Silver', amount: 2_500_000, stage: 'received', followUp: '', notes: 'Dibayar lewat transfer 8 Okt.' },
  { id: 's3', name: 'Roti Sejahtera Bakery', contact: 'Ko Andreas', tier: 'Barang', amount: 3_000_000, stage: 'received', followUp: '', notes: 'Snack box untuk 300 tamu.' },
  { id: 's4', name: 'Bimbel Cerdas Mandiri', contact: 'Kak Yosua', tier: 'Gold', amount: 7_500_000, stage: 'negotiating', followUp: '2026-10-23', notes: 'Meminta booth di pintu masuk.' },
  { id: 's5', name: 'Apotek Sehat Sentosa', contact: 'Ibu Linda', tier: 'Silver', amount: 2_500_000, stage: 'proposal', followUp: '2026-10-24', notes: '' },
  { id: 's6', name: 'Alumni Angkatan 2019–2022', contact: 'Bang Samuel', tier: 'Gold', amount: 8_000_000, stage: 'received', followUp: '', notes: 'Terkumpul dari 41 alumni.' },
  { id: 's7', name: 'CV Maju Bersama Printing', contact: 'Pak Rudi', tier: 'Barang', amount: 4_000_000, stage: 'committed', followUp: '2026-11-02', notes: 'Mencetak banner dan buku acara.' },
  { id: 's8', name: 'Teras Kopi Bintaro', contact: 'Mas Dimas', tier: 'Silver', amount: 2_000_000, stage: 'prospect', followUp: '2026-10-28', notes: 'Bertemu di bazar kampus.' },
  { id: 's9', name: 'Optik Terang Jaya', contact: 'Ibu Melati', tier: 'Silver', amount: 2_500_000, stage: 'declined', followUp: '', notes: 'Anggaran tahun ini sudah habis.' },
  { id: 's10', name: 'Damai Sejahtera Travel', contact: 'Pak Yohanes', tier: 'Gold', amount: 7_500_000, stage: 'proposal', followUp: '2026-10-30', notes: '' },
  { id: 's11', name: 'Laundry Kilat 24', contact: 'Mbak Sari', tier: 'Silver', amount: 1_500_000, stage: 'prospect', followUp: '2026-11-04', notes: '' },
];
