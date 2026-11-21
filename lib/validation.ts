import {
  ALL_ITEMS,
  BOOKING_STATUSES,
  TIME_SLOTS,
  type BookingStatus,
} from "@/lib/constants";

export interface ValidatedTempahanCreate {
  nama_pemohon: string;
  item_tempahan: string;
  tarikh: Date;
  slot_masa: string;
  status: BookingStatus;
}

export interface ValidatedTempahanPatch {
  nama_pemohon?: string;
  item_tempahan?: string;
  tarikh?: Date;
  slot_masa?: string;
  status?: BookingStatus;
}

export function parseBookingDate(input: unknown): Date | null {
  if (typeof input !== "string" || input.trim() === "") {
    return null;
  }

  const trimmed = input.trim();
  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]);
    const day = Number(dateOnlyMatch[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    ) {
      return date;
    }
    return null;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate())
  );
}

export function validateCreatePayload(
  body: unknown
): { data?: ValidatedTempahanCreate; error?: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Format data permintaan tidak sah." };
  }

  const record = body as Record<string, unknown>;

  if (typeof record.nama_pemohon !== "string") {
    return { error: "Nama pemohon wajib diisi." };
  }
  const namaPemohon = record.nama_pemohon.trim();
  if (namaPemohon.length < 2 || namaPemohon.length > 120) {
    return { error: "Nama pemohon mestilah antara 2 hingga 120 aksara." };
  }

  if (
    typeof record.item_tempahan !== "string" ||
    !ALL_ITEMS.includes(record.item_tempahan)
  ) {
    return { error: "Item tempahan yang dipilih tidak sah." };
  }

  const parsedDate = parseBookingDate(record.tarikh);
  if (!parsedDate) {
    return { error: "Tarikh tempahan tidak sah." };
  }

  if (
    typeof record.slot_masa !== "string" ||
    !(TIME_SLOTS as readonly string[]).includes(record.slot_masa)
  ) {
    return { error: "Slot masa yang dipilih tidak sah." };
  }

  let status: BookingStatus = "Menunggu";
  if (record.status !== undefined) {
    if (
      typeof record.status !== "string" ||
      !(BOOKING_STATUSES as readonly string[]).includes(record.status)
    ) {
      return { error: "Status tempahan tidak sah." };
    }
    status = record.status as BookingStatus;
  }

  return {
    data: {
      nama_pemohon: namaPemohon,
      item_tempahan: record.item_tempahan,
      tarikh: parsedDate,
      slot_masa: record.slot_masa,
      status,
    },
  };
}

export function validatePatchPayload(
  body: unknown
): { data?: ValidatedTempahanPatch; error?: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "Format data kemaskini tidak sah." };
  }

  const record = body as Record<string, unknown>;
  const data: ValidatedTempahanPatch = {};

  if (record.nama_pemohon !== undefined) {
    if (typeof record.nama_pemohon !== "string") {
      return { error: "Nama pemohon mestilah teks yang sah." };
    }
    const trimmed = record.nama_pemohon.trim();
    if (trimmed.length < 2 || trimmed.length > 120) {
      return { error: "Nama pemohon mestilah antara 2 hingga 120 aksara." };
    }
    data.nama_pemohon = trimmed;
  }

  if (record.item_tempahan !== undefined) {
    if (
      typeof record.item_tempahan !== "string" ||
      !ALL_ITEMS.includes(record.item_tempahan)
    ) {
      return { error: "Item tempahan yang dipilih tidak sah." };
    }
    data.item_tempahan = record.item_tempahan;
  }

  if (record.tarikh !== undefined) {
    const parsedDate = parseBookingDate(record.tarikh);
    if (!parsedDate) {
      return { error: "Tarikh tempahan tidak sah." };
    }
    data.tarikh = parsedDate;
  }

  if (record.slot_masa !== undefined) {
    if (
      typeof record.slot_masa !== "string" ||
      !(TIME_SLOTS as readonly string[]).includes(record.slot_masa)
    ) {
      return { error: "Slot masa yang dipilih tidak sah." };
    }
    data.slot_masa = record.slot_masa;
  }

  if (record.status !== undefined) {
    if (
      typeof record.status !== "string" ||
      !(BOOKING_STATUSES as readonly string[]).includes(record.status)
    ) {
      return { error: "Status tempahan tidak sah." };
    }
    data.status = record.status as BookingStatus;
  }

  if (Object.keys(data).length === 0) {
    return { error: "Tiada medan sah diberikan untuk dikemaskini." };
  }

  return { data };
}
