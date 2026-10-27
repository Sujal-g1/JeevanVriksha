import React from "react";
import {
  Activity,
  Baby,
  CalendarCheck,
  Clock,
  HeartPulse,
  Syringe,
  Stethoscope,
  ClipboardCheck,
} from "lucide-react";

const actionMeta = (item) => {
  const rawType = String(item?.type || item?.activityType || item?.action || "").toLowerCase();
  if (rawType.includes("pregnan") || rawType.includes("anc")) {
    return { title: "Pregnancy checkup recorded", Icon: HeartPulse, tone: "bg-rose-50 text-rose-700" };
  }
  if (rawType.includes("newborn") || rawType.includes("infant")) {
    return { title: "Newborn assessment recorded", Icon: Baby, tone: "bg-violet-50 text-violet-700" };
  }
  if (rawType.includes("vaccin") || rawType.includes("immun")) {
    return { title: "Vaccination recorded", Icon: Syringe, tone: "bg-amber-50 text-amber-700" };
  }
  if (rawType.includes("vital") || rawType.includes("blood pressure")) {
    return { title: "Patient vitals recorded", Icon: Activity, tone: "bg-sky-50 text-sky-700" };
  }
  if (rawType.includes("refer")) {
    return { title: "Patient referral recorded", Icon: Stethoscope, tone: "bg-orange-50 text-orange-700" };
  }
  if (rawType.includes("follow")) {
    return { title: "Follow-up completed", Icon: CalendarCheck, tone: "bg-emerald-50 text-emerald-700" };
  }
  if (rawType.includes("visit")) {
    return { title: "Patient care visit recorded", Icon: ClipboardCheck, tone: "bg-teal-50 text-teal-700" };
  }
  return { title: "Patient care update recorded", Icon: ClipboardCheck, tone: "bg-slate-100 text-slate-700" };
};

const formatDate = (value) => {
  if (!value) return "Time not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Time not recorded";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const ActivityFeed = ({ activity = [] }) => {
  const items = Array.isArray(activity) ? activity : [];

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
        <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Activity size={20} />
        </span>
        <p className="text-sm font-semibold text-slate-700">No patient care updates yet</p>
        <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
          Completed checkups, recorded vitals, vaccinations, newborn assessments, and referrals will appear here when saved by the backend.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {items.slice(0, 8).map((item, index) => {
        const { title, Icon, tone } = actionMeta(item);
        const patientName = item?.patientId?.name || item?.patient?.name || item?.patientName;
        const ashaName = item?.ashaId?.name || item?.asha?.name || item?.ashaName;
        const detail = item?.notes || item?.description || item?.details;

        return (
          <div key={item?._id || `${item?.createdAt || "activity"}-${index}`} className="flex gap-3 py-3 first:pt-1 last:pb-1">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={17} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">{title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-600">
                {patientName ? `Patient: ${patientName}` : "Patient record"}
                {ashaName ? ` · ${ashaName}` : ""}
              </p>
              {detail && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{detail}</p>}
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                <Clock size={12} /> {formatDate(item?.createdAt || item?.updatedAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;
