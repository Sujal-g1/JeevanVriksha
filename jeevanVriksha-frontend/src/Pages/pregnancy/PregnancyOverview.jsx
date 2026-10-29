
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  Plus,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Syringe,
  TrendingUp,
  UserRound,
} from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

const display = (value, suffix = "") => {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return "Not recorded";
  }

  if (Array.isArray(value)) return value.join(", ");

  if (typeof value === "boolean") return value ? "Yes" : "No";

  return `${value}${suffix}`;
};

const hasValue = (value) =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  !(Array.isArray(value) && value.length === 0);

function Section({ title, subtitle, icon: Icon, children, action }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-100 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-teal-50 p-2.5 text-blue-700">
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
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function StatCard({ label, value, helper, icon: Icon, tone = "teal" }) {
  const tones = {
    teal: "bg-teal-50 text-blue-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-100 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-5 text-slate-500 sm:text-sm">
            {label}
          </p>
          <p className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          {helper && (
            <p className="mt-1 text-xs leading-5 text-slate-500">{helper}</p>
          )}
        </div>
        <div className={`shrink-0 rounded-xl p-2.5 ${tones[tone]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function DataItem({ label, value, suffix = "" }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-3.5">
      <dt className="text-xs leading-5 text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-800">
        {display(value, suffix)}
      </dd>
    </div>
  );
}

function StatusItem({ label, value }) {
  const recorded = hasValue(value);
  const normalized = String(value ?? "").toLowerCase();
  const explicitlyNegative =
    normalized === "negative" ||
    normalized === "no" ||
    normalized === "not required" ||
    normalized === "not applicable";

  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="mt-1 break-words text-xs text-slate-500">
          {display(value)}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
          !recorded
            ? "bg-slate-100 text-slate-500"
            : explicitlyNegative
              ? "bg-emerald-50 text-emerald-700"
              : "bg-blue-50 text-blue-700"
        }`}
      >
        {!recorded ? "MISSING" : "RECORDED"}
      </span>
    </div>
  );
}

function TrendChart({
  title,
  subtitle,
  data,
  dataKey,
  color,
  unit,
  emptyMessage,
  secondaryKey,
}) {
  const usableData = data.filter(
    (item) =>
      Number.isFinite(item[dataKey]) &&
      (!secondaryKey || Number.isFinite(item[secondaryKey]))
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-100 p-4 sm:p-5">
      <div className="mb-5">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>

      {usableData.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 px-5 text-center">
          <Activity className="mb-3 text-slate-400" size={27} />
          <p className="text-sm font-semibold text-slate-700">
            Not enough recorded data
          </p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
            {emptyMessage ||
              "Record measurements during ANC visits to view trends here."}
          </p>
        </div>
      ) : (
        <>
          {usableData.length === 1 && (
            <p className="mb-2 text-xs text-amber-700">
              One measurement recorded. A trend will appear as more visits are
              documented.
            </p>
          )}
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={usableData}
                margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                <XAxis
                  dataKey="dateLabel"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                  width={42}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(value, name) => [
                    `${value} ${unit}`,
                    name,
                  ]}
                  labelFormatter={(label) => `Visit date: ${label}`}
                />
                {secondaryKey && (
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                )}
                <Line
                  type="monotone"
                  dataKey={dataKey}
                  name={title}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: color, strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
                {secondaryKey && (
                  <Line
                    type="monotone"
                    dataKey={secondaryKey}
                    name="Diastolic"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Source: recorded ANC visits. This chart is for monitoring, not
            diagnosis.
          </p>
        </>
      )}
    </div>
  );
}

function parseBloodPressure(value) {
  if (typeof value !== "string") return {};

  const match = value.match(/^\s*(\d{2,3})\s*[/\-]\s*(\d{2,3})\s*$/);

  if (!match) return {};

  return {
    systolic: Number(match[1]),
    diastolic: Number(match[2]),
  };
}

function getVisitDate(visit) {
  return visit.visitDate || visit.createdAt || null;
}

const PregnancyOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [pregnancy, setPregnancy] = useState({});
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      setLoading(true);
      setError("");

      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!user?.token) {
          throw new Error("Session expired. Please log in again.");
        }

        if (!API) {
          throw new Error("VITE_API_URL is not configured.");
        }

        const headers = {
          Authorization: `Bearer ${user.token}`,
        };

        const [patientResponse, pregnancyResponse] = await Promise.all([
          fetch(`${API}/api/patients/${id}`, { headers }),
          fetch(`${API}/api/pregnancy/${id}`, { headers }),
        ]);

        const patientResult = await patientResponse.json();
        const pregnancyResult = await pregnancyResponse.json();

        if (!patientResponse.ok) {
          throw new Error(
            patientResult?.message || "Unable to load patient details."
          );
        }

        if (!pregnancyResponse.ok) {
          throw new Error(
            pregnancyResult?.message || "Unable to load pregnancy records."
          );
        }

        const patientData =
          patientResult?.patient ??
          patientResult?.data?.patient ??
          patientResult?.data ??
          patientResult;

        if (!active) return;

        setPatient(patientData);
        setPregnancy(pregnancyResult?.pregnancy || {});
        setVisits(
          Array.isArray(pregnancyResult?.visits)
            ? pregnancyResult.visits
            : []
        );
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load pregnancy overview.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (id) loadOverview();
    else {
      setError("Patient ID is missing.");
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [id]);

  // API returns newest visit first. Reverse a copy for chronological charts.
  const chronologicalVisits = useMemo(
    () => [...visits].sort((a, b) => {
      const dateA = new Date(getVisitDate(a) || 0).getTime();
      const dateB = new Date(getVisitDate(b) || 0).getTime();
      return dateA - dateB;
    }),
    [visits]
  );

  const latest = visits[0] || null;

  const chartData = useMemo(
    () =>
      chronologicalVisits.map((visit, index) => {
        const bp = parseBloodPressure(visit.bp);

        const rawDate = getVisitDate(visit);
        const date = rawDate ? new Date(rawDate) : null;

        return {
          dateLabel:
            date && !Number.isNaN(date.getTime())
              ? date.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })
              : `Visit ${index + 1}`,
          systolic: bp.systolic,
          diastolic: bp.diastolic,
          hemoglobin:
            visit.hemoglobin !== "" &&
            visit.hemoglobin !== null &&
            visit.hemoglobin !== undefined
              ? Number(visit.hemoglobin)
              : undefined,
          weight:
            visit.weight !== "" &&
            visit.weight !== null &&
            visit.weight !== undefined
              ? Number(visit.weight)
              : undefined,
          fetalHeartRate:
            visit.fetalHeartRate !== "" &&
            visit.fetalHeartRate !== null &&
            visit.fetalHeartRate !== undefined
              ? Number(visit.fetalHeartRate)
              : undefined,
        };
      }),
    [chronologicalVisits]
  );

  const screeningItems = latest ? [
        ["HIV screening", latest.hivScreening],
        ["Syphilis screening", latest.syphilisScreening],
        ["Hepatitis B screening", latest.hepatitisBScreening],
        ["Urine test", latest.urineTest],
        ["Blood group", latest.bloodGroup],
        ["Blood sugar", latest.bloodSugar],
      ]
    : [];

  const supplementItems = latest ? [
        ["Iron tablets", latest.ironTablets],
        ["Calcium tablets", latest.calciumTablets],
        ["Folic acid", latest.folicAcid],
        ["Tetanus / Td vaccination", latest.tetanusVaccination],
      ]
    : [];

  const recordedFieldCount = useMemo(() => {
    const pregnancyFields = [
      "lmpDate",
      "dueDate",
      "gravida",
      "para",
      "previousPregnancyComplications",
      "multiplePregnancy",
      "birthFacility",
      "emergencyContact",
      "transportArranged",
      "deliveryPlan",
      "notes",
    ];

    const visitFields = [
      "trimester",
      "gestationalWeeks",
      "highRiskPregnancy",
      "ancVisits",
      "temperature",
      "pulse",
      "hemoglobin",
      "bp",
      "weight",
      "bloodGroup",
      "bloodSugar",
      "hivScreening",
      "syphilisScreening",
      "hepatitisBScreening",
      "fetalHeartRate",
      "fetalMovement",
      "fundalHeight",
      "fetalPosition",
      "ironTablets",
      "calciumTablets",
      "folicAcid",
      "tetanusVaccination",
      "urineTest",
      "ultrasoundDate",
      "ultrasoundFindings",
      "nextVisitDate",
      "nutritionCounselling",
      "mentalWellbeing",
      "referralStatus",
      "dangerSigns",
    ];

    return (
      pregnancyFields.filter((field) => hasValue(pregnancy[field])).length +
      (latest
        ? visitFields.filter((field) => hasValue(latest[field])).length
        : 0)
    );
  }, [pregnancy, latest]);

  const riskRecorded = hasValue(latest?.highRiskPregnancy);
  const highRisk =
    String(latest?.highRiskPregnancy).toLowerCase() === "yes" ||
    latest?.highRiskPregnancy === true;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AshaNavbar />
        <div className="flex min-h-[70vh] items-center justify-center gap-3 text-slate-600">
          <RefreshCw className="animate-spin text-blue-700" size={21} />
          Loading maternal health records...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fb] pb-12
    bg-[radial-gradient(ellipse_at_top_left,rgba(35,109,181,0.24),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(98,168,232,0.34),transparent_40%),linear-gradient(125deg,#B9DEFF_0%,#E5F2FF_38%,#C9E4FF_70%,#DCEBFA_100%)]">
      <AshaNavbar />

      <main className="mx-auto max-w-7xl space-y-6 px-4 pb-10 pt-24 sm:px-6 lg:px-8">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-blue-700 hover:shadow-sm"
                >
                  <ArrowLeft size={16} />
                  Back to Profile
                </button>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertTriangle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load records</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Page heading */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 via-blue-700 to-blue-800 p-6 text-white shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[36px] border-white/5" />
          <div className="pointer-events-none absolute -bottom-24 right-36 h-48 w-48 rounded-full bg-blue-300/10 blur-2xl" />

          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-slate-100/10 px-3 py-1.5 text-xs font-semibold text-teal-50">
                <HeartPulse size={14} />
                Maternal health monitoring
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Pregnancy Overview
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50/85">
                Monitor documented maternal measurements, fetal observations,
                ANC visits, and birth preparedness in one place.
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100/10 px-3 py-2">
                  <UserRound size={15} />
                  {patient?.name || patient?.fullName || "Patient"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100/10 px-3 py-2">
                  <CalendarDays size={15} />
                  Due: {formatDate(pregnancy.dueDate)}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(`/pregnancy/${id}/`)
              }
              className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-blue-800 shadow-sm transition hover:bg-blue-50"
            >
              <Plus size={18} />
              Register data
            </button>
          </div>
        </header>

        {/* Summary metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Gestational age"
            value={
              latest && hasValue(latest.gestationalWeeks)
                ? `${latest.gestationalWeeks} weeks`
                : "Not recorded"
            }
            helper={
              latest?.trimester
                ? `Trimester ${latest.trimester}`
                : "Trimester not recorded"
            }
            icon={Baby}
            tone="teal"
          />
          <StatCard
            label="ANC visits"
            value={visits.length}
            helper="Visits saved in the system"
            icon={ClipboardList}
            tone="blue"
          />
          <StatCard
            label="Next scheduled visit"
            value={formatDate(latest?.nextVisitDate)}
            helper="Based on the latest recorded visit"
            icon={CalendarDays}
            tone="violet"
          />
          <StatCard
            label="Latest risk assessment"
            value={
              !riskRecorded
                ? "Not recorded"
                : highRisk
                  ? "High risk"
                  : String(latest.highRiskPregnancy)
            }
            helper={
              highRisk
                ? "Review documented assessment and referral plan"
                : "Reflects the saved assessment only"
            }
            icon={highRisk ? AlertTriangle : ShieldCheck}
            tone={highRisk ? "rose" : "amber"}
          />
        </div>

        {/* Chart area */}
        <Section
          title="Health trends"
          subtitle="Longitudinal measurements from recorded ANC visits"
          icon={TrendingUp}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <TrendChart
              title="Blood pressure"
              subtitle="Systolic and diastolic pressure (mmHg)"
              data={chartData}
              dataKey="systolic"
              secondaryKey="diastolic"
              color="#0d9488"
              unit="mmHg"
              emptyMessage='Enter blood pressure in the format "120/80" for a visit.'
            />
            <TrendChart
              title="Hemoglobin"
              subtitle="Recorded hemoglobin measurements"
              data={chartData}
              dataKey="hemoglobin"
              color="#8b5cf6"
              unit="g/dL"
            />
            <TrendChart
              title="Maternal weight"
              subtitle="Weight recorded at each visit"
              data={chartData}
              dataKey="weight"
              color="#0284c7"
              unit="kg"
            />
            <TrendChart
              title="Fetal heart rate"
              subtitle="Fetal heart rate recorded at each visit"
              data={chartData}
              dataKey="fetalHeartRate"
              color="#e11d48"
              unit="bpm"
            />
          </div>
        </Section>

        {/* Pregnancy and latest measurements */}
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <Section
            title="Pregnancy details"
            subtitle="Information about this pregnancy"
            icon={Baby}
          >
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DataItem label="Last menstrual period" value={formatDate(pregnancy.lmpDate)} />
              <DataItem label="Expected due date" value={formatDate(pregnancy.dueDate)} />
              <DataItem label="Gravida" value={pregnancy.gravida} />
              <DataItem label="Para" value={pregnancy.para} />
              <DataItem label="Multiple pregnancy" value={pregnancy.multiplePregnancy} />
              <DataItem label="Pregnancy status" value={pregnancy.status} />
              <DataItem
                label="Previous pregnancy complications"
                value={pregnancy.previousPregnancyComplications}
              />
            </dl>
            {hasValue(pregnancy.notes) && (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pregnancy notes
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {pregnancy.notes}
                </p>
              </div>
            )}
          </Section>

          <Section
            title="Latest maternal measurements"
            subtitle={latest ? `Recorded ${formatDate(getVisitDate(latest))}` : "No visit data available"}
            icon={HeartPulse}
          >
            {latest ? (
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DataItem label="Blood pressure" value={latest.bp} suffix=" mmHg" />
                <DataItem label="Hemoglobin" value={latest.hemoglobin} suffix=" g/dL" />
                <DataItem label="Weight" value={latest.weight} suffix=" kg" />
                <DataItem label="Temperature" value={latest.temperature} suffix=" °C" />
                <DataItem label="Pulse" value={latest.pulse} suffix=" bpm" />
                <DataItem label="Blood sugar" value={latest.bloodSugar} />
                <DataItem label="Blood group" value={latest.bloodGroup} />
                <DataItem label="Urine test" value={latest.urineTest} />
              </dl>
            ) : (
              <EmptyState
                text="No maternal measurements have been recorded yet."
                action={() =>
                  navigate(`/patients/${id}/pregnancy/register`)
                }
              />
            )}
          </Section>
        </div>

        {/* Fetal monitoring */}
        <Section
          title="Fetal monitoring"
          subtitle="Observations captured during the latest ANC visit"
          icon={Activity}
        >
          {latest ? (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DataItem label="Fetal heart rate" value={latest.fetalHeartRate} suffix=" bpm" />
              <DataItem label="Fetal movement" value={latest.fetalMovement} />
              <DataItem label="Fundal height" value={latest.fundalHeight} suffix=" cm" />
              <DataItem label="Fetal position" value={latest.fetalPosition} />
              <DataItem label="Ultrasound date" value={formatDate(latest.ultrasoundDate)} />
              <DataItem label="Ultrasound findings" value={latest.ultrasoundFindings} />
              <DataItem label="Gestational age" value={latest.gestationalWeeks} suffix=" weeks" />
              <DataItem label="Trimester" value={latest.trimester} />
            </dl>
          ) : (
            <p className="text-sm text-slate-500">
              Fetal observations will appear after an ANC visit is registered.
            </p>
          )}
        </Section>

        {/* Screening and supplements */}
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <Section
            title="Screening & investigations"
            subtitle="Most recently documented screening results"
            icon={Stethoscope}
          >
            {screeningItems.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {screeningItems.map(([label, value]) => (
                  <StatusItem key={label} label={label} value={value} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Screening records will appear when a visit is saved.
              </p>
            )}
          </Section>

          <Section
            title="Supplements & vaccination"
            subtitle="Most recently documented records"
            icon={Syringe}
          >
            {supplementItems.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {supplementItems.map(([label, value]) => (
                  <StatusItem key={label} label={label} value={value} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Supplement and vaccination records will appear here.
              </p>
            )}
          </Section>
        </div>

        {/* Wellbeing and birth preparation */}
        <div className="grid items-start gap-6 xl:grid-cols-2">
          <Section
            title="Wellbeing & care coordination"
            subtitle="Counselling, referrals, and follow-up"
            icon={HeartPulse}
          >
            <dl className="grid gap-3 sm:grid-cols-2">
              <DataItem label="Nutrition counselling" value={latest?.nutritionCounselling} />
              <DataItem label="Mental wellbeing" value={latest?.mentalWellbeing} />
              <DataItem label="Referral status" value={latest?.referralStatus} />
              <DataItem label="Next ANC visit" value={formatDate(latest?.nextVisitDate)} />
              <DataItem label="Danger signs" value={latest?.dangerSigns} />
              <DataItem label="ANC visits (reported)" value={latest?.ancVisits} />
            </dl>

            {hasValue(latest?.dangerSigns) &&
              !(Array.isArray(latest.dangerSigns) && latest.dangerSigns.length === 0) && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle size={17} />
                    <p className="text-sm font-bold">Documented danger signs</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-amber-900">
                    {display(latest.dangerSigns)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-amber-800">
                    Follow the applicable clinical protocol for assessment and
                    urgent referral when indicated.
                  </p>
                </div>
              )}
          </Section>

          <Section
            title="Birth preparedness"
            subtitle="Delivery planning and emergency arrangements"
            icon={CalendarDays}
          >
            <dl className="grid gap-3 sm:grid-cols-2">
              <DataItem label="Planned birth facility" value={pregnancy.birthFacility} />
              <DataItem label="Transport arranged" value={pregnancy.transportArranged} />
              <DataItem label="Emergency contact" value={pregnancy.emergencyContact} />
              <DataItem label="Delivery plan" value={pregnancy.deliveryPlan} />
            </dl>
          </Section>
        </div>

        {/* ANC history */}
        <Section
          title="ANC visit history"
          subtitle={`${visits.length} saved ${visits.length === 1 ? "visit" : "visits"} · Newest first`}
          icon={ClipboardList}
          action={
            <button
              onClick={() =>
                navigate(`/patients/${id}/pregnancy/register`)
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-teal-800"
            >
              <Plus size={15} />
              Add visit
            </button>
          }
        >
          {visits.length === 0 ? (
            <EmptyState
              text="No ANC visits have been recorded yet. Register the first visit to start tracking measurements and care."
              action={() =>
                navigate(`/patients/${id}/pregnancy/register`)
              }
            />
          ) : (
            <div className="space-y-4">
              {visits.map((visit, index) => (
                <article
                  key={visit._id || `${getVisitDate(visit)}-${index}`}
                  className="rounded-2xl border border-slate-200 bg-slate-100 p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-teal-50 p-2 text-blue-700">
                          <ClipboardList size={17} />
                        </div>
                        <h3 className="font-bold text-slate-900">
                          ANC Visit {visits.length - index}
                        </h3>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDate(getVisitDate(visit))}
                      </p>
                    </div>

                    <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">
                      {hasValue(visit.trimester)
                        ? `Trimester ${visit.trimester}`
                        : "Trimester not recorded"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <DataItem label="Blood pressure" value={visit.bp} />
                    <DataItem label="Hemoglobin" value={visit.hemoglobin} suffix=" g/dL" />
                    <DataItem label="Weight" value={visit.weight} suffix=" kg" />
                    <DataItem label="Fetal heart rate" value={visit.fetalHeartRate} suffix=" bpm" />
                  </div>

                  {hasValue(visit.notes) && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-3.5">
                      <p className="text-xs font-semibold text-slate-500">
                        Visit notes
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {visit.notes}
                      </p>
                    </div>
                  )}

                  <details className="group mt-4 border-t border-slate-100 pt-4">
                    <summary className="cursor-pointer list-none text-sm font-semibold text-blue-700">
                      <span className="group-open:hidden">View all visit details +</span>
                      <span className="hidden group-open:inline">Hide visit details −</span>
                    </summary>

                    <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[
                        ["Gestational weeks", visit.gestationalWeeks],
                        ["Trimester", visit.trimester],
                        ["ANC visits (reported)", visit.ancVisits],
                        ["High-risk assessment", visit.highRiskPregnancy],
                        ["Temperature", display(visit.temperature, " °C")],
                        ["Pulse", display(visit.pulse, " bpm")],
                        ["Blood group", visit.bloodGroup],
                        ["Blood sugar", visit.bloodSugar],
                        ["Urine test", visit.urineTest],
                        ["HIV screening", visit.hivScreening],
                        ["Syphilis screening", visit.syphilisScreening],
                        ["Hepatitis B screening", visit.hepatitisBScreening],
                        ["Fetal movement", visit.fetalMovement],
                        ["Fundal height", display(visit.fundalHeight, " cm")],
                        ["Fetal position", visit.fetalPosition],
                        ["Ultrasound date", formatDate(visit.ultrasoundDate)],
                        ["Ultrasound findings", visit.ultrasoundFindings],
                        ["Iron tablets", visit.ironTablets],
                        ["Calcium tablets", visit.calciumTablets],
                        ["Folic acid", visit.folicAcid],
                        ["Tetanus vaccination", visit.tetanusVaccination],
                        ["Nutrition counselling", visit.nutritionCounselling],
                        ["Mental wellbeing", visit.mentalWellbeing],
                        ["Referral status", visit.referralStatus],
                        ["Next visit", formatDate(visit.nextVisitDate)],
                        ["Danger signs", visit.dangerSigns],
                      ].map(([label, value]) => (
                        <DataItem key={label} label={label} value={value} />
                      ))}
                    </dl>
                  </details>
                </article>
              ))}
            </div>
          )}
        </Section>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
              <CheckCircle2 size={19} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Record completeness
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {recordedFieldCount} pregnancy and latest-visit fields contain
                data. This is a data-entry count, not a measure of clinical
                health or quality of care.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              navigate(`/patients/${id}/pregnancy/register`)
            }
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-teal-200 px-4 py-2.5 text-sm font-bold text-teal-800 transition hover:bg-teal-50"
          >
            <Plus size={17} />
            Update records
          </button>
        </div>

        <p className="px-1 text-xs leading-5 text-slate-500">
          This dashboard presents documented records and is not a diagnostic
          tool. Clinical decisions, reference ranges, and urgent referrals
          should follow applicable maternal-care protocols and assessment by
          qualified healthcare professionals.
        </p>
      </main>
    </div>
  );
};

function EmptyState({ text, action }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-5 py-8 text-center">
      <ClipboardList className="mx-auto text-slate-400" size={30} />
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
        {text}
      </p>
      <button
        onClick={action}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
      >
        <Plus size={16} />
        Register ANC visit
      </button>
    </div>
  );
}

export default PregnancyOverview;
