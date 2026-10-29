import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  Baby,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  HeartPulse,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Syringe,
  Target,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import AshaNavbar from "../components/AshaNavbar";
import ActivityFeed from "../components/ActivityFeed";
import {
  getMyMedicineStock,
  cacheMedicineStock,
  getCachedMedicineStock,
} from "../services/medicineService";
import AshaMedicineInventory from "../components/AshaMedicineInventory";


const API = import.meta.env.VITE_API_URL;

const INITIAL_STATS = {
  patients: 0,
  pregnant: 0,
  highRisk: 0,
  newborns: 0,
  vaccineDue: 0,
  visitsToday: 0,
};

const panelClass =
  "rounded-2xl border border-slate-200/80 bg-slate-100 shadow-[0_4px_22px_rgba(15,23,42,0.035)]";

const statItems = [
  {
    key: "patients",
    label: "Total patients",
    icon: Users,
    tone: "teal",
    helper: "Registered in your care",
  },
  {
    key: "pregnant",
    label: "Pregnant women",
    icon: Baby,
    tone: "violet",
    helper: "Pregnancy follow-ups",
  },
  {
    key: "highRisk",
    label: "High-risk cases",
    icon: HeartPulse,
    tone: "rose",
    helper: "Need close attention",
  },
  {
    key: "newborns",
    label: "Newborns",
    icon: Baby,
    tone: "sky",
    helper: "Newborn care",
  },
  {
    key: "vaccineDue",
    label: "Vaccines due",
    icon: Syringe,
    tone: "amber",
    helper: "Upcoming vaccinations",
  },
  {
    key: "visitsToday",
    label: "Visits today",
    icon: Activity,
    tone: "green",
    helper: "Today's care activity",
  },
];

const toneStyles = {
  teal: {
    icon: "bg-teal-50 text-teal-700 ring-teal-100",
    accent: "bg-teal-500",
    value: "text-slate-900",
  },
  violet: {
    icon: "bg-violet-50 text-violet-700 ring-violet-100",
    accent: "bg-violet-500",
    value: "text-slate-900",
  },
  rose: {
    icon: "bg-rose-50 text-rose-700 ring-rose-100",
    accent: "bg-rose-500",
    value: "text-rose-700",
  },
  sky: {
    icon: "bg-sky-50 text-sky-700 ring-sky-100",
    accent: "bg-sky-500",
    value: "text-slate-900",
  },
  amber: {
    icon: "bg-amber-50 text-amber-700 ring-amber-100",
    accent: "bg-amber-500",
    value: "text-slate-900",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    accent: "bg-emerald-500",
    value: "text-slate-900",
  },
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const getResponseData = async (response) => {
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json();
};

const AshaDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [activity, setActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [medicineStock, setMedicineStock] = useState([]);
  const [isMedicineExpanded, setIsMedicineExpanded] = useState(false);
  const [medicineStockLoading, setMedicineStockLoading] = useState(true);
  const [medicineStockError, setMedicineStockError] = useState("");
  const [expandedTask, setExpandedTask] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [busyTask, setBusyTask] = useState(null);
  const [notice, setNotice] = useState(null);

  const quickActions = useMemo( () => [
      {
        title: "View patients",
        subtitle: "Find a patient record",
        path: "/patients",
        icon: Users,
        style: "bg-teal-50 text-teal-700",
      },
      {
        title: "Register patient",
        subtitle: "Add someone to your care",
        path: "/create-patient",
        icon: UserPlus,
        style: "bg-sky-50 text-sky-700",
      },
      {
        title: "View alerts",
        subtitle: "Review important updates",
        path: "/alerts",
        icon: Bell,
        style: "bg-amber-50 text-amber-700",
      },
    ],
    []
  );

  const authHeaders = useCallback(() => {
    const user = getStoredUser();
    return user?.token
      ? { Authorization: `Bearer ${user.token}` }
      : {};
  }, []);

  const fetchMedicineStock = useCallback(async () => {
    const response = await fetch(`${API}/api/medicine/my-stock`, {
      headers: authHeaders(),
    });
    const data = await getResponseData(response);
    setMedicineStock(Array.isArray(data) ? data : data?.stock || data?.medicines || []);
  }, [authHeaders]);

  const fetchDashboardData = useCallback(async ({ isRefresh = false } = {}) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const user = getStoredUser();
    if (!user?.token) {
      setNotice({
        type: "error",
        message: "Your session could not be found. Please sign in again.",
      });
      setLoading(false);
      setRefreshing(false);
      return;
    }

    const headers = { Authorization: `Bearer ${user.token}` };
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    try {
      const requests = await Promise.allSettled([
        fetch(`${API}/api/dashboard/stats`, { headers, signal: controller.signal }),
        fetch(`${API}/api/activity`, { headers, signal: controller.signal }),
        fetch(`${API}/api/alerts`, { headers, signal: controller.signal }),
        fetch(`${API}/api/tasks/today`, { headers, signal: controller.signal }),
        fetch(`${API}/api/medicine/my-stock`, { headers, signal: controller.signal }),
      ]);

      const [statsResult, activityResult, alertsResult, tasksResult, medicineResult] = requests;

      if (statsResult.status === "fulfilled") {
        const data = await getResponseData(statsResult.value);
        setStats({
          patients: data.patients || 0,
          pregnant: data.pregnancy || 0,
          highRisk: data.highRisk || 0,
          newborns: data.newborns || 0,
          vaccineDue: data.vaccines || 0,
          visitsToday: data.visits || 0,
        });
      }

      if (activityResult.status === "fulfilled") {
        const data = await getResponseData(activityResult.value);
        setActivity(Array.isArray(data) ? data : data?.activity || []);
      }

      if (alertsResult.status === "fulfilled") {
        const data = await getResponseData(alertsResult.value);
        setAlerts(Array.isArray(data) ? data : data?.alerts || []);
      }

      if (tasksResult.status === "fulfilled") {
        const data = await getResponseData(tasksResult.value);
        setTasks(Array.isArray(data) ? data : data?.tasks || []);
      }

      if (medicineResult.status === "fulfilled") {
        const data = await getResponseData(medicineResult.value);
        setMedicineStock(Array.isArray(data) ? data : data?.stock || data?.medicines || []);
      }

      const failedRequests = requests.filter((result) => result.status === "rejected");
      if (failedRequests.length === requests.length) {
        setNotice({
          type: "error",
          message: "Unable to load dashboard data. Check your connection and try again.",
        });
      } else {
        setNotice(null);
      }
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setNotice({
        type: "error",
        message:
          error.name === "AbortError"
            ? "The connection is taking too long. Please try again."
            : "Some dashboard data could not be loaded.",
      });
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const sendReminder = async (task) => {
    setBusyTask(task._id);
    try {
      const response = await fetch(`${API}/api/reminders/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          patientId: task.patientId?._id,
          message: `Reminder for ${task.taskType}`,
        }),
      });

      if (!response.ok) throw new Error("Reminder request failed");
      setNotice({ type: "success", message: "Reminder sent successfully." });
    } catch (error) {
      console.error("Reminder error:", error);
      setNotice({ type: "error", message: "Could not send the reminder. Please try again." });
    } finally {
      setBusyTask(null);
    }
  };

  const markComplete = async (taskId) => {
    setBusyTask(taskId);
    try {
      const response = await fetch(`${API}/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!response.ok) throw new Error("Task update failed");

      setTasks((current) =>
        current.map((task) =>
          task._id === taskId ? { ...task, status: "completed" } : task
        )
      );
      setShowConfirm(null);
      setExpandedTask(null);
      setNotice({ type: "success", message: "Task marked as completed." });
    } catch (error) {
      console.error("Task completion error:", error);
      setNotice({ type: "error", message: "Could not update this task. Please try again." });
    } finally {
      setBusyTask(null);
    }
  };

  const pendingTasks = tasks.filter(
    (task) => String(task.status || "pending").toLowerCase() !== "completed"
  );

  // medicine
  useEffect(() => {
    let cancelled = false;

    const loadMedicineStock = async () => {
      setMedicineStockLoading(true);
      setMedicineStockError("");

      try {
        if (!navigator.onLine) {
          const cached = await getCachedMedicineStock();

          if (!cancelled) {
            setMedicineStock(cached);
          }

          return;
        }

        const stock = await getMyMedicineStock();

        await cacheMedicineStock(stock);

        if (!cancelled) {
          setMedicineStock(stock);
        }
      } catch (error) {
        console.error("Medicine stock error:", error);

        try {
          const cached = await getCachedMedicineStock();

          if (!cancelled && cached.length > 0) {
            setMedicineStock(cached);
            return;
          }
        } catch (cacheError) {
          console.error("Offline cache error:", cacheError);
        }

        if (!cancelled) {
          setMedicineStockError(error.message || "Failed to load medicine stock");
        }
      } finally {
        if (!cancelled) {
          setMedicineStockLoading(false);
        }
      }
    };

    loadMedicineStock();

    return () => {
      cancelled = true;
    };
  }, []);


  const attentionCount = stats.highRisk + stats.vaccineDue + alerts.length;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(35,109,181,0.24),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(98,168,232,0.34),transparent_40%),linear-gradient(125deg,#B9DEFF_0%,#E5F2FF_38%,#C9E4FF_70%,#DCEBFA_100%)] text-slate-800">
      <AshaNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        {/* Page heading */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-semibold text-blue-800">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500 " />
              ASHA worker workspace
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {t("Daily")} <span className="text-blue-900">Overview</span>
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-slate-500">
              A clear view of your community health work, patient follow-ups, and daily priorities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-medium text-slate-500 shadow-sm">
              {loading ? (
                <Loader2 size={15} className="animate-spin text-teal-700" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              )}
              {loading ? "Syncing dashboard…" : "Dashboard up to date"}
            </div>
            <button
              type="button"
              onClick={() => fetchDashboardData({ isRefresh: true })}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </motion.section>

        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className={`mb-5 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
                notice.type === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
              role="status"
            >
              <div className="flex items-start gap-2">
                {notice.type === "error" ? <Bell size={17} className="mt-0.5" /> : <CheckCircle2 size={17} className="mt-0.5" />}
                <span>{notice.message}</span>
              </div>
              <button
                type="button"
                aria-label="Dismiss message"
                onClick={() => setNotice(null)}
                className="rounded-md p-0.5 opacity-70 transition hover:opacity-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick actions */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Quick actions</h2>
            <span className="text-xs text-slate-400">Common tasks</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.path}
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  onClick={() => navigate(action.path)}
                  className={`${panelClass} group flex items-center gap-4 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md sm:p-5`}
                >
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${action.style}`}>
                    <Icon size={21} strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-slate-800">{action.title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">{action.subtitle}</span>
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Overview stats */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Community health at a glance</h2>
              <p className="mt-1 text-xs text-slate-500">A snapshot of your current workload</p>
            </div>
            {loading && <span className="text-xs text-slate-400">Updating figures…</span>}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            {statItems.map((item, index) => {
              const Icon = item.icon;
              const tone = toneStyles[item.tone];
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.045 }}
                  className={`${panelClass} relative min-w-0 overflow-hidden p-4 sm:p-5`}
                >
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${tone.icon}`}>
                      <Icon size={19} strokeWidth={1.9} />
                    </span>
                    <span className={`mt-1 h-1.5 w-1.5 rounded-full ${tone.accent}`} />
                  </div>
                  <div className={`text-2xl font-bold tracking-tight sm:text-3xl ${tone.value}`}>
                    {loading ? <span className="inline-block h-8 w-10 animate-pulse rounded-md bg-slate-100" /> : stats[item.key]}
                  </div>
                  <div className="mt-1.5 text-xs font-semibold leading-5 text-slate-700">{item.label}</div>
                  <div className="mt-1 text-[11px] leading-4 text-slate-400">{item.helper}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Work areas */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-8">

            {/* Tasks */}
            <section className={`${panelClass} overflow-hidden`}>
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <ClipboardList size={18} />
                    </span>
                    <h2 className="text-base font-bold text-slate-900">Today's tasks</h2>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {pendingTasks.length} pending {pendingTasks.length === 1 ? "task" : "tasks"} · Keep follow-ups on track
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/todo")}
                  className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#164fac] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#092d66] focus:outline-none focus:ring-4 focus:ring-teal-100 sm:self-auto"
                >
                  <Plus size={15} />
                  New task
                </button>
              </div>

              <div className="space-y-3 p-4 sm:p-5">
                {tasks.length === 0 && !loading && (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <CheckCircle2 size={24} />
                    </span>
                    <p className="text-sm font-semibold text-slate-700">You're all caught up</p>
                    <p className="mt-1 text-xs text-slate-500">No tasks were returned for today.</p>
                  </div>
                )}

                {loading && tasks.length === 0 && (
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex animate-pulse items-center gap-3 rounded-xl border border-slate-100 p-4">
                        <div className="h-9 w-9 rounded-lg bg-slate-100" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/3 rounded bg-slate-100" />
                          <div className="h-2.5 w-1/2 rounded bg-slate-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tasks.map((task) => {
                  const isExpanded = expandedTask === task._id;
                  const isCompleted = String(task.status || "").toLowerCase() === "completed";
                  return (
                    <div
                      key={task._id}
                      className={`overflow-hidden rounded-xl border transition ${
                        isExpanded
                          ? "border-teal-200 bg-teal-50/20"
                          : "border-slate-200/80 bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedTask(isExpanded ? null : task._id)}
                        aria-expanded={isExpanded}
                        className="flex w-full items-center gap-3 p-4 text-left sm:gap-4"
                      >
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {isCompleted ? <Check size={18} /> : <ClipboardList size={18} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className={`text-sm font-bold ${isCompleted ? "text-slate-500 line-through" : "text-slate-800"}`}>
                              {String(task.taskType || "Follow-up").replaceAll("_", " ")}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isCompleted
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}>
                              {isCompleted ? "Completed" : "Pending"}
                            </span>
                          </span>
                          <span className="mt-1 block truncate text-xs text-slate-500">
                            {task.patientId?.name || "No patient linked"}
                          </span>
                        </span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:justify-end">
                              {!isCompleted && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => sendReminder(task)}
                                    disabled={busyTask === task._id}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 disabled:opacity-60"
                                  >
                                    <Bell size={14} />
                                    {busyTask === task._id ? "Please wait…" : "Send reminder"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setShowConfirm(showConfirm === task._id ? null : task._id)}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-teal-800"
                                  >
                                    <CheckCircle2 size={14} />
                                    Mark complete
                                  </button>
                                </>
                              )}
                            </div>
                            <AnimatePresence>
                              {showConfirm === task._id && !isCompleted && (
                                <motion.div
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -4 }}
                                  className="mx-4 mb-4 flex flex-col gap-3 rounded-xl border border-teal-100 bg-teal-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                                >
                                  <p className="text-xs font-semibold text-teal-900">Mark this task as completed?</p>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirm(null)}
                                      className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => markComplete(task._id)}
                                      disabled={busyTask === task._id}
                                      className="rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
                                    >
                                      {busyTask === task._id ? "Saving…" : "Confirm"}
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </section>

                {/* monthly progress */}
       <section className="relative flex h-full min-h-[160px] flex-col overflow-hidden rounded-2xl border border-teal-800 bg-[#164fac] p-4 text-white shadow-[0_8px_28px_rgba(15,93,88,0.16)] sm:min-h-[190px] sm:p-5">
  <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border-[22px] border-white/[0.06]" />
  <div className="pointer-events-none absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-teal-400/10 blur-2xl" />

  <div className="relative flex flex-1 flex-col">
    <div className="mb-3 flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/10 text-teal-100">
        <Target size={16} />
      </span>
      <div>
        <h2 className="text-sm font-bold">Monthly progress</h2>
        <p className="mt-0.5 text-[11px] text-teal-100/75">
          Your care journey this month
        </p>
      </div>
    </div>

    <div className="mb-2 flex items-end justify-between gap-3">
      <span className="text-2xl font-bold tracking-tight">65%</span>
      <span className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-teal-100">
        <ArrowDownRight size={13} className="rotate-[-45deg]" />
        Monthly target
      </span>
    </div>

    <div className="h-2 overflow-hidden rounded-full bg-black/20">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: "65%" }}
        transition={{ duration: 1.1, ease: "easeOut" }}
        className="h-full rounded-full bg-[#7fa4f4]"
      />
    </div>

    <p className="mt-2 text-[9px] leading-4 text-teal-50/80">
      Keep recording visits and follow-ups to maintain an accurate picture of community care.
    </p>

    <button
      type="button"
      onClick={() => navigate("/todo")}
      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-slate-100/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-100/15"
    >
      View daily tasks
      <ArrowRight size={14} />
    </button>
  </div>
        </section>

       
          </div>

          {/* Right column */}
          <aside className="space-y-5 lg:col-span-4">
          
            {/* Medicine stock */}
        <section className={`${panelClass} overflow-hidden`}>
          <button
            type="button"
            onClick={() => setIsMedicineExpanded((expanded) => !expanded)}
            aria-expanded={isMedicineExpanded}
            className="flex w-full items-center gap-3 p-5 text-left transition hover:bg-slate-50 sm:p-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Package size={19} />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-slate-900">
                Medicine stock
              </span>

              <span className="mt-1 block text-xs text-slate-500">
                {medicineStock.length}{" "}
                {medicineStock.length === 1 ? "item" : "items"} in your stock list
              </span>
            </span>

            <ChevronDown
              size={18}
              className={`shrink-0 text-slate-400 transition-transform ${
                isMedicineExpanded ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence initial={false}>
            {isMedicineExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 border-t border-slate-100 p-4 sm:p-5">
                  {medicineStockLoading ? (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-6">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                      <p className="text-xs font-medium text-slate-500">
                        Loading medicine stock...
                      </p>
                    </div>
                  ) : medicineStockError && medicineStock.length === 0 ? (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center">
                      <Package
                        size={22}
                        className="mx-auto mb-2 text-red-400"
                      />
                      <p className="text-xs font-semibold text-red-600">
                        Unable to load medicine stock
                      </p>
                      <p className="mt-1 text-xs text-red-500">
                        {medicineStockError}
                      </p>
                    </div>
                  ) : medicineStock.length === 0 ? (
                    <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
                      <Package
                        size={22}
                        className="mx-auto mb-2 text-slate-300"
                      />
                      <p className="text-xs font-medium text-slate-500">
                        No medicines available
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Medicines assigned to you will appear here.
                      </p>
                    </div>
                  ) : (
                    medicineStock.slice(0, 3).map((stock) => {
                      const medicine =
                        typeof stock.medicineId === "object" &&
                        stock.medicineId !== null
                          ? stock.medicineId
                          : null;

                      return (
                        <div
                          key={
                            stock._id ||
                            medicine?._id ||
                            stock.medicineId ||
                            stock.name
                          }
                          className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-teal-100 hover:bg-teal-50/30"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-800">
                              {medicine?.name || stock.name || "Medicine"}
                            </p>

                            <p className="mt-1 text-[11px] text-slate-500">
                              {medicine?.dosage ||
                                stock.dosage ||
                                "Dosage not specified"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-teal-50 px-2.5 py-1.5 text-xs font-bold tabular-nums text-teal-800">
                            {stock.quantity ?? 0} units
                          </span>
                        </div>
                      );
                    })
                  )}

                  {!medicineStockLoading &&
                    !medicineStockError &&
                    medicineStock.length > 3 && (
                      <p className="px-1 pt-1 text-xs text-slate-500">
                        +{medicineStock.length - 3} more medicine types
                      </p>
                    )}

                  <button
                    type="button"
                    onClick={() => navigate("/asha/medicine-inventory")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100"
                  >
                    <Package size={16} />
                    View detailed inventory
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

            {/* Attention summary */}
        <section className={`${panelClass} p-5 sm:p-6`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Needs attention</p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{attentionCount}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Combined count of high-risk cases, vaccines due, and alerts.</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <Bell size={20} />
                </span>
              </div>
              <div className="my-5 h-px bg-slate-100" />
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    High-risk cases
                  </span>
                  <span className="text-sm font-bold text-slate-800">{stats.highRisk}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Vaccinations due
                  </span>
                  <span className="text-sm font-bold text-slate-800">{stats.vaccineDue}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-2 w-2 rounded-full bg-sky-400" />
                    Alerts
                  </span>
                  <span className="text-sm font-bold text-slate-800">{alerts.length}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/alerts")}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
              >
                Review alerts
                <ArrowRight size={14} />
              </button>
        </section>

          </aside>
        </div>

        <footer className="mt-8 flex flex-col gap-2 border-t border-slate-200/80 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>JeevanVriksha · Community healthcare workspace</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Designed for clear, focused field work
          </span>
        </footer>
      </main>
    </div>
  );
};

export default AshaDashboard;
