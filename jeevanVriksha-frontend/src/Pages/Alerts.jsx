
import React, { useEffect, useState } from "react";
import AshaNavbar from "../components/AshaNavbar";
import {
  ArrowLeft,
  Bell,
  ShieldAlert,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HeartPulse,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const   Alerts = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      const res = await fetch(`${API}/api/alerts`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await res.json();

      console.log("Alerts API response:", data);
    console.table(
  Array.isArray(data)
    ? data.map((alert) => ({
        message: alert.message,
        patientId: alert.patientId,
        patient: alert.patient,
        createdAt: alert.createdAt,
        created_at: alert.created_at,
        timestamp: alert.timestamp,
      }))
    : data
);
      setAlerts(data);
    };

    fetchAlerts();
  }, []);


  const getPriority = (message = "") => {
    const text = message.toLowerCase();

    if (
      /emergency|critical|severe|immediate|danger|bleeding|unconscious|seizure|breathless/.test(
        text
      )
    ) {
      return "High";
    }

    if (
      /warning|urgent|abnormal|risk|attention|elevated|fever|pain/.test(
        text
      )
    ) {
      return "Medium";
    }

    return "Low";
  };

  const getPatientId = (alert) => {
  const patient =
    alert.patientId ??
    alert.patient ??
    alert.patient_id ??
    alert.patientDetails;

  if (patient && typeof patient === "object") {
    return (
      patient.patientId ??
      patient._id ??
      patient.id ??
      patient.userId ??
      "Not available"
    );
  }

  return patient ?? "Not available";
};

const getAlertTime = (alert) => {
  const timestamp =
    alert.createdAt ??
    alert.created_at ??
    alert.timestamp ??
    alert.date;

  if (!timestamp) return "Time unavailable";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) return "Time unavailable";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

  const priorityStyles = {
    High: {
      badge: "bg-rose-50 text-rose-700 border-rose-100",
      dot: "bg-rose-500",
      accent: "border-l-rose-500",
      icon: "text-rose-600 bg-rose-50",
      label: "High priority",
    },
    Medium: {
      badge: "bg-amber-50 text-amber-700 border-amber-100",
      dot: "bg-amber-500",
      accent: "border-l-amber-400",
      icon: "text-amber-600 bg-amber-50",
      label: "Medium priority",
    },
    Low: {
      badge: "bg-sky-50 text-sky-700 border-sky-100",
      dot: "bg-sky-500",
      accent: "border-l-sky-400",
      icon: "text-sky-600 bg-sky-50",
      label: "Low priority",
    },
  };

  const highPriorityCount = alerts.filter(
    (alert) => getPriority(alert.message) === "High"
  ).length;

  const mediumPriorityCount = alerts.filter(
    (alert) => getPriority(alert.message) === "Medium"
  ).length;

  const lowPriorityCount = alerts.filter(
    (alert) => getPriority(alert.message) === "Low"
  ).length;

  return (
    <div className="min-h-screen text-slate-800 bg-[radial-gradient(ellipse_at_top_left,rgba(35,109,181,0.24),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(98,168,232,0.34),transparent_40%),linear-gradient(125deg,#B9DEFF_0%,#E5F2FF_38%,#C9E4FF_70%,#DCEBFA_100%)] ">
      <AshaNavbar />

      <main className="mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8 ">
        {/* Back navigation */}
        <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-700 hover:shadow-sm"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

        {/* Page heading */}
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
              <HeartPulse size={14} />
              Community Healthcare
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Health Alerts
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Monitor patient health notifications and identify alerts that
              may need timely attention.
            </p>
          </div>

          <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Bell size={21} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Total notifications
              </p>
              <p className="text-2xl font-extrabold text-slate-900">
                {alerts.length}
              </p>
            </div>
          </div>
        </section>

        {/* Priority overview */}
        <section className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={18} className="text-blue-700" />
            <h2 className="text-lg font-bold text-slate-900">
              Priority Overview
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* High priority */}
            <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-rose-50" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    High Priority
                  </p>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">
                    {highPriorityCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Requires prompt review
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                  <ShieldAlert size={23} />
                </div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-rose-50">
                <div
                  className="h-full rounded-full bg-rose-500"
                  style={{
                    width: alerts.length
                      ? `${(highPriorityCount / alerts.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>

            {/* Medium priority */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-amber-50" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Medium Priority
                  </p>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">
                    {mediumPriorityCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Needs follow-up
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <AlertTriangle size={23} />
                </div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-amber-50">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{
                    width: alerts.length
                      ? `${(mediumPriorityCount / alerts.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>

            {/* Low priority */}
            <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-sky-50" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Low Priority
                  </p>
                  <p className="mt-3 text-3xl font-extrabold text-slate-900">
                    {lowPriorityCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    General notifications
                  </p>
                </div>
                <div className="rounded-xl bg-sky-50 p-3 text-sky-600">
                  <CheckCircle2 size={23} />
                </div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-sky-50">
                <div
                  className="h-full rounded-full bg-sky-500"
                  style={{
                    width: alerts.length
                      ? `${(lowPriorityCount / alerts.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Alert list */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recent Notifications
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review the health alerts received by your dashboard.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              {alerts.length} {alerts.length === 1 ? "alert" : "alerts"}
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {alerts.length > 0 ? (
              alerts.map((alert, i) => {
                const priority = getPriority(alert.message);
                const style = priorityStyles[priority];

                return (
                  <article
                    key={alert._id || i}
                    className={`border-l-4 ${style.accent} px-5 py-5 transition hover:bg-slate-50/80 sm:px-6`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${style.icon}`}
                      >
                        {priority === "High" ? (
                          <ShieldAlert size={21} />
                        ) : priority === "Medium" ? (
                          <AlertTriangle size={21} />
                        ) : (
                          <Bell size={21} />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${style.badge}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
                            />
                            {style.label}
                          </span>

                         <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                           <HeartPulse size={13} />
                           Patient ID:{" "}
                           <span className="font-semibold text-slate-700">
                              {getPatientId(alert)}
                           </span>
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                           <Clock size={13} />
                           {getAlertTime(alert)}
                        </span>
                        </div>
                        </div>

                        <p className="text-sm font-medium leading-6 text-slate-800 sm:text-base">
                          {alert.message}
                        </p>
                      </div>

                      <ChevronRight
                        size={18}
                        className="mt-1 shrink-0 text-slate-300"
                      />
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={30} />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  You're all caught up
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  There are no health alerts to display right now. New
                  notifications will appear here when available.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 text-xs leading-5 text-slate-500 sm:px-6">
            <Clock size={14} className="shrink-0" />
            <span>
              Review alerts promptly. For urgent symptoms or suspected
              emergencies, follow clinical protocols and contact a qualified
              healthcare professional.
            </span>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Alerts;
