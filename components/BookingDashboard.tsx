"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Check,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  ALL_ITEMS,
  BOOKING_STATUSES,
  PERALATAN_ITEMS,
  RUANG_ITEMS,
  getItemCategory,
  type BookingStatus,
  type ItemCategory,
  type TempahanRecord,
} from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import SummaryCards from "@/components/SummaryCards";
import BookingFormModal, {
  type BookingFormValues,
} from "@/components/BookingFormModal";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import ToastContainer, { type ToastItem } from "@/components/ToastContainer";

function getLocalIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const emptySubscribe = () => () => {};

function formatDisplayDate(isoDate: string): string {
  const datePart = isoDate.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return datePart;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("ms-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default function BookingDashboard() {
  const [bookings, setBookings] = useState<TempahanRecord[]>([]);
  const todayIso = useSyncExternalStore(
    emptySubscribe,
    getLocalIsoDate,
    () => ""
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState<"Semua" | ItemCategory>(
    "Semua"
  );
  const [itemFilter, setItemFilter] = useState<string>("Semua");
  const [statusFilter, setStatusFilter] = useState<"Semua" | BookingStatus>(
    "Semua"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<TempahanRecord | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [deletingRecord, setDeletingRecord] = useState<TempahanRecord | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [updatingRowId, setUpdatingRowId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastCounterRef = useRef<number>(1);

  const pushToast = useCallback(
    (type: "success" | "error", message: string) => {
      const id = toastCounterRef.current++;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const fetchBookings = useCallback(async (showSpinner = true) => {
    if (showSpinner) {
      setIsLoading(true);
    }
    setFetchError(null);
    try {
      const response = await fetch("/api/tempahan", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload?.error ?? "Gagal mendapatkan senarai tempahan."
        );
      }
      setBookings(Array.isArray(payload) ? payload : []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ralat rangkaian semasa memuatkan rekod tempahan.";
      setFetchError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await fetch("/api/tempahan", { cache: "no-store" });
        const payload = await response.json();
        if (!active) return;
        if (!response.ok) {
          throw new Error(
            payload?.error ?? "Gagal mendapatkan senarai tempahan."
          );
        }
        setBookings(Array.isArray(payload) ? payload : []);
        setFetchError(null);
      } catch (error) {
        if (!active) return;
        const message =
          error instanceof Error
            ? error.message
            : "Ralat rangkaian semasa memuatkan rekod tempahan.";
        setFetchError(message);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const availableItemOptions = useMemo(() => {
    if (categoryFilter === "Ruang") return [...RUANG_ITEMS];
    if (categoryFilter === "Peralatan") return [...PERALATAN_ITEMS];
    return [...ALL_ITEMS];
  }, [categoryFilter]);

  const handleCategoryChange = (nextCategory: "Semua" | ItemCategory) => {
    setCategoryFilter(nextCategory);
    if (
      itemFilter !== "Semua" &&
      nextCategory !== "Semua" &&
      getItemCategory(itemFilter) !== nextCategory
    ) {
      setItemFilter("Semua");
    }
  };

  const resetFilters = () => {
    setCategoryFilter("Semua");
    setItemFilter("Semua");
    setStatusFilter("Semua");
    setSearchQuery("");
  };

  const hasActiveFilters =
    categoryFilter !== "Semua" ||
    itemFilter !== "Semua" ||
    statusFilter !== "Semua" ||
    searchQuery.trim() !== "";

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return bookings.filter((booking) => {
      if (
        categoryFilter !== "Semua" &&
        getItemCategory(booking.item_tempahan) !== categoryFilter
      ) {
        return false;
      }
      if (itemFilter !== "Semua" && booking.item_tempahan !== itemFilter) {
        return false;
      }
      if (statusFilter !== "Semua" && booking.status !== statusFilter) {
        return false;
      }
      if (query && !booking.nama_pemohon.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  }, [bookings, categoryFilter, itemFilter, statusFilter, searchQuery]);

  const openCreateModal = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const openEditModal = (record: TempahanRecord) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: BookingFormValues) => {
    setIsSubmitting(true);
    try {
      if (editingRecord) {
        const response = await fetch(`/api/tempahan/${editingRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Gagal mengemaskini tempahan.");
        }
        setBookings((prev) =>
          prev.map((item) => (item.id === editingRecord.id ? payload : item))
        );
        pushToast("success", "Rekod tempahan berjaya dikemaskini.");
      } else {
        const response = await fetch("/api/tempahan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error ?? "Gagal menambah tempahan baharu.");
        }
        setBookings((prev) => [payload, ...prev]);
        pushToast("success", "Tempahan baharu berjaya didaftarkan.");
      }
      setIsFormOpen(false);
      setEditingRecord(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Berlaku ralat semasa menyimpan data.";
      pushToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatus = async (
    record: TempahanRecord,
    nextStatus: "Diluluskan" | "Ditolak"
  ) => {
    if (record.status === nextStatus) return;
    setUpdatingRowId(record.id);
    try {
      const response = await fetch(`/api/tempahan/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Gagal mengemaskini status.");
      }
      setBookings((prev) =>
        prev.map((item) => (item.id === record.id ? payload : item))
      );
      pushToast(
        "success",
        nextStatus === "Diluluskan"
          ? `Tempahan ${record.nama_pemohon} telah diluluskan.`
          : `Tempahan ${record.nama_pemohon} telah ditolak.`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal menukar status tempahan.";
      pushToast("error", message);
    } finally {
      setUpdatingRowId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tempahan/${deletingRecord.id}`, {
        method: "DELETE",
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error ?? "Gagal memadam tempahan.");
      }
      setBookings((prev) =>
        prev.filter((item) => item.id !== deletingRecord.id)
      );
      pushToast(
        "success",
        `Tempahan ${deletingRecord.nama_pemohon} telah dipadam.`
      );
      setDeletingRecord(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Berlaku ralat semasa memadam rekod.";
      pushToast("error", message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              resetFilters();
            }}
            className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 sm:text-lg"
          >
            Sistem Tempahan Kampus
          </a>

          <nav
            aria-label="Paparan pantas"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <button
              type="button"
              onClick={resetFilters}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                !hasActiveFilters
                  ? "text-slate-900 underline decoration-blue-700 decoration-2 underline-offset-8"
                  : ""
              }`}
            >
              Semua Rekod
            </button>
            <button
              type="button"
              onClick={() => {
                handleCategoryChange("Ruang");
                setStatusFilter("Semua");
              }}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                categoryFilter === "Ruang" && statusFilter === "Semua"
                  ? "text-slate-900 underline decoration-blue-700 decoration-2 underline-offset-8"
                  : ""
              }`}
            >
              Ruang
            </button>
            <button
              type="button"
              onClick={() => {
                handleCategoryChange("Peralatan");
                setStatusFilter("Semua");
              }}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                categoryFilter === "Peralatan" && statusFilter === "Semua"
                  ? "text-slate-900 underline decoration-blue-700 decoration-2 underline-offset-8"
                  : ""
              }`}
            >
              Peralatan
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter("Semua");
                setItemFilter("Semua");
                setStatusFilter("Menunggu");
              }}
              className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 ${
                statusFilter === "Menunggu"
                  ? "text-slate-900 underline decoration-blue-700 decoration-2 underline-offset-8"
                  : ""
              }`}
            >
              Menunggu
            </button>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Tempahan Baru</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 text-balance sm:text-3xl">
              Resource Booking System
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Sistem Tempahan Ruang &amp; Peralatan — Bilik perbincangan, makmal
              komputer serta peralatan studio dan sukan kampus.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchBookings()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-60 whitespace-nowrap shrink-0 sm:self-auto"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            <span>Muat Semula</span>
          </button>
        </div>

        <SummaryCards
          bookings={bookings}
          todayIso={todayIso}
          isLoading={isLoading}
        />

        {fetchError && (
          <div
            role="alert"
            className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold">Sambungan pangkalan data tergendala</p>
              <p className="mt-0.5 text-xs text-rose-800">{fetchError}</p>
            </div>
            <button
              type="button"
              onClick={() => void fetchBookings()}
              className="inline-flex items-center gap-1.5 self-start rounded-lg border border-rose-300 bg-white px-3.5 py-2 text-xs font-medium text-rose-800 transition-colors hover:bg-rose-100 whitespace-nowrap shrink-0 sm:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Cuba Lagi</span>
            </button>
          </div>
        )}

        <section
          aria-label="Penapis dan Senarai Tempahan"
          className="rounded-xl border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
              <div className="md:col-span-4">
                <label
                  htmlFor="search-pemohon"
                  className="block text-xs font-medium text-slate-600"
                >
                  Cari Pemohon
                </label>
                <div className="relative mt-1.5">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    id="search-pemohon"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama pemohon..."
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
                  />
                </div>
              </div>

              <div className="md:col-span-3">
                <label
                  htmlFor="filter-jenis"
                  className="block text-xs font-medium text-slate-600"
                >
                  Jenis Item
                </label>
                <select
                  id="filter-jenis"
                  value={categoryFilter}
                  onChange={(e) =>
                    handleCategoryChange(
                      e.target.value as "Semua" | ItemCategory
                    )
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
                >
                  <option value="Semua">Semua Jenis (Ruang &amp; Peralatan)</option>
                  <option value="Ruang">Ruang</option>
                  <option value="Peralatan">Peralatan</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label
                  htmlFor="filter-item"
                  className="block text-xs font-medium text-slate-600"
                >
                  Item Spesifik
                </label>
                <select
                  id="filter-item"
                  value={itemFilter}
                  onChange={(e) => setItemFilter(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700/15"
                >
                  <option value="Semua">Semua Item</option>
                  {availableItemOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="filter-status"
                  className="block text-xs font-medium text-slate-600"
                >
                  Status
                </label>
                <select
                  id="filter-status"
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as "Semua" | BookingStatus)
                  }
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none focus:ring-2 focus-visible:outline-none focus:ring-blue-700/15"
                >
                  <option value="Semua">Semua Status</option>
                  {BOOKING_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <p className="tabular-nums">
                Menunjukkan{" "}
                <span className="font-semibold text-slate-800">
                  {filteredBookings.length}
                </span>{" "}
                daripada{" "}
                <span className="font-semibold text-slate-800">
                  {bookings.length}
                </span>{" "}
                rekod tempahan
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Set Semula Penapis</span>
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="divide-y divide-slate-100 p-4 sm:p-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 py-3.5"
                >
                  <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
                  <div className="hidden h-4 w-36 animate-pulse rounded bg-slate-100 sm:block" />
                  <div className="hidden h-4 w-24 animate-pulse rounded bg-slate-100 md:block" />
                  <div className="h-6 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-8 w-32 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm font-semibold text-slate-900">
                {bookings.length === 0
                  ? "Belum ada rekod tempahan"
                  : "Tiada tempahan sepadan dengan penapis"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {bookings.length === 0
                  ? "Mulakan dengan menambah permohonan tempahan ruang atau peralatan baharu."
                  : "Cuba ubah pilihan jenis item, item spesifik, atau kata carian anda."}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap"
                  >
                    Set Semula Penapis
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-800 whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Tambah Tempahan Pertama</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Data Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                      <th className="py-3 pr-3 pl-5 whitespace-nowrap">ID</th>
                      <th className="px-3 py-3 whitespace-nowrap">Pemohon</th>
                      <th className="px-3 py-3 whitespace-nowrap">
                        Item Tempahan
                      </th>
                      <th className="px-3 py-3 whitespace-nowrap">Tarikh</th>
                      <th className="px-3 py-3 whitespace-nowrap">Slot Masa</th>
                      <th className="px-3 py-3 whitespace-nowrap">Status</th>
                      <th className="py-3 pr-5 pl-3 text-right whitespace-nowrap">
                        Tindakan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBookings.map((booking) => {
                      const category = getItemCategory(booking.item_tempahan);
                      const isRowUpdating = updatingRowId === booking.id;
                      const isToday =
                        todayIso !== "" &&
                        booking.tarikh.slice(0, 10) === todayIso;

                      return (
                        <tr
                          key={booking.id}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="py-3.5 pr-3 pl-5 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                            #{String(booking.id).padStart(3, "0")}
                          </td>

                          <td className="px-3 py-3.5 font-medium text-slate-900">
                            <span className="block max-w-[200px] truncate">
                              {booking.nama_pemohon}
                            </span>
                          </td>

                          <td className="px-3 py-3.5">
                            <p className="font-medium text-slate-800 whitespace-nowrap">
                              {booking.item_tempahan}
                            </p>
                            <p className="text-xs text-slate-500">{category}</p>
                          </td>

                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <span className="font-mono text-xs text-slate-800 tabular-nums">
                              {formatDisplayDate(booking.tarikh)}
                            </span>
                            {isToday && (
                              <span className="ml-2 text-xs font-medium text-blue-700">
                                · Hari Ini
                              </span>
                            )}
                          </td>

                          <td className="px-3 py-3.5 font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                            {booking.slot_masa}
                          </td>

                          <td className="px-3 py-3.5 whitespace-nowrap">
                            <StatusBadge status={booking.status} />
                          </td>

                          <td className="py-3.5 pr-5 pl-3 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleQuickStatus(booking, "Diluluskan")
                                }
                                disabled={
                                  isRowUpdating ||
                                  booking.status === "Diluluskan"
                                }
                                title="Luluskan permohonan"
                                className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap"
                              >
                                <Check
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                <span>Lulus</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  void handleQuickStatus(booking, "Ditolak")
                                }
                                disabled={
                                  isRowUpdating || booking.status === "Ditolak"
                                }
                                title="Tolak permohonan"
                                className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-medium text-rose-800 transition-colors hover:bg-rose-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap"
                              >
                                <X
                                  className="h-3.5 w-3.5"
                                  aria-hidden="true"
                                />
                                <span>Tolak</span>
                              </button>

                              <span
                                className="mx-1 h-4 w-px bg-slate-200"
                                aria-hidden="true"
                              />

                              <button
                                type="button"
                                onClick={() => openEditModal(booking)}
                                aria-label={`Edit tempahan ${booking.nama_pemohon}`}
                                title="Edit tempahan"
                                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingRecord(booking)}
                                aria-label={`Padam tempahan ${booking.nama_pemohon}`}
                                title="Padam tempahan"
                                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-1.5 text-slate-600 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="divide-y divide-slate-200 md:hidden">
                {filteredBookings.map((booking) => {
                  const category = getItemCategory(booking.item_tempahan);
                  const isRowUpdating = updatingRowId === booking.id;
                  const isToday =
                    todayIso !== "" && booking.tarikh.slice(0, 10) === todayIso;

                  return (
                    <div key={booking.id} className="space-y-3 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-slate-500 tabular-nums">
                            #{String(booking.id).padStart(3, "0")}
                            <span className="mx-1.5" aria-hidden="true">
                              ·
                            </span>
                            <span>{category}</span>
                          </p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                            {booking.nama_pemohon}
                          </p>
                          <p className="text-xs font-medium text-slate-700">
                            {booking.item_tempahan}
                          </p>
                        </div>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
                        <span className="font-mono tabular-nums">
                          {formatDisplayDate(booking.tarikh)}
                        </span>
                        {isToday && (
                          <span className="font-medium text-blue-700">
                            (Hari Ini)
                          </span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {booking.slot_masa}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() =>
                            void handleQuickStatus(booking, "Diluluskan")
                          }
                          disabled={
                            isRowUpdating || booking.status === "Diluluskan"
                          }
                          className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 disabled:opacity-45 whitespace-nowrap"
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Lulus</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void handleQuickStatus(booking, "Ditolak")
                          }
                          disabled={
                            isRowUpdating || booking.status === "Ditolak"
                          }
                          className="inline-flex min-h-[40px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-800 transition-colors hover:bg-rose-100 disabled:opacity-45 whitespace-nowrap"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Tolak</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(booking)}
                          aria-label={`Edit tempahan ${booking.nama_pemohon}`}
                          className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingRecord(booking)}
                          aria-label={`Padam tempahan ${booking.nama_pemohon}`}
                          className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      <BookingFormModal
        isOpen={isFormOpen}
        editingRecord={editingRecord}
        defaultDate={todayIso || "2026-11-20"}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (!isSubmitting) {
            setIsFormOpen(false);
            setEditingRecord(null);
          }
        }}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        record={deletingRecord}
        isDeleting={isDeleting}
        onCancel={() => !isDeleting && setDeletingRecord(null)}
        onConfirm={handleConfirmDelete}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
