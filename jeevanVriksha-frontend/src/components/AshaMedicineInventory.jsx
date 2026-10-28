import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AshaNavbar from "../components/AshaNavbar";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  History,
  LoaderCircle,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";

import {
  getMyMedicineStock,
  cacheMedicineStock,
  getCachedMedicineStock,
} from "../services/medicineService";

const API = import.meta.env.VITE_API_URL;
const LOW_STOCK_LIMIT = 20;

const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}")?.token;
  } catch {
    return null;
  }
};

const getMedicineName = (item) =>
  item.medicineId?.name || item.name || "Unknown medicine";

const getDosage = (item) =>
  item.medicineId?.dosage || item.dosage || "Not specified";

const getPatientName = (item) =>
  item.patientId?.name || "Patient details unavailable";

const formatDate = (value) => {
  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AshaMedicineInventory() {
  const navigate = useNavigate();

  const [stock, setStock] = useState([]);
  const [distributions, setDistributions] = useState([]);

  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [stockError, setStockError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const [activeTab, setActiveTab] = useState("stock");
  const [stockSearch, setStockSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [confirmationFilter, setConfirmationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const online = () => setIsOnline(true);
    const offline = () => setIsOnline(false);

    window.addEventListener("online", online);
    window.addEventListener("offline", offline);

    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadStock = async () => {
      setLoadingStock(true);
      setStockError("");

      try {
        if (!navigator.onLine) {
          const cached = await getCachedMedicineStock();
          if (!cancelled) setStock(cached);
          return;
        }

        const data = await getMyMedicineStock();
        await cacheMedicineStock(data);

        if (!cancelled) setStock(data);
      } catch (error) {
        console.error("Inventory loading error:", error);

        try {
          const cached = await getCachedMedicineStock();

          if (!cancelled && cached.length > 0) {
            setStock(cached);
            setStockError(
              "Showing saved inventory. Reconnect to refresh the latest stock."
            );
            return;
          }
        } catch (cacheError) {
          console.error("Stock cache error:", cacheError);
        }

        if (!cancelled) {
          setStockError(error.message || "Unable to load inventory.");
        }
      } finally {
        if (!cancelled) setLoadingStock(false);
      }
    };

    loadStock();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setLoadingHistory(true);
      setHistoryError("");

      try {
        if (!navigator.onLine) {
          throw new Error(
            "Distribution history requires an internet connection."
          );
        }

        const token = getToken();
        if (!token) {
          throw new Error("Please log in again to view distribution history.");
        }

        const response = await fetch(
          `${API}/api/medicine/my-distributions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load distribution history."
          );
        }

        const records = Array.isArray(data)
          ? data
          : data.distributions || [];

        if (!cancelled) setDistributions(records);
      } catch (error) {
        console.error("Distribution history error:", error);

        if (!cancelled) {
          setHistoryError(
            error.message || "Unable to load distribution history."
          );
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const totalUnits = useMemo(
    () =>
      stock.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
    [stock]
  );

  const lowStockItems = useMemo(
    () => stock.filter((item) => Number(item.quantity) < LOW_STOCK_LIMIT),
    [stock]
  );

  const pendingCount = useMemo(
    () => distributions.filter((item) => !item.confirmedByPatient).length,
    [distributions]
  );

  const filteredStock = useMemo(() => {
    const query = stockSearch.trim().toLowerCase();

    return stock.filter(
      (item) =>
        getMedicineName(item).toLowerCase().includes(query) ||
        getDosage(item).toLowerCase().includes(query)
    );
  }, [stock, stockSearch]);

  const filteredDistributions = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    const now = new Date();

    return distributions.filter((item) => {
      const patient = getPatientName(item).toLowerCase();
      const medicine = getMedicineName(item).toLowerCase();
      const phone = String(item.patientId?.phone || "").toLowerCase();

      const matchesSearch =
        patient.includes(query) ||
        medicine.includes(query) ||
        phone.includes(query);

      const matchesConfirmation =
        confirmationFilter === "all" ||
        (confirmationFilter === "confirmed" && item.confirmedByPatient) ||
        (confirmationFilter === "pending" && !item.confirmedByPatient);

      let matchesDate = true;

      if (dateFilter !== "all") {
        const givenDate = new Date(item.givenDate);
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - Number(dateFilter));

        matchesDate =
          !Number.isNaN(givenDate.getTime()) &&
          givenDate >= cutoff &&
          givenDate <= now;
      }

      return matchesSearch && matchesConfirmation && matchesDate;
    });
  }, [distributions, historySearch, confirmationFilter, dateFilter]);

  const refreshData = () => {
    if (refreshing) return;

    setRefreshing(true);
    setRefreshKey((key) => key + 1);

    // Stop the refresh indicator even if a request takes longer.
    window.setTimeout(() => setRefreshing(false), 800);
  };

  const exportHistory = () => {
    const headers = [
      "Patient",
      "Phone",
      "Village",
      "Medicine",
      "Dosage",
      "Quantity",
      "Distributed At",
      "Patient Confirmed",
    ];

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredDistributions.map((item) => [
      getPatientName(item),
      item.patientId?.phone || "",
      item.patientId?.village || "",
      getMedicineName(item),
      getDosage(item),
      item.quantity ?? 0,
      formatDate(item.givenDate),
      item.confirmedByPatient ? "Yes" : "Pending",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "medicine-distribution-history.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: "stock", label: "Current stock", icon: Package },
    { id: "history", label: "Distribution history", icon: History },
  ];

  return (
    <div className="min-h-screen text-slate-900 bg-[radial-gradient(ellipse_at_top_left,rgba(35,109,181,0.24),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(98,168,232,0.34),transparent_40%),linear-gradient(125deg,#B9DEFF_0%,#E5F2FF_38%,#C9E4FF_70%,#DCEBFA_100%)] ">
      {/* Reuse the exact navbar from the ASHA Patient Database page */}
      <AshaNavbar />

      <main className="relative isolate min-h-screen overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8">
        <div className="pointer-events-none absolute -right-24 top-24 -z-10 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-[28rem] -z-10 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page heading */}
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                <Activity size={14} />
                ASHA Worker Portal
              </div>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Medicine Inventory
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Track available medicines, monitor low stock, and review
                patient distribution confirmations in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin" : ""}
                />
              </button>

              <button
                type="button"
                onClick={() => navigate("/asha-dashboard")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
              >
                <ArrowLeft size={16} />
                Dashboard
              </button>
            </div>
          </header>

          {/* Summary cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Medicine types"
              value={loadingStock ? "—" : stock.length}
              description="Stock records assigned to you"
              icon={Package}
              iconClass="bg-blue-50 text-blue-600"
            />

            <SummaryCard
              title="Total units available"
              value={loadingStock ? "—" : totalUnits.toLocaleString("en-IN")}
              description="Across all listed medicines"
              icon={ArrowDownLeft}
              iconClass="bg-cyan-50 text-cyan-700"
            />

            <SummaryCard
              title="Low-stock items"
              value={loadingStock ? "—" : lowStockItems.length}
              description={`Below ${LOW_STOCK_LIMIT} units`}
              icon={ShieldAlert}
              iconClass="bg-amber-50 text-amber-700"
            />

            <SummaryCard
              title="Awaiting confirmation"
              value={loadingHistory ? "—" : pendingCount}
              description="Patient confirmations pending"
              icon={Users}
              iconClass="bg-emerald-50 text-emerald-700"
            />
          </section>

          {/* Low stock alert */}
          {!loadingStock && lowStockItems.length > 0 && (
            <section className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-amber-900">
                    Low stock needs attention
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-amber-800">
                    {lowStockItems.length} medicine{" "}
                    {lowStockItems.length === 1 ? "item is" : "items are"} below
                    the {LOW_STOCK_LIMIT}-unit threshold.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("stock");
                  setStockSearch("");
                }}
                className="inline-flex shrink-0 items-center justify-center rounded-xl border border-amber-300 bg-white px-4 py-2.5 text-sm font-bold text-amber-800 transition hover:bg-amber-100"
              >
                Review stock
              </button>
            </section>
          )}

          {/* Offline / API messages */}
          {!isOnline && (
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
              <WifiOff size={18} className="mt-0.5 shrink-0" />
              <p>
                You are offline. Cached stock may be available, but distribution
                history requires an internet connection.
              </p>
            </div>
          )}

          {stockError && stock.length > 0 && (
            <div
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {stockError}
            </div>
          )}

          {/* Main content */}
          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex flex-wrap gap-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                      activeTab === id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                        : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              {activeTab === "history" && (
                <button
                  type="button"
                  onClick={exportHistory}
                  disabled={filteredDistributions.length === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              )}
            </div>

            {activeTab === "stock" ? (
              <div>
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Available medicines
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Quantities currently assigned to your account.
                    </p>
                  </div>

                  <div className="w-full sm:max-w-sm">
                    <SearchInput
                      value={stockSearch}
                      onChange={setStockSearch}
                      placeholder="Search medicines or dosage..."
                    />
                  </div>
                </div>

                {stockError && stock.length === 0 ? (
                  <ErrorState message={stockError} onRetry={refreshData} />
                ) : loadingStock ? (
                  <LoadingState />
                ) : filteredStock.length === 0 ? (
                  <EmptyState
                    message={
                      stock.length
                        ? "Try another medicine name or dosage."
                        : "No stock records have been assigned to your account yet."
                    }
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left">
                      <thead className="bg-slate-50/80">
                        <tr>
                          {[
                            "Medicine",
                            "Dosage",
                            "Available",
                            "Status",
                            "Received",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 sm:px-6"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredStock.map((item, index) => {
                          const quantity = Number(item.quantity) || 0;
                          const low = quantity < LOW_STOCK_LIMIT;

                          return (
                            <tr
                              key={
                                item._id ||
                                item.medicineId?._id ||
                                item.medicineId ||
                                `${getMedicineName(item)}-${index}`
                              }
                              className="transition-colors hover:bg-blue-50/40"
                            >
                              <td className="px-5 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <Package size={19} />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800">
                                      {getMedicineName(item)}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">
                                      Medicine inventory
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-500 sm:px-6">
                                {getDosage(item)}
                              </td>

                              <td className="px-5 py-4 sm:px-6">
                                <span className="font-extrabold tabular-nums text-slate-900">
                                  {quantity.toLocaleString("en-IN")}
                                </span>
                                <span className="ml-1 text-xs text-slate-400">
                                  units
                                </span>
                              </td>

                              <td className="px-5 py-4 sm:px-6">
                                <StatusPill
                                  tone={low ? "warning" : "success"}
                                  icon={low ? ShieldAlert : CheckCircle2}
                                >
                                  {low ? "Low stock" : "In stock"}
                                </StatusPill>
                              </td>

                              <td className="px-5 py-4 text-sm text-slate-500 sm:px-6">
                                {formatDate(item.receivedDate || item.createdAt)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 sm:px-6">
                  Showing {filteredStock.length} of {stock.length} stock
                  records.
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-4 p-4 sm:px-6">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Medicine distribution history
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Review patient details, quantities, distribution dates,
                      and confirmation status.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <SearchInput
                      value={historySearch}
                      onChange={setHistorySearch}
                      placeholder="Search patient, phone or medicine..."
                    />

                    <select
                      value={confirmationFilter}
                      onChange={(event) =>
                        setConfirmationFilter(event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="all">All confirmation statuses</option>
                      <option value="confirmed">Confirmed by patient</option>
                      <option value="pending">Awaiting confirmation</option>
                    </select>

                    <select
                      value={dateFilter}
                      onChange={(event) => setDateFilter(event.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="all">All dates</option>
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="90">Last 90 days</option>
                    </select>
                  </div>

                  {(historySearch ||
                    confirmationFilter !== "all" ||
                    dateFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setHistorySearch("");
                        setConfirmationFilter("all");
                        setDateFilter("all");
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800"
                    >
                      <X size={14} />
                      Clear filters
                    </button>
                  )}
                </div>

                {historyError ? (
                  <ErrorState message={historyError} onRetry={refreshData} />
                ) : loadingHistory ? (
                  <LoadingState />
                ) : filteredDistributions.length === 0 ? (
                  <EmptyState message="No distribution records match your filters." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[950px] text-left">
                      <thead className="bg-slate-50/80">
                        <tr>
                          {[
                            "Patient",
                            "Medicine",
                            "Quantity",
                            "Distributed at",
                            "Village",
                            "Confirmation",
                          ].map((heading) => (
                            <th
                              key={heading}
                              className="px-5 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                            >
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {filteredDistributions.map((item, index) => (
                          <tr
                            key={item._id || `${item.givenDate}-${index}`}
                            className="transition-colors hover:bg-blue-50/40"
                          >
                            <td className="px-5 py-4">
                              <p className="font-bold text-slate-800">
                                {getPatientName(item)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item.patientId?.phone || "Phone unavailable"}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-semibold text-slate-800">
                                {getMedicineName(item)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {getDosage(item)}
                              </p>
                            </td>

                            <td className="px-5 py-4">
                              <span className="font-extrabold tabular-nums text-slate-800">
                                {item.quantity ?? 0}
                              </span>
                              <span className="ml-1 text-xs text-slate-400">
                                units
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-start gap-2 text-sm text-slate-600">
                                <CalendarDays
                                  size={15}
                                  className="mt-0.5 shrink-0 text-slate-400"
                                />
                                {formatDate(item.givenDate)}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {item.patientId?.village || "Not recorded"}
                            </td>

                            <td className="px-5 py-4">
                              {item.confirmedByPatient ? (
                                <StatusPill
                                  tone="success"
                                  icon={CheckCircle2}
                                >
                                  Confirmed
                                </StatusPill>
                              ) : (
                                <StatusPill tone="warning" icon={Clock3}>
                                  Pending
                                </StatusPill>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!historyError && !loadingHistory && (
                  <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 sm:px-6">
                    Showing {filteredDistributions.length} of{" "}
                    {distributions.length} distribution records.
                  </div>
                )}
              </div>
            )}
          </section>

          <p className="text-xs leading-5 text-slate-400">
            Stock quantities reflect the latest API response or cached stock
            when offline. Pending confirmation indicates that the system has
            not recorded patient confirmation; it does not by itself indicate
            misconduct.
          </p>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={20} />
        </span>
      </div>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative w-full">
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

function StatusPill({ tone, icon: Icon, children }) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-bold ${
        styles[tone] || styles.success
      }`}
    >
      <Icon size={13} />
      {children}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center gap-3 px-4 py-12">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
        <LoaderCircle size={25} className="animate-spin text-blue-600" />
      </div>
      <p className="text-sm font-bold text-slate-700">Loading records...</p>
      <p className="text-center text-xs text-slate-400">
        This may take a moment on a slow connection.
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="m-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-8 text-center sm:m-6">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-red-500">
        <ShieldAlert size={23} />
      </div>
      <p className="text-sm font-bold text-red-800">Unable to load records</p>
      <p className="mx-auto mt-1 max-w-xl text-xs leading-5 text-red-600">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <RefreshCw size={15} />
          Try again
        </button>
      )}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-52 flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-500">
        <Package size={26} />
      </div>
      <p className="text-sm font-bold text-slate-800">No records found</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {message}
      </p>
    </div>
  );
}