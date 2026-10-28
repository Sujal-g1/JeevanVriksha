
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Activity,
  Baby,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Save,
  RefreshCw,
  AlertTriangle,
  UserRound,
  Pill,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AshaNavbar from "../../components/AshaNavbar";

const API = import.meta.env.VITE_API_URL;

const initialPregnancy = {
  trimester: "",
  gestationalWeeks: "",
  lmpDate: "",
  dueDate: "",
  gravida: "",
  para: "",
  previousPregnancyComplications: "",
  highRiskPregnancy: "",
  ancVisits: "",
  temperature: "",
  pulse: "",
  hemoglobin: "",
  bp: "",
  weight: "",
  bloodGroup: "",
  bloodSugar: "",
  hivScreening: "",
  syphilisScreening: "",
  hepatitisBScreening: "",
  fetalHeartRate: "",
  fetalMovement: "",
  fundalHeight: "",
  fetalPosition: "",
  multiplePregnancy: "",
  ironTablets: "",
  calciumTablets: "",
  folicAcid: "",
  tetanusVaccination: "",
  urineTest: "",
  ultrasoundDate: "",
  ultrasoundFindings: "",
  nextVisitDate: "",
  nutritionCounselling: "",
  mentalWellbeing: "",
  transportArranged: "",
  birthFacility: "",
  emergencyContact: "",
  referralStatus: "",
  dangerSigns: [],
  deliveryPlan: "",
  notes: "",
};

const steps = [
  {
    title: "Pregnancy",
    subtitle: "Dating & history",
    icon: CalendarDays,
  },
  {
    title: "Maternal health",
    subtitle: "Vitals & tests",
    icon: Stethoscope,
  },
  {
    title: "Fetal wellbeing",
    subtitle: "Baby's observations",
    icon: Baby,
  },
  {
    title: "Preventive care",
    subtitle: "Screening & supplements",
    icon: ShieldCheck,
  },
  {
    title: "Care plan",
    subtitle: "Wellbeing & delivery",
    icon: ClipboardList,
  },
];

const dangerSignOptions = [
  "Vaginal bleeding",
  "Severe headache or blurred vision",
  "Severe abdominal pain",
  "Swelling of face or hands",
  "Fever",
  "Difficulty breathing",
  "Fluid leaking",
  "Reduced fetal movement",
  "Convulsions / fits",
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

const labelClass =
  "mb-1.5 block text-[13px] font-semibold text-slate-700";

function Field({ label, children, hint, required = false }) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {children}
      {hint && (
        <p className="mt-1.5 text-xs leading-5 text-slate-400">{hint}</p>
      )}
    </div>
  );
}

function FormSection({ title, description, children }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, hint }) {
  return (
    <Field label={label} hint={hint}>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        className={inputClass}
      >
        <option value="">Select an option</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </Field>
  );
}

function TextField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  min,
  max,
  step,
}) {
  return (
    <Field label={label} hint={hint}>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={inputClass}
      />
    </Field>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  hint,
}) {
  return (
    <Field label={label} hint={hint}>
      <textarea
        name={name}
        rows={rows}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClass} resize-y`}
      />
    </Field>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="max-w-[60%] break-words text-right text-xs font-semibold text-slate-800">
        {value || "Not recorded"}
      </span>
    </div>
  );
}

function StepIndicator({ currentStep, onStepClick }) {
  return (
    <>
      <div className="hidden md:grid md:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const active = index === currentStep;
          const complete = index < currentStep;

          return (
            <button
              type="button"
              key={step.title}
              onClick={() => onStepClick(index)}
              className="group relative flex min-w-0 flex-col items-center px-2 pb-1 text-center"
            >
              {index < steps.length - 1 && (
                <div
                  className={`absolute left-[calc(50%+22px)] top-5 h-px w-[calc(100%-44px)] ${
                    complete ? "bg-teal-600" : "bg-slate-200"
                  }`}
                />
              )}
              <span
                className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm transition ${
                  active
                    ? "border-teal-700 bg-teal-700 text-white shadow-lg shadow-teal-700/20"
                    : complete
                      ? "border-teal-600 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-white text-slate-400 group-hover:border-teal-300"
                }`}
              >
                {complete ? <Check size={17} /> : <Icon size={17} />}
              </span>
              <span
                className={`mt-2 text-xs font-bold ${
                  active ? "text-teal-800" : "text-slate-600"
                }`}
              >
                {step.title}
              </span>
              <span className="mt-1 text-[10px] text-slate-400">
                {step.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      <div className="md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {(() => {
              const Icon = steps[currentStep].icon;
              return (
                <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
                  <Icon size={21} />
                </div>
              );
            })()}
            <div>
              <p className="text-xs font-semibold text-teal-700">
                STEP {currentStep + 1} OF {steps.length}
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {steps[currentStep].title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {steps[currentStep].subtitle}
              </p>
            </div>
          </div>
          <span className="text-sm font-bold text-slate-500">
            {Math.round(((currentStep + 1) / steps.length) * 100)}%
          </span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </>
  );
}

const PregnancyDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [pregnancy, setPregnancy] = useState(initialPregnancy);
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const getHeaders = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?.token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    return {
      Authorization: `Bearer ${user.token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const evaluateRisks = useCallback((data) => {
    const alerts = [];
    const hb = Number(data.hemoglobin);
    const bpParts = String(data.bp || "")
      .split("/")
      .map((value) => Number(value.trim()));

    const temperature = Number(data.temperature);

    if (data.hemoglobin !== "" && Number.isFinite(hb)) {
      if (hb < 7) {
        alerts.push(
          "Severely low hemoglobin recorded — urgent clinical assessment is needed."
        );
      } else if (hb < 11) {
        alerts.push(
          "Hemoglobin is below the commonly used pregnancy threshold; clinician review is recommended."
        );
      }
    }

    if (data.bp && bpParts.length === 2 && bpParts.every(Number.isFinite)) {
      const [systolic, diastolic] = bpParts;

      if (systolic >= 160 || diastolic >= 110) {
        alerts.push(
          "Very high blood pressure recorded — arrange emergency obstetric assessment."
        );
      } else if (systolic >= 140 || diastolic >= 90) {
        alerts.push(
          "High blood pressure recorded — prompt assessment by a qualified clinician is needed."
        );
      }
    }

    if (
      data.temperature !== "" &&
      Number.isFinite(temperature) &&
      temperature >= 38
    ) {
      alerts.push(
        "Fever recorded (38°C or higher) — prompt clinical assessment is recommended."
      );
    }

    if (data.highRiskPregnancy === "Yes") {
      alerts.push(
        "This pregnancy is marked high-risk — confirm the clinician-led care and follow-up plan."
      );
    }

    if (
      data.fetalMovement === "Reduced" ||
      data.fetalMovement === "Absent"
    ) {
      alerts.push(
        "Reduced or absent fetal movement reported — urgent maternity assessment is needed."
      );
    }

    if (Array.isArray(data.dangerSigns) && data.dangerSigns.length) {
      alerts.push(
        `Danger sign(s) selected: ${data.dangerSigns.join(", ")}. Refer promptly according to local clinical protocol.`
      );
    }

    setRiskAlerts(alerts);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        if (!id) throw new Error("Patient ID is missing from the URL.");

        const headers = getHeaders();

        const [patientRes, pregnancyRes] = await Promise.all([
          fetch(`${API}/api/patients/${id}`, { headers }),
          fetch(`${API}/api/pregnancy/${id}`, { headers }),
        ]);

        const patientResult = await patientRes.json().catch(() => null);
        const pregnancyResult = pregnancyRes.ok
          ? await pregnancyRes.json().catch(() => null)
          : null;

        if (!patientRes.ok) {
          throw new Error(
            patientResult?.message ||
              `Unable to load patient details (${patientRes.status}).`
          );
        }

        const patientData =
          patientResult?.patient ??
          patientResult?.data?.patient ??
          patientResult?.data ??
          patientResult;

        if (
          !patientData ||
          typeof patientData !== "object" ||
          Array.isArray(patientData)
        ) {
          throw new Error("The patient API returned an invalid response.");
        }

        const pregnancyData =
          pregnancyResult?.pregnancy ??
          pregnancyResult?.data?.pregnancy ??
          pregnancyResult?.data ??
          pregnancyResult ??
          {};

        if (!active) return;

        setPatient(patientData);

        if (
          pregnancyData &&
          typeof pregnancyData === "object" &&
          !Array.isArray(pregnancyData)
        ) {
          const formatted = {
            ...initialPregnancy,
            ...pregnancyData,
            lmpDate: pregnancyData.lmpDate
              ? String(pregnancyData.lmpDate).split("T")[0]
              : "",
            dueDate: pregnancyData.dueDate
              ? String(pregnancyData.dueDate).split("T")[0]
              : "",
            ultrasoundDate: pregnancyData.ultrasoundDate
              ? String(pregnancyData.ultrasoundDate).split("T")[0]
              : "",
            nextVisitDate: pregnancyData.nextVisitDate
              ? String(pregnancyData.nextVisitDate).split("T")[0]
              : "",
            dangerSigns: Array.isArray(pregnancyData.dangerSigns)
              ? pregnancyData.dangerSigns
              : [],
          };

          setPregnancy(formatted);
          evaluateRisks(formatted);
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load the record.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [id, getHeaders, evaluateRisks]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setPregnancy((current) => {
      const updated = { ...current, [name]: value };
      evaluateRisks(updated);
      return updated;
    });

    setSuccess("");
  };

  const toggleDangerSign = (sign) => {
    setPregnancy((current) => {
      const currentSigns = Array.isArray(current.dangerSigns)
        ? current.dangerSigns
        : [];

      const updated = {
        ...current,
        dangerSigns: currentSigns.includes(sign)
          ? currentSigns.filter((item) => item !== sign)
          : [...currentSigns, sign],
      };

      evaluateRisks(updated);
      return updated;
    });

    setSuccess("");
  };

  const saveData = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const headers = getHeaders();

      const response = await fetch(`${API}/api/pregnancy/update`, {
        method: "POST",
        headers,
        body: JSON.stringify({ patientId: id, ...pregnancy }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ||
            `Unable to save pregnancy data (${response.status}).`
        );
      }

      const saved = result?.pregnancy ?? result?.data?.pregnancy;

      if (saved && typeof saved === "object") {
        setPregnancy((current) => ({
          ...current,
          ...saved,
          dangerSigns: Array.isArray(saved.dangerSigns)
            ? saved.dangerSigns
            : current.dangerSigns,
        }));
      }

      evaluateRisks(pregnancy);
      setSuccess(result?.message || "Pregnancy record saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save pregnancy information.");
    } finally {
      setSaving(false);
    }
  };

  const completedFields = useMemo(() => {
    const fields = Object.entries(pregnancy).filter(
      ([key]) => key !== "dangerSigns"
    );

    return fields.filter(([, value]) => value !== "" && value != null).length;
  }, [pregnancy]);

  const gestationLabel = useMemo(() => {
    const weeks = Number(pregnancy.gestationalWeeks);

    if (
      pregnancy.gestationalWeeks === "" ||
      !Number.isFinite(weeks) ||
      weeks < 0
    ) {
      return "Not recorded";
    }

    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }, [pregnancy.gestationalWeeks]);

  const changeStep = (nextStep) => {
    if (nextStep < 0 || nextStep >= steps.length) return;

    setCurrentStep(nextStep);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AshaNavbar />
        <div className="flex min-h-[70vh] items-center justify-center gap-3 text-sm text-slate-600">
          <RefreshCw size={19} className="animate-spin text-teal-700" />
          Loading patient record...
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AshaNavbar />
        <main className="mx-auto max-w-3xl px-4 pt-28">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="rounded-2xl border border-rose-200 bg-white p-6">
            <h1 className="font-bold text-slate-900">
              Could not load patient
            </h1>
            <p className="mt-2 text-sm text-rose-700">
              {error || "Patient details were not returned by the server."}
            </p>
          </div>
        </main>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-8">
            <FormSection
              title="Pregnancy dating"
              description="Record the current pregnancy's dates and gestational age."
            >
              <SelectField
                label="Trimester"
                name="trimester"
                value={pregnancy.trimester}
                onChange={handleChange}
                options={[
                  ["1", "First trimester"],
                  ["2", "Second trimester"],
                  ["3", "Third trimester"],
                ]}
              />
              <TextField
                label="Gestational age (weeks)"
                name="gestationalWeeks"
                type="number"
                min="0"
                max="45"
                value={pregnancy.gestationalWeeks}
                onChange={handleChange}
                placeholder="e.g. 24"
                hint="Use the clinician-confirmed estimate."
              />
              <TextField
                label="Last menstrual period (LMP)"
                name="lmpDate"
                type="date"
                value={pregnancy.lmpDate}
                onChange={handleChange}
              />
              <TextField
                label="Expected due date (EDD)"
                name="dueDate"
                type="date"
                value={pregnancy.dueDate}
                onChange={handleChange}
              />
              <TextField
                label="Next ANC visit"
                name="nextVisitDate"
                type="date"
                value={pregnancy.nextVisitDate}
                onChange={handleChange}
              />
              <TextField
                label="ANC visits completed"
                name="ancVisits"
                type="number"
                min="0"
                value={pregnancy.ancVisits}
                onChange={handleChange}
                placeholder="Number of visits"
              />
            </FormSection>

            <div className="border-t border-slate-100" />

            <FormSection
              title="Obstetric history"
              description="Record previous pregnancies and relevant complications."
            >
              <TextField
                label="Gravida — total pregnancies"
                name="gravida"
                type="number"
                min="0"
                value={pregnancy.gravida}
                onChange={handleChange}
                hint="Include the current pregnancy."
              />
              <TextField
                label="Para — births reaching viability"
                name="para"
                type="number"
                min="0"
                value={pregnancy.para}
                onChange={handleChange}
              />
              <SelectField
                label="Multiple pregnancy"
                name="multiplePregnancy"
                value={pregnancy.multiplePregnancy}
                onChange={handleChange}
                options={[
                  ["Singleton", "Singleton"],
                  ["Twins", "Twins"],
                  ["Higher order", "Triplets or more"],
                  ["Unknown", "Unknown"],
                ]}
              />
              <SelectField
                label="High-risk status"
                name="highRiskPregnancy"
                value={pregnancy.highRiskPregnancy}
                onChange={handleChange}
                options={[
                  ["Yes", "Yes — clinician identified"],
                  ["No", "No — per clinical assessment"],
                ]}
                hint="Select based on a clinical assessment."
              />
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Previous pregnancy complications"
                  name="previousPregnancyComplications"
                  value={pregnancy.previousPregnancyComplications}
                  onChange={handleChange}
                  placeholder="Record documented history..."
                  rows={3}
                />
              </div>
            </FormSection>
          </div>
        );

      case 1:
        return (
          <div className="space-y-8">
            <FormSection
              title="Maternal vital signs"
              description="Enter measurements from the current clinical visit."
            >
              <TextField
                label="Blood pressure (mmHg)"
                name="bp"
                value={pregnancy.bp}
                onChange={handleChange}
                placeholder="120/80"
                hint="Format: systolic/diastolic."
              />
              <TextField
                label="Pulse (beats/min)"
                name="pulse"
                type="number"
                min="0"
                value={pregnancy.pulse}
                onChange={handleChange}
                placeholder="Measured pulse"
              />
              <TextField
                label="Temperature (°C)"
                name="temperature"
                type="number"
                min="30"
                max="45"
                step="0.1"
                value={pregnancy.temperature}
                onChange={handleChange}
                placeholder="36.8"
              />
              <TextField
                label="Current weight (kg)"
                name="weight"
                type="number"
                min="0"
                step="0.1"
                value={pregnancy.weight}
                onChange={handleChange}
                placeholder="e.g. 58.5"
              />
              <TextField
                label="Hemoglobin (g/dL)"
                name="hemoglobin"
                type="number"
                min="0"
                step="0.1"
                value={pregnancy.hemoglobin}
                onChange={handleChange}
                placeholder="e.g. 11.2"
              />
              <SelectField
                label="Blood group"
                name="bloodGroup"
                value={pregnancy.bloodGroup}
                onChange={handleChange}
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                  (group) => [group, group]
                )}
              />
              <TextField
                label="Blood sugar result"
                name="bloodSugar"
                value={pregnancy.bloodSugar}
                onChange={handleChange}
                placeholder="Result and unit"
                hint="Include test context if needed."
              />
              <SelectField
                label="Urine test"
                name="urineTest"
                value={pregnancy.urineTest}
                onChange={handleChange}
                options={[
                  ["Normal", "No abnormality reported"],
                  ["Protein detected", "Protein detected"],
                  ["Sugar detected", "Sugar detected"],
                  ["Other abnormality", "Other abnormality"],
                  ["Pending", "Pending"],
                ]}
              />
            </FormSection>

            <div className="border-t border-slate-100" />

            <FormSection
              title="Ultrasound"
              description="Summarize the findings documented in the report."
            >
              <TextField
                label="Latest ultrasound date"
                name="ultrasoundDate"
                type="date"
                value={pregnancy.ultrasoundDate}
                onChange={handleChange}
              />
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Ultrasound findings"
                  name="ultrasoundFindings"
                  value={pregnancy.ultrasoundFindings}
                  onChange={handleChange}
                  placeholder="Enter the documented report summary..."
                  rows={4}
                />
              </div>
            </FormSection>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <FormSection
              title="Fetal observations"
              description="Record findings assessed by a trained health worker."
            >
              <TextField
                label="Fetal heart rate (beats/min)"
                name="fetalHeartRate"
                type="number"
                min="0"
                value={pregnancy.fetalHeartRate}
                onChange={handleChange}
                placeholder="Clinician-measured"
              />
              <SelectField
                label="Fetal movement"
                name="fetalMovement"
                value={pregnancy.fetalMovement}
                onChange={handleChange}
                options={[
                  ["Normal", "Usual / normal for this pregnancy"],
                  ["Reduced", "Reduced"],
                  ["Absent", "Absent"],
                  ["Not yet expected", "Not yet expected / not applicable"],
                ]}
              />
              <TextField
                label="Fundal height (cm)"
                name="fundalHeight"
                type="number"
                min="0"
                step="0.5"
                value={pregnancy.fundalHeight}
                onChange={handleChange}
                placeholder="Clinician-measured"
              />
              <SelectField
                label="Fetal position / presentation"
                name="fetalPosition"
                value={pregnancy.fetalPosition}
                onChange={handleChange}
                options={[
                  ["Cephalic", "Cephalic (head-down)"],
                  ["Breech", "Breech"],
                  ["Transverse", "Transverse"],
                  ["Unknown", "Unknown / not recorded"],
                ]}
              />
            </FormSection>

            {["Reduced", "Absent"].includes(pregnancy.fetalMovement) && (
              <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <AlertTriangle className="shrink-0" size={19} />
                <p>
                  Reduced or absent fetal movement requires urgent maternity
                  assessment. Do not delay referral to finish this form.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <HeartPulse size={17} className="text-teal-700" />
                Measurement guidance
              </p>
              <p className="mt-2 text-xs leading-6 text-slate-500">
                Record only actual observations from the visit. Missing
                measurements should remain blank rather than being estimated.
                Clinical interpretation should follow local maternity-care
                protocols.
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <FormSection
              title="Antenatal screening"
              description="Use verified reports. Completion does not imply a negative result."
            >
              <SelectField
                label="HIV screening"
                name="hivScreening"
                value={pregnancy.hivScreening}
                onChange={handleChange}
                options={[
                  ["Completed", "Completed — result in clinical record"],
                  ["Pending", "Pending"],
                  ["Declined", "Declined / not done"],
                ]}
              />
              <SelectField
                label="Syphilis screening"
                name="syphilisScreening"
                value={pregnancy.syphilisScreening}
                onChange={handleChange}
                options={[
                  ["Completed", "Completed — result in clinical record"],
                  ["Pending", "Pending"],
                  ["Declined", "Declined / not done"],
                ]}
              />
              <SelectField
                label="Hepatitis B screening"
                name="hepatitisBScreening"
                value={pregnancy.hepatitisBScreening}
                onChange={handleChange}
                options={[
                  ["Completed", "Completed — result in clinical record"],
                  ["Pending", "Pending"],
                  ["Declined", "Declined / not done"],
                ]}
              />
            </FormSection>

            <div className="border-t border-slate-100" />

            <FormSection
              title="Supplements & preventive care"
              description="Document prescribed supplements and vaccination status."
            >
              <TextField
                label="Iron tablets"
                name="ironTablets"
                value={pregnancy.ironTablets}
                onChange={handleChange}
                placeholder="e.g. taking as prescribed"
              />
              <TextField
                label="Calcium tablets"
                name="calciumTablets"
                value={pregnancy.calciumTablets}
                onChange={handleChange}
                placeholder="e.g. taking as prescribed"
              />
              <SelectField
                label="Folic acid"
                name="folicAcid"
                value={pregnancy.folicAcid}
                onChange={handleChange}
                options={[
                  ["Taking as prescribed", "Taking as prescribed"],
                  ["Missed doses", "Missed doses reported"],
                  ["Not prescribed", "Not prescribed / not recorded"],
                ]}
              />
              <SelectField
                label="Tetanus / Td vaccination"
                name="tetanusVaccination"
                value={pregnancy.tetanusVaccination}
                onChange={handleChange}
                options={[
                  ["Up to date", "Up to date per record"],
                  ["Due", "Due"],
                  ["Unknown", "Unknown"],
                ]}
              />
            </FormSection>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <FormSection
              title="Nutrition & emotional wellbeing"
              description="Record counselling provided and follow-up requested."
            >
              <SelectField
                label="Nutrition counselling"
                name="nutritionCounselling"
                value={pregnancy.nutritionCounselling}
                onChange={handleChange}
                options={[
                  ["Completed", "Counselling completed"],
                  ["Follow-up needed", "Follow-up needed"],
                  ["Referred", "Referred for additional support"],
                ]}
              />
              <SelectField
                label="Emotional wellbeing check"
                name="mentalWellbeing"
                value={pregnancy.mentalWellbeing}
                onChange={handleChange}
                options={[
                  ["No concern reported", "No concern reported today"],
                  ["Support requested", "Support requested"],
                  ["Follow-up needed", "Follow-up needed"],
                  ["Referred", "Referred to qualified support"],
                ]}
              />
            </FormSection>

            <div className="border-t border-slate-100" />

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Danger signs
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Select any symptom reported or observed during this visit.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {dangerSignOptions.map((sign) => {
                  const checked = pregnancy.dangerSigns.includes(sign);

                  return (
                    <label
                      key={sign}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-sm transition ${
                        checked
                          ? "border-rose-300 bg-rose-50 text-rose-800"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleDangerSign(sign)}
                        className="mt-0.5 h-4 w-4 accent-rose-600"
                      />
                      <span>{sign}</span>
                    </label>
                  );
                })}
              </div>

              {pregnancy.dangerSigns.length > 0 && (
                <div className="flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                  <AlertTriangle className="shrink-0" size={19} />
                  <div>
                    <p className="font-bold">
                      {pregnancy.dangerSigns.length} danger sign(s) selected
                    </p>
                    <p className="mt-1 text-xs leading-5">
                      Arrange assessment and referral according to the
                      applicable clinical protocol. Do not delay emergency
                      care to save the form.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100" />

            <FormSection
              title="Birth preparedness"
              description="Document planned delivery arrangements and emergency support."
            >
              <TextField
                label="Planned birth facility"
                name="birthFacility"
                value={pregnancy.birthFacility}
                onChange={handleChange}
                placeholder="Facility / hospital name"
              />
              <TextField
                label="Emergency contact"
                name="emergencyContact"
                value={pregnancy.emergencyContact}
                onChange={handleChange}
                placeholder="Contact details per policy"
              />
              <SelectField
                label="Transport arranged"
                name="transportArranged"
                value={pregnancy.transportArranged}
                onChange={handleChange}
                options={[
                  ["Yes", "Yes"],
                  ["No", "No — needs planning"],
                  ["Assistance needed", "Assistance needed"],
                ]}
              />
              <SelectField
                label="Referral status"
                name="referralStatus"
                value={pregnancy.referralStatus}
                onChange={handleChange}
                options={[
                  ["Not required", "Not required at this visit"],
                  ["Recommended", "Referral recommended"],
                  ["Referred", "Referred"],
                  ["Follow-up pending", "Follow-up pending"],
                  ["Completed", "Referral follow-up completed"],
                ]}
              />
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Delivery / birth preparedness plan"
                  name="deliveryPlan"
                  value={pregnancy.deliveryPlan}
                  onChange={handleChange}
                  placeholder="Planned facility, transport, birth companion, emergency arrangements..."
                  rows={3}
                />
              </div>
              <div className="sm:col-span-2">
                <TextAreaField
                  label="Clinical / ASHA visit notes"
                  name="notes"
                  value={pregnancy.notes}
                  onChange={handleChange}
                  placeholder="Document observations, counselling, referrals, and follow-up actions..."
                  rows={4}
                />
              </div>
            </FormSection>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] pb-10">
      <AshaNavbar />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-teal-700"
        >
          <ArrowLeft size={16} />
          Back to patient profile
        </button>

        {/* Page heading */}
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-teal-700">
              <HeartPulse size={15} />
              Maternal healthcare
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Register ANC visit
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Record the patient's current pregnancy assessment, observations,
              and care plan.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/patients/${id}/pregnancy`)}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:self-center"
          >
            <Activity size={16} />
            View pregnancy overview
          </button>
        </header>

        {/* Patient summary */}
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
              <UserRound size={22} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Patient record
              </p>
              <h2 className="mt-1 font-bold text-slate-900">
                {patient.name || patient.fullName || "Name unavailable"}
              </h2>
              {patient.phoneNumber && (
                <p className="mt-1 text-xs text-slate-500">
                  {patient.phoneNumber}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <div className="rounded-xl bg-slate-50 p-2.5 text-slate-600">
              <Baby size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Gestational age</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {gestationLabel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-slate-100 pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
            <div className="rounded-xl bg-slate-50 p-2.5 text-slate-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500">Fields filled</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {completedFields} / {Object.keys(initialPregnancy).length}
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
          >
            <AlertTriangle className="mt-0.5 shrink-0" size={18} />
            <div className="min-w-0 flex-1">{error}</div>
            <button onClick={() => setError("")} aria-label="Dismiss error">
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            <CheckCircle2 size={19} className="shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <AnimatePresence>
          {riskAlerts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"
            >
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle size={18} />
                <h2 className="text-sm font-bold">
                  Clinical review prompts
                </h2>
              </div>
              <ul className="mt-3 space-y-2 text-sm leading-5 text-amber-900">
                {riskAlerts.map((alert, index) => (
                  <li key={`${alert}-${index}`} className="flex gap-2">
                    <span>•</span>
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs leading-5 text-amber-800">
                These prompts are not a diagnosis. Follow local clinical
                protocols. Do not delay emergency referral to complete
                registration.
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Main form */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-6 sm:px-8">
            <StepIndicator
              currentStep={currentStep}
              onStepClick={changeStep}
            />
          </div>

          <div className="grid items-start lg:grid-cols-[minmax(0,1fr)_250px]">
            <div className="min-w-0 p-5 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.16 }}
                >
                  <div className="mb-7">
                    <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
                      Section {currentStep + 1} of {steps.length}
                    </p>
                    <h2 className="mt-2 text-xl font-bold text-slate-900">
                      {steps[currentStep].title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {steps[currentStep].subtitle}
                    </p>
                  </div>

                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => changeStep(currentStep - 1)}
                  disabled={currentStep === 0}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowLeft size={16} />
                  Previous
                </button>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={saveData}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 disabled:opacity-60"
                  >
                    {saving ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {saving ? "Saving..." : "Save record"}
                  </button>

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => changeStep(currentStep + 1)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800"
                    >
                      Continue
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={saveData}
                      disabled={saving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:opacity-60"
                    >
                      {saving ? (
                        <RefreshCw size={16} className="animate-spin" />
                      ) : (
                        <Check size={17} />
                      )}
                      {saving ? "Saving..." : "Save & finish"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Compact contextual sidebar */}
            <aside className="space-y-5 border-t border-slate-100 bg-slate-50/70 p-5 lg:sticky lg:top-24 lg:border-l lg:border-t-0 lg:p-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Record summary
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Updates as you complete the form.
                </p>

                <div className="mt-3 divide-y divide-slate-200">
                  <SummaryItem
                    label="Trimester"
                    value={pregnancy.trimester}
                  />
                  <SummaryItem
                    label="Gestational age"
                    value={gestationLabel}
                  />
                  <SummaryItem
                    label="Due date"
                    value={pregnancy.dueDate}
                  />
                  <SummaryItem
                    label="ANC visits"
                    value={pregnancy.ancVisits}
                  />
                  <SummaryItem
                    label="Next visit"
                    value={pregnancy.nextVisitDate}
                  />
                  <SummaryItem
                    label="Blood pressure"
                    value={pregnancy.bp}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-teal-50 p-2 text-teal-700">
                    <ClipboardList size={16} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Registration progress
                  </h3>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-600 transition-all"
                    style={{
                      width: `${(completedFields / Object.keys(initialPregnancy).length) * 100}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  {completedFields} of {Object.keys(initialPregnancy).length}{" "}
                  fields filled
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={17} className="text-teal-700" />
                  <h3 className="text-xs font-bold text-slate-800">
                    Before finishing
                  </h3>
                </div>

                <ul className="mt-3 space-y-3 text-xs leading-5 text-slate-600">
                  <li className="flex gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal-600" />
                    Confirm dates and measurements against the record.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal-600" />
                    Document screening status without inferring results.
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal-600" />
                    Record the follow-up and referral plan.
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>

        <p className="mt-5 text-xs leading-5 text-slate-400">
          This form supports clinical documentation and does not replace
          assessment by a qualified healthcare professional.
        </p>
      </main>
    </div>
  );
};

export default PregnancyDashboard;
