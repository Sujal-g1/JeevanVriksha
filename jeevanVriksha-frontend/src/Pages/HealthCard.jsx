
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Droplets,
  HeartPulse,
  Leaf,
  LoaderCircle,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Weight,
  Heart,
  ClipboardList,
  Clock3,
} from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

const getAgeLabel = (patient) => {
  const years = Number(patient?.ageYears || 0);
  const months = Number(patient?.ageMonths || 0);
  const days = Number(patient?.ageDays || 0);

  if (years || months || days) {
    return [
      years ? `${years} ${years === 1 ? "year" : "years"}` : "",
      months ? `${months} ${months === 1 ? "month" : "months"}` : "",
      days ? `${days} ${days === 1 ? "day" : "days"}` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (patient?.age != null && patient.age !== "") {
    const age = Number(patient.age);

    if (Number.isFinite(age) && age >= 0) {
      return `${age} ${age === 1 ? "year" : "years"}`;
    }
  }

  return "Not specified";
};

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "Date unavailable";

  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const InfoCard = ({ icon: Icon, label, value, tone }) => {
  const tones = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    violet: "bg-violet-50 text-violet-700 ring-violet-100",
  };

  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/80 transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 break-words text-lg font-bold text-slate-800">
            {value || "Not recorded"}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${
            tones[tone] || tones.blue
          }`}
        >
          <Icon size={21} />
        </div>
      </div>
    </article>
  );
};

const HealthCard = () => {
  const { token } = useParams();
  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHealthCard = useCallback(async () => {
    if (!id) {
      setError("No patient ID was found in this health card link.");
      setLoading(false);
      return;
    }

    if (!API) {
      setError("The API URL is not configured.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch( `${API}/api/patients/public-health-card/${encodeURIComponent(token)}` );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load patient records.");
      }

      if (!data.patient) {
        throw new Error("Patient information was not returned.");
      }

      setPatient(data.patient);
      setVitals(Array.isArray(data.vitals) ? data.vitals : []);
    } catch (err) {
      console.error("Health card error:", err);
      setError(err.message || "Unable to load the health card.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadHealthCard();
  }, [loadHealthCard]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-50 px-5">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <LoaderCircle size={30} className="animate-spin" />
          </div>
          <h1 className="mt-5 text-lg font-bold text-slate-800">
            Preparing your health card
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Loading your JeevanVriksha health record...
          </p>
        </div>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 p-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertCircle size={30} />
          </div>

          <h1 className="mt-5 text-xl font-bold text-slate-800">
            Health card unavailable
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{error}</p>

          <button
            onClick={loadHealthCard}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </main>
    );
  }

  const age = getAgeLabel(patient);

  return (
    <main className="min-h-screen bg-[#f4faf7] text-slate-800">
      <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-80 bg-gradient-to-b from-emerald-100/80 via-teal-50/50 to-transparent" />

      <div className="relative mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        {/* Branding */}
        <header className="mb-7 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-700/20">
              <Leaf size={27} />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                Jeevan<span className="text-emerald-600">Vriksha</span>
              </h1>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Community healthcare, closer to you
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-3 py-2 text-xs font-semibold text-emerald-700 shadow-sm sm:flex">
            <ShieldCheck size={16} />
            Digital health card
          </div>
        </header>

        {/* Patient profile */}
        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 p-6 text-white shadow-xl shadow-emerald-900/10 sm:p-9">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[40px] border-white/[0.08]" />
          <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-teal-300/20 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-50">
                <HeartPulse size={15} />
                Patient health profile
              </span>

              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-50">
                <CheckCircle2 size={15} />
                Record loaded
              </span>
            </div>

            <div className="mt-7 flex items-start gap-4 sm:items-center sm:gap-6">
              <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-3xl border border-white/25 bg-white/15 shadow-inner sm:h-24 sm:w-24">
                <UserRound size={43} strokeWidth={1.6} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="break-words text-2xl font-black tracking-tight sm:text-4xl">
                  {patient.name || "Unnamed patient"}
                </h2>

                <p className="mt-2 text-sm text-emerald-50 sm:text-base">
                  {age}
                  {patient.gender ? ` · ${patient.gender}` : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/10 px-3 py-2 text-xs font-medium">
                    <MapPin size={14} />
                    {patient.village || "Village not recorded"}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-black/10 px-3 py-2 text-xs font-medium">
                    <Droplets size={14} />
                    {patient.bloodGroup || "Blood group unknown"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-white/15 bg-white/10 p-4">
              <ShieldCheck className="mt-0.5 shrink-0 text-emerald-100" size={22} />
              <div>
                <p className="text-sm font-bold">Your health information</p>
                <p className="mt-1 text-xs leading-5 text-emerald-50/90">
                  A convenient view of your recorded patient details and
                  healthcare measurements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Medical overview */}
        <section className="mt-9">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Stethoscope size={22} />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                Medical overview
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Important information from your patient profile
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <InfoCard
              icon={CalendarDays}
              label="Age"
              value={age}
              tone="blue"
            />
            <InfoCard
              icon={Droplets}
              label="Blood group"
              value={patient.bloodGroup || "Not recorded"}
              tone="rose"
            />
            <InfoCard
              icon={Heart}
              label="Allergies"
              value={patient.allergies || "Not recorded"}
              tone="amber"
            />
            <InfoCard
              icon={ClipboardList}
              label="Chronic conditions"
              value={
                Array.isArray(patient.chronicDiseases)
                  ? patient.chronicDiseases.join(", ") || "Not recorded"
                  : patient.chronicDiseases || "Not recorded"
              }
              tone="violet"
            />
          </div>
        </section>

        {/* Vitals history */}
        <section className="mt-9 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/80">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <Activity size={23} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900">
                  Vitals history
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Recent recorded measurements
                </p>
              </div>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
              {vitals.length} {vitals.length === 1 ? "record" : "records"}
            </span>
          </div>

          {vitals.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                <Activity size={27} />
              </div>
              <h4 className="mt-4 font-bold text-slate-800">
                No measurements recorded yet
              </h4>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Measurements will appear here when your healthcare worker
                records them.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4 sm:p-6">
              {vitals.map((vital, index) => (
                <article
                  key={vital._id || `${vital.createdAt}-${index}`}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                      <Activity size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800">
                        Measurement record
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock3 size={13} />
                        {formatDate(vital.createdAt)}
                      </p>
                    </div>

                    <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                      <CheckCircle2 size={14} />
                      Recorded
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                        <HeartPulse size={18} />
                        Blood pressure
                      </div>
                      <p className="mt-3 text-2xl font-black text-slate-800">
                        {vital.bloodPressure || "Not recorded"}
                      </p>
                      {vital.bloodPressure && (
                        <p className="mt-1 text-xs text-slate-500">
                          Check the recorded unit with your healthcare worker.
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                        <Weight size={18} />
                        Weight
                      </div>
                      <p className="mt-3 text-2xl font-black text-slate-800">
                        {vital.weight != null && vital.weight !== ""
                          ? `${vital.weight} kg`
                          : "Not recorded"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Most recently recorded measurement
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex items-start gap-2.5 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:px-7">
            <ShieldCheck className="mt-0.5 shrink-0 text-emerald-600" size={17} />
            <p className="text-xs leading-5 text-slate-500">
              This card displays recorded information and is not a substitute
              for professional medical advice.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center">
          <div className="inline-flex items-center gap-2 font-extrabold text-slate-700">
            <Leaf size={18} className="text-emerald-600" />
            JeevanVriksha
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Nurturing mothers. Protecting tomorrow.
          </p>
          <p className="mt-3 text-[11px] text-slate-400">
            Digital community health record
          </p>
        </footer>
      </div>
    </main>
  );
};

export default HealthCard;
