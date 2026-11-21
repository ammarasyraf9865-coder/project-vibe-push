"use client";

import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { BookingStatus } from "@/lib/constants";

interface StatusBadgeProps {
  status: BookingStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "Diluluskan") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 whitespace-nowrap shrink-0">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
        <span>Diluluskan</span>
      </span>
    );
  }

  if (status === "Ditolak") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-800 whitespace-nowrap shrink-0">
        <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" aria-hidden="true" />
        <span>Ditolak</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 whitespace-nowrap shrink-0">
      <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" aria-hidden="true" />
      <span>Menunggu</span>
    </span>
  );
}
