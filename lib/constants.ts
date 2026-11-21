export type ItemCategory = "Ruang" | "Peralatan";

export type BookingStatus = "Menunggu" | "Diluluskan" | "Ditolak";

export interface BookingItemOption {
  name: string;
  category: ItemCategory;
}

export const RUANG_ITEMS = [
  "Bilik Perbincangan 1",
  "Bilik Perbincangan 2",
  "Makmal Komputer 1",
  "Makmal Komputer 2",
] as const;

export const PERALATAN_ITEMS = [
  "Kamera DSLR",
  "Tripod",
  "Bola Futsal",
  "Raket Badminton",
] as const;

export const ALL_ITEMS: readonly string[] = [
  ...RUANG_ITEMS,
  ...PERALATAN_ITEMS,
];

export const ITEM_CATALOG: readonly BookingItemOption[] = [
  ...RUANG_ITEMS.map((name) => ({ name, category: "Ruang" as const })),
  ...PERALATAN_ITEMS.map((name) => ({ name, category: "Peralatan" as const })),
];

export const TIME_SLOTS = [
  "8:00-10:00",
  "10:00-12:00",
  "14:00-16:00",
  "16:00-18:00",
] as const;

export const BOOKING_STATUSES: readonly BookingStatus[] = [
  "Menunggu",
  "Diluluskan",
  "Ditolak",
];

export function getItemCategory(itemName: string): ItemCategory {
  if ((RUANG_ITEMS as readonly string[]).includes(itemName)) {
    return "Ruang";
  }
  return "Peralatan";
}

export interface TempahanRecord {
  id: number;
  nama_pemohon: string;
  item_tempahan: string;
  tarikh: string;
  slot_masa: string;
  status: BookingStatus;
  createdAt: string;
}
