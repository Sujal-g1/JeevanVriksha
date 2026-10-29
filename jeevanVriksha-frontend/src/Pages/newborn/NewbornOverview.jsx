
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  LoaderCircle,
  RefreshCw,
  Syringe,
  Thermometer,
  Weight,
  Milk,
  Pencil,
} from "lucide-react";
import AshaNavbar from "../../components/AshaNavbar";

const API = import.meta.env.VITE_API_URL;

const formatDate = (value) => {
  if (!value) return "Not recorded";
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not recorded"
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

const display = (value, suffix = "") =>
  value === undefined || value === null || value === ""
    ? "Not recorded"
    : `${value}${suffix}`;

const getAge = (birthDate) => {
  if (!birthDate) return "Age not recorded";

  const birth = new Date(birthDate);
  const now = new Date();

  if (Number.isNaN(birth.getTime()) || birth > now) {
    return "Age not available";
  }

  let months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    now.getMonth() -
    birth.getMonth();

  if (now.getDate() < birth.getDate()) months -= 1;

  if (months < 1) {
    const days = Math.floor((now - birth) / 86400000);
    return `${days} day${days === 1 ? "" : "s"} old`;
  }

  if (months < 24) {
    return `${months} month${months === 1 ? "" : "s"} old`;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  return `${years} year${years === 1 ? "" : "s"}${
    remainingMonths ? `, ${remainingMonths} month${remainingMonths === 1 ? "" : "s"}` : ""
  } old`;
};

function Section({ title, subtitle, icon: Icon, children, action }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
            <Icon size={19} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function DataItem({ label, value, suffix = "" }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
        {display(value, suffix)}
      </dd>
    </div>
  );
}

function StatCard({ label, value, helper, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-2 text-xl font-black text-slate-900">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

const NewbornOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [newborn, setNewborn] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadOverview(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      if (!API) throw new Error("VITE_API_URL is not configured.");

      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user?.token) {
        throw new Error("Session expired. Please log in again.");
      }

      const headers = { Authorization: `Bearer ${user.token}` };

      const responses = await Promise.all([
        fetch(`${API}/api/patients/${id}`, { headers }),
        fetch(`${API}/api/newborn/${id}`, { headers }),
        fetch(`${API}/api/vaccinations/${id}`, { headers }),
      ]);

      const [patientResult, newbornResult, vaccineResult] = await Promise.all(
        responses.map((response) => response.json().catch(() => null))
      );

      if (!responses[0].ok) {
        throw new Error(patientResult?.message || "Unable to load patient.");
      }

      if (!responses[1].ok) {
        throw new Error(newbornResult?.message || "Unable to load newborn.");
      }

      if (!responses[2].ok) {
        throw new Error(vaccineResult?.message || "Unable to load vaccinations.");
      }

      const patientData =
        patientResult?.patient ??
        patientResult?.data?.patient ??
        patientResult?.data ??
        patientResult;

      const newbornData =
        newbornResult?.newborn ??
        newbornResult?.data?.newborn ??
        newbornResult?.data ??
        newbornResult;

      setPatient(patientData);
      setNewborn(newbornData && Object.keys(newbornData).length ? newbornData : null);
      setVaccines(Array.isArray(vaccineResult) ? vaccineResult : []);
    } catch (err) {
      setError(err.message || "Unable to load newborn overview.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    const run = async () => {
      await loadOverview();
    };

    if (id) run();
    else {
      setError("Patient ID is missing.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [id]);

  const completed = useMemo(
    () => vaccines.filter((v) => v.status === "completed"),
    [vaccines]
  );

  const pending = useMemo(
    () => vaccines.filter((v) => v.status !== "completed"),
    [vaccines]
  );

  const overdue = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return pending.filter((v) => {
      if (!v.dueDate) return false;
      const due = new Date(v.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    });
  }, [pending]);

  const upcoming = useMemo(
    () =>
      pending
        .filter((v) => v.dueDate && new Date(v.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [pending]
  );

  const markCompleted = async (vaccineId) => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user?.token) throw new Error("Please log in again.");

      const response = await fetch(
        `${API}/api/vaccinations/${vaccineId}/complete`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ dateGiven: new Date().toISOString() }),
        }
      );

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || "Could not update vaccination.");
      }

      await loadOverview(true);
    } catch (err) {
      setError(err.message || "Unable to update vaccination.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AshaNavbar />
        <div className="flex min-h-[65vh] items-center justify-center gap-3 text-slate-600">
          <LoaderCircle className="animate-spin text-blue-700" size={22} />
          Loading newborn overview...
        </div>
      </div>
    );
  }

  const patientName =
    patient?.name || patient?.fullName || patient?.personalDetails?.name || "Patient";

  return (
    <div className="min-h-screen pb-12 bg-[radial-gradient(ellipse_at_top_left,rgba(35,109,181,0.24),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(98,168,232,0.34),transparent_40%),linear-gradient(125deg,#B9DEFF_0%,#E5F2FF_38%,#C9E4FF_70%,#DCEBFA_100%)]">
      <AshaNavbar />

      <main className="mx-auto max-w-7xl space-y-6 px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => navigate(`/patients/${id}`)}
           className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-700 hover:shadow-sm"
          >
            <ArrowLeft size={16} /> Back to Patient Profile
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => loadOverview(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold disabled:opacity-60"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => navigate(`/newborn/${id}`)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
            >
              <Pencil size={15} /> Register Data
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle size={18} className="shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <header className="rounded-3xl bg-gradient-to-br from-blue-800 to-blue-700 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-100/10 px-3 py-1.5 text-xs font-semibold">
                <Baby size={15} /> JeevanVriksha · Child health
              </div>
              <h1 className="mt-4 text-2xl font-black sm:text-3xl">Newborn Overview</h1>
              <p className="mt-2 text-sm text-blue-50">
                Birth profile, health observations, immunization, and follow-up.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="rounded-lg bg-slate-100/10 px-3 py-2">{patientName}</span>
                <span className="rounded-lg bg-slate-100/10 px-3 py-2">
                  {getAge(newborn?.birthDate)}
                </span>
                <span className="rounded-lg bg-slate-100/10 px-3 py-2">
                  DOB: {formatDate(newborn?.birthDate)}
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-slate-100/10 p-4">
              <p className="text-xs text-blue-100">Vaccination progress</p>
              <p className="mt-1 text-3xl font-black">
                {completed.length}/{vaccines.length}
              </p>
              <p className="mt-1 text-xs text-blue-100">Doses marked completed</p>
            </div>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Birth weight" value={display(newborn?.birthWeight, " kg")} helper="Recorded at birth" icon={Weight} />
          <StatCard label="Temperature" value={display(newborn?.temperature, " °C")} helper="Latest saved newborn record" icon={Thermometer} />
          <StatCard label="Completed doses" value={completed.length} helper="Recorded as administered" icon={CheckCircle2} />
          <StatCard label="Overdue doses" value={overdue.length} helper="Review with the health worker" icon={CalendarDays} />
        </div>

        {!newborn && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No newborn record has been registered yet. Select <strong>Register / Edit</strong> to add the birth and health details.
          </div>
        )}

        <div className="grid items-start gap-6 xl:grid-cols-2">
          <Section title="Birth details" subtitle="Recorded profile information" icon={Baby}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DataItem label="Date of birth" value={formatDate(newborn?.birthDate)} />
              <DataItem label="Gender" value={newborn?.gender} />
              <DataItem label="Birth weight" value={newborn?.birthWeight} suffix=" kg" />
              <DataItem label="Birth length" value={newborn?.birthLength} suffix=" cm" />
              <DataItem label="Head circumference" value={newborn?.headCircumference} suffix=" cm" />
              <DataItem label="Delivery type" value={newborn?.deliveryType} />
              <DataItem label="Place of birth" value={newborn?.birthPlace} />
              <DataItem label="Gestational age at birth" value={newborn?.gestationalAgeWeeks} suffix=" weeks" />
            </dl>
          </Section>

          <Section title="Health and daily care" subtitle="Latest saved observations" icon={HeartPulse}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <DataItem label="Breastfeeding" value={newborn?.breastfeeding} />
              <DataItem label="Feeding pattern" value={newborn?.feedingFrequency} />
              <DataItem label="Urine output" value={newborn?.urineOutput} />
              <DataItem label="Stool observation" value={newborn?.stoolStatus} />
              <DataItem label="Jaundice observation" value={newborn?.jaundice} />
              <DataItem label="Umbilical cord" value={newborn?.cordCondition} />
              <DataItem label="Next follow-up" value={formatDate(newborn?.nextVisitDate)} />
              <DataItem label="Last record updated" value={formatDate(newborn?.updatedAt)} />
            </dl>
            {newborn?.notes && (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Notes</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{newborn.notes}</p>
              </div>
            )}
            {newborn?.birthComplications && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <strong>Birth complications recorded:</strong> {newborn.birthComplications}
              </div>
            )}
          </Section>
        </div>

        <Section
          title="Vaccination and polio drops"
          subtitle="Individual vaccine records from the vaccination collection"
          icon={Syringe}
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs text-emerald-800">Completed</p>
              <p className="mt-1 text-2xl font-black text-emerald-900">{completed.length}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs text-amber-800">Pending</p>
              <p className="mt-1 text-2xl font-black text-amber-900">{pending.length}</p>
            </div>
            <div className="rounded-xl bg-rose-50 p-4">
              <p className="text-xs text-rose-800">Overdue</p>
              <p className="mt-1 text-2xl font-black text-rose-900">{overdue.length}</p>
            </div>
          </div>

          {vaccines.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
              <Syringe className="mx-auto text-slate-400" size={30} />
              <p className="mt-3 font-semibold text-slate-800">No vaccination schedule found</p>
              <p className="mt-1 text-sm text-slate-500">
                Save the newborn's date of birth, then verify that the backend generated the vaccine schedule.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...vaccines].sort((a, b) => {
                if (a.status !== b.status) return a.status === "completed" ? 1 : -1;
                return new Date(a.dueDate || 0) - new Date(b.dueDate || 0);
              }).map((vaccine) => {
                const isCompleted = vaccine.status === "completed";
                const isOverdue = !isCompleted && vaccine.dueDate &&
                  new Date(vaccine.dueDate).setHours(0, 0, 0, 0) <
                  new Date().setHours(0, 0, 0, 0);

                return (
                  <article key={vaccine._id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-xl p-2.5 ${isCompleted ? "bg-emerald-50 text-emerald-700" : isOverdue ? "bg-rose-50 text-rose-700" : "bg-blue-50 text-blue-700"}`}>
                          {isCompleted ? <CheckCircle2 size={19} /> : <Syringe size={19} />}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{vaccine.vaccineName}</h3>
                          <p className="mt-1 text-xs text-slate-500">Due: {formatDate(vaccine.dueDate)}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {isCompleted ? `Administered: ${formatDate(vaccine.dateGiven)}` : "Administration not recorded"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${isCompleted ? "bg-emerald-50 text-emerald-700" : isOverdue ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-800"}`}>
                          {isCompleted ? "Completed" : isOverdue ? "Overdue — verify" : "Pending"}
                        </span>
                        {!isCompleted && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Confirm that ${vaccine.vaccineName} was actually administered?`)) {
                                markCompleted(vaccine._id);
                              }
                            }}
                            className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white hover:bg-blue-800"
                          >
                            Mark administered
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Section>

        <Section title="Follow-up and record status" subtitle="Review the next scheduled visit" icon={ClipboardList}>
          <div className="grid gap-3 sm:grid-cols-2">
            <DataItem label="Next follow-up date" value={formatDate(newborn?.nextVisitDate)} />
            <DataItem label="Immunization summary" value={newborn?.immunizationStatus} />
            <DataItem label="Record created" value={formatDate(newborn?.createdAt)} />
            <DataItem label="Last updated" value={formatDate(newborn?.updatedAt)} />
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">
            This page shows recorded information, not a clinical diagnosis. Confirm vaccine doses against the child's immunization card and applicable health-worker schedule.
          </p>
        </Section>
      </main>
    </div>
  );
};

export default NewbornOverview;
