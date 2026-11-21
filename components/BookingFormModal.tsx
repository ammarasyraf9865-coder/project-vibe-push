"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, X } from "lucide-react";
import {
  BOOKING_STATUSES,
  PERALATAN_ITEMS,
  RUANG_ITEMS,
  TIME_SLOTS,
  type BookingStatus,
  type TempahanRecord,
} from "@/lib/constants";

export interface BookingFormValues {
  nama_pemohon: string;
  item_tempahan: string;
  tarikh: string;
  slot_masa: string;
  status: BookingStatus;
}

interface BookingFormModalProps {
  isOpen: boolean;
  editingRecord: TempahanRecord | null;
  defaultDate: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: BookingFormValues) => Promise<void>;
}

interface InnerFormProps {
  editingRecord: TempahanRecord | null;
  defaultDate: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: BookingFormValues) => Promise<void>;
}

function BookingFormContent({
  editingRecord,
  defaultDate,
  isSubmitting,
  onClose,
  onSubmit,
}: InnerFormProps) {
  const [namaPemohon, setNamaPemohon] = useState(
    editingRecord?.nama_pemohon ?? ""
  );
  const [itemTempahan, setItemTempahan] = useState<string>(
    editingRecord?.item_tempahan ?? RUANG_ITEMS[0]
  );
  const [tarikh, setTarikh] = useState(
    editingRecord ? editingRecord.tarikh.slice(0, 10) : defaultDate
  );
  const [slotMasa, setSlotMasa] = useState<string>(
    editingRecord?.slot_masa ?? TIME_SLOTS[0]
  );
  const [status, setStatus] = useState<BookingStatus>(
    editingRecord?.status ?? "Menunggu"
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSubmitting, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = namaPemohon.trim();
    if (trimmedName.length < 2) {
      setFormError("Sila masukkan nama pemohon sekurang-kurangnya 2 aksara.");
      return;
    }
    if (!tarikh) {
      setFormError("Sila pilih tarikh tempahan.");
      return;
    }
    setFormError(null);
    await onSubmit({
      nama_pemohon: trimmedName,
      item_tempahan: itemTempahan,
      tarikh,
      slot_masa: slotMasa,
      status,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 8 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
    >
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2
            id="booking-modal-title"
            className="text-lg font-semibold text-slate-900"
          >
            {editingRecord ? "Kemaskini Tempahan" : "Tempahan Baru"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {editingRecord
              ? `Mengubah rekod #${String(editingRecord.id).padStart(3, "0")}`
              : "Isi maklumat ruang atau peralatan untuk membuat tempahan."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          aria-label="Tutup modal"
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {formError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-800"
          >
            {formError}
          </div>
        )}

        <div>
          <label
            htmlFor="nama_pemohon"
            className="block text-sm font-medium text-slate-700"
          >
            Nama Pemohon
          </label>
          <input
            id="nama_pemohon"
            name="nama_pemohon"
            type="text"
            required
            maxLength={120}
            value={namaPemohon}
            onChange={(e) => setNamaPemohon(e.target.value)}
            placeholder="Contoh: Ahmad Danish Hakim"
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
          />
        </div>

        <div>
          <label
            htmlFor="item_tempahan"
            className="block text-sm font-medium text-slate-700"
          >
            Ruang / Peralatan
          </label>
          <select
            id="item_tempahan"
            name="item_tempahan"
            value={itemTempahan}
            onChange={(e) => setItemTempahan(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
          >
            <optgroup label="Ruang">
              {RUANG_ITEMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </optgroup>
            <optgroup label="Peralatan">
              {PERALATAN_ITEMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="tarikh"
              className="block text-sm font-medium text-slate-700"
            >
              Tarikh
            </label>
            <input
              id="tarikh"
              name="tarikh"
              type="date"
              required
              value={tarikh}
              onChange={(e) => setTarikh(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
            />
          </div>

          <div>
            <label
              htmlFor="slot_masa"
              className="block text-sm font-medium text-slate-700"
            >
              Slot Masa
            </label>
            <select
              id="slot_masa"
              name="slot_masa"
              value={slotMasa}
              onChange={(e) => setSlotMasa(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
            >
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {editingRecord && (
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-700"
            >
              Status Kelulusan
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
            >
              {BOOKING_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50 whitespace-nowrap"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60 whitespace-nowrap"
          >
            {isSubmitting && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            <span>
              {editingRecord ? "Simpan Perubahan" : "Hantar Tempahan"}
            </span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}

export default function BookingFormModal({
  isOpen,
  editingRecord,
  defaultDate,
  isSubmitting,
  onClose,
  onSubmit,
}: BookingFormModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !isSubmitting && onClose()}
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
          />

          <BookingFormContent
            key={editingRecord ? `edit-${editingRecord.id}` : "create-new"}
            editingRecord={editingRecord}
            defaultDate={defaultDate}
            isSubmitting={isSubmitting}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        </div>
      )}
    </AnimatePresence>
  );
}
