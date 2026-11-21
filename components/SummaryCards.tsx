"use client";

import { CalendarCheck2, CheckCircle2, Clock } from "lucide-react";
import { getItemCategory, type TempahanRecord } from "@/lib/constants";

interface SummaryCardsProps {
  bookings: TempahanRecord[];
  todayIso: string;
  isLoading: boolean;
}

export default function SummaryCards({
  bookings,
  todayIso,
  isLoading,
}: SummaryCardsProps) {
  const todayBookings = bookings.filter(
    (item) => item.tarikh.slice(0, 10) === todayIso
  );
  const todayRuang = todayBookings.filter(
    (item) => getItemCategory(item.item_tempahan) === "Ruang"
  ).length;
  const todayPeralatan = todayBookings.length - todayRuang;

  const pendingCount = bookings.filter(
    (item) => item.status === "Menunggu"
  ).length;
  const approvedCount = bookings.filter(
    (item) => item.status === "Diluluskan"
  ).length;

  return (
    <section
      aria-label="Ringkasan Tempahan"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-600">
            Tempahan Hari Ini
          </p>
          <CalendarCheck2
            className="h-4 w-4 text-blue-700 shrink-0"
            aria-hidden="true"
          />
        </div>
        {isLoading ? (
          <div className="mt-3 h-9 w-16 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
            {todayBookings.length}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500 tabular-nums">
          <span>{todayRuang} Ruang</span>
          <span className="mx-1.5" aria-hidden="true">
            ·
          </span>
          <span>{todayPeralatan} Peralatan</span>
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-600">
            Permohonan Menunggu
          </p>
          <Clock
            className="h-4 w-4 text-amber-600 shrink-0"
            aria-hidden="true"
          />
        </div>
        {isLoading ? (
          <div className="mt-3 h-9 w-16 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-amber-700 tabular-nums">
            {pendingCount}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500">
          Menunggu semakan &amp; kelulusan pentadbir
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-600">
            Tempahan Diluluskan
          </p>
          <CheckCircle2
            className="h-4 w-4 text-emerald-600 shrink-0"
            aria-hidden="true"
          />
        </div>
        {isLoading ? (
          <div className="mt-3 h-9 w-16 animate-pulse rounded bg-slate-100" />
        ) : (
          <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-emerald-700 tabular-nums">
            {approvedCount}
          </p>
        )}
        <p className="mt-2 text-xs text-slate-500 tabular-nums">
          Daripada {bookings.length} jumlah rekod tempahan
        </p>
      </div>
    </section>
  );
}
