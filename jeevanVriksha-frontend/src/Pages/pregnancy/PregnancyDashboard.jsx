import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AshaNavbar from "../../components/AshaNavbar";
import {
  ArrowLeft, Activity, Calendar, Droplets, Weight, Pill,
  ClipboardList, AlertTriangle, HeartPulse, Baby, Stethoscope,
  Save, RefreshCw, CalendarClock, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-pink-400 focus:bg-white focus:ring-2 focus:ring-pink-200";
const labelClass = "mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-500";

const Field = ({ label, children, hint }) => (
  <div className="min-w-0">
    <label className={labelClass}>{label}</label>
    {children}
    {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
  </div>
);

const Section = ({ title, description, icon: Icon, children }) => (
  <section className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-4 shadow-sm shadow-blue-100/40 transition-shadow hover:shadow-md hover:shadow-pink-100/60 sm:p-5 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-gradient-to-r before:from-blue-500 before:to-pink-300">
    <div className="mb-4 flex items-start gap-3">
      <div className="rounded-xl bg-gradient-to-br from-blue-100 to-pink-100 p-2 text-blue-800 ring-1 ring-pink-200 shadow-sm shadow-pink-100">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

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

  const getHeaders = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.token) throw new Error("Your session has expired. Please log in again.");
    return {
      Authorization: `Bearer ${user.token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const evaluateRisks = useCallback((data) => {
    const alerts = [];
    const hb = Number(data.hemoglobin);
    const bpParts = String(data.bp || "").split("/").map((value) => Number(value.trim()));
    const systolic = bpParts[0];
    const diastolic = bpParts[1];

    if (data.hemoglobin !== "" && Number.isFinite(hb)) {
      if (hb < 7) alerts.push("Severely low hemoglobin recorded — urgent clinical assessment is needed.");
      else if (hb < 11) alerts.push("Hemoglobin is below the commonly used pregnancy threshold; clinician review is recommended.");
    }
    if (data.bp && bpParts.length === 2 && bpParts.every(Number.isFinite)) {
      if (systolic >= 160 || diastolic >= 110) {
        alerts.push("Very high blood pressure recorded — arrange emergency obstetric assessment.");
      } else if (systolic >= 140 || diastolic >= 90) {
        alerts.push("High blood pressure recorded — prompt assessment by a qualified clinician is needed.");
      }
    }
    const temperature = Number(data.temperature);
    if (data.temperature !== "" && Number.isFinite(temperature) && temperature >= 38) {
      alerts.push("Fever recorded (38°C or higher) — prompt clinical assessment is recommended.");
    }
    if (data.highRiskPregnancy === "Yes") {
      alerts.push("This pregnancy is marked high-risk — ensure the documented clinician-led care and follow-up plan is in place.");
    }
    if (data.fetalMovement === "Reduced" || data.fetalMovement === "Absent") {
      alerts.push("Reduced or absent fetal movement reported — urgent maternity assessment is needed.");
    }
    if (Array.isArray(data.dangerSigns) && data.dangerSigns.length) {
      alerts.push(`Danger sign(s) selected: ${data.dangerSigns.join(", ")}. Refer promptly according to local clinical protocol.`);
    }
    setRiskAlerts(alerts);
  }, []);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");
      setSuccess("");

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
          throw new Error(patientResult?.message || `Unable to load patient details (${patientRes.status}).`);
        }

        const patientData =
          patientResult?.patient ??
          patientResult?.data?.patient ??
          patientResult?.data ??
          patientResult;

        if (!patientData || typeof patientData !== "object" || Array.isArray(patientData)) {
          throw new Error("The patient API returned an invalid response.");
        }

        const pregnancyData =
          pregnancyResult?.pregnancy ??
          pregnancyResult?.data?.pregnancy ??
          pregnancyResult?.data ??
          pregnancyResult;

        if (!active) return;
        setPatient(patientData);

        if (pregnancyData && typeof pregnancyData === "object" && !Array.isArray(pregnancyData)) {
          const formatted = {
            ...initialPregnancy,
            ...pregnancyData,
            lmpDate: pregnancyData.lmpDate ? String(pregnancyData.lmpDate).split("T")[0] : "",
            dueDate: pregnancyData.dueDate ? String(pregnancyData.dueDate).split("T")[0] : "",
            ultrasoundDate: pregnancyData.ultrasoundDate ? String(pregnancyData.ultrasoundDate).split("T")[0] : "",
            nextVisitDate: pregnancyData.nextVisitDate ? String(pregnancyData.nextVisitDate).split("T")[0] : "",
            dangerSigns: Array.isArray(pregnancyData.dangerSigns) ? pregnancyData.dangerSigns : [],
          };
          setPregnancy(formatted);
          evaluateRisks(formatted);
        }
      } catch (err) {
        console.error("Pregnancy dashboard load error:", err);
        if (active) setError(err.message || "Failed to load pregnancy information.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadData();
    return () => { active = false; };
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
      const currentSigns = Array.isArray(current.dangerSigns) ? current.dangerSigns : [];
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
        throw new Error(result?.message || `Unable to save pregnancy data (${response.status}).`);
      }
      const saved = result?.pregnancy ?? result?.data?.pregnancy ?? result?.data;
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        setPregnancy((current) => ({
          ...current,
          ...saved,
          dangerSigns: Array.isArray(saved.dangerSigns) ? saved.dangerSigns : current.dangerSigns,
        }));
      }
      evaluateRisks(pregnancy);
      setSuccess(result?.message || "Pregnancy information saved successfully.");
    } catch (err) {
      console.error("Pregnancy dashboard save error:", err);
      setError(err.message || "Failed to save pregnancy information.");
    } finally {
      setSaving(false);
    }
  };

  const gestationLabel = useMemo(() => {
    const weeks = Number(pregnancy.gestationalWeeks);
    if (pregnancy.gestationalWeeks === "" || !Number.isFinite(weeks) || weeks < 0) return "Not recorded";
    return `${weeks} week${weeks === 1 ? "" : "s"}`;
  }, [pregnancy.gestationalWeeks]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AshaNavbar />
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 pt-24">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-medium text-slate-600 shadow-sm">
            <RefreshCw size={18} className="animate-spin text-blue-600" /> Loading pregnancy record…
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AshaNavbar />
        <main className="mx-auto max-w-3xl px-4 pb-16 pt-28">
          <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
            <ArrowLeft size={16} /> Back
          </button>
          <div className="rounded-2xl border border-rose-200 bg-white p-5">
            <h1 className="font-bold text-slate-900">Could not load pregnancy record</h1>
            <p className="mt-2 text-sm text-rose-700">{error || "Patient details were not returned by the server."}</p>
          </div>
        </main>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-pink-200/70 to-pink-500/10 pb-12">
      <AshaNavbar />
      <main className="mx-auto max-w-6xl px-4 pb-8 pt-24 sm:px-6">
        <button onClick={() => navigate(-1)} className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-700">
          <ArrowLeft size={16} /> Back to Patient Profile
        </button>

        <header className="relative mb-6 flex flex-col gap-4 overflow-hidden rounded-2xl border border-pink-200/80 bg-gradient-to-r from-white via-blue-50/70 to-pink-100/70 p-5 shadow-md shadow-blue-100/60 before:absolute before:inset-x-0 before:top-0 before:h-1 before:bg-gradient-to-r before:from-blue-600 before:via-violet-400 before:to-pink-400 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-pink-700">Maternal health record</p>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Pregnancy & ANC Tracker</h1>
            <p className="mt-1 text-sm text-slate-600">
              Patient: <span className="font-semibold text-slate-900">{patient.name || patient.fullName || "Name unavailable"}</span>
              {patient.phoneNumber ? <span className="ml-2 text-slate-500">· {patient.phoneNumber}</span> : null}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-pink-200 bg-gradient-to-r from-blue-100/80 via-white to-pink-100/80 px-4 py-3 shadow-sm shadow-pink-100">
            <Baby className="text-blue-700" size={22} />
            <div>
              <p className="text-xs font-medium text-blue-700">Gestational age</p>
              <p className="text-sm font-bold text-blue-950">{gestationLabel}</p>
            </div>
          </div>
        </header>

        {error && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-800">
            {success}
          </div>
        )}

        <AnimatePresence>
          {riskAlerts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4"
            >
              <div className="mb-2 flex items-center gap-2 text-rose-800">
                <AlertTriangle size={18} />
                <h2 className="text-sm font-bold">Items requiring clinical review</h2>
              </div>
              <ul className="space-y-1.5 text-sm text-rose-800">
                {riskAlerts.map((alert, index) => <li key={`${alert}-${index}`}>• {alert}</li>)}
              </ul>
              <p className="mt-3 text-xs text-rose-700">
                These are prompts for review, not a diagnosis. Follow local clinical protocols and refer to a qualified clinician.
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5 bg-gradient-to-br from-blue-200 via-pink-200/70 to-pink-500/10">
            <Section title="Pregnancy details" 
            description="Record dating and obstetric history." 
            icon={Calendar}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Trimester">
                  <select name="trimester" value={pregnancy.trimester} onChange={handleChange} className={inputClass}>
                    <option value="">Select trimester</option>
                    <option value="1">First trimester</option>
                    <option value="2">Second trimester</option>
                    <option value="3">Third trimester</option>
                  </select>
                </Field>
                <Field label="Gestational age (weeks)" hint="Use the clinician-confirmed estimate.">
                  <input type="number" min="0" max="45" name="gestationalWeeks" value={pregnancy.gestationalWeeks} onChange={handleChange} className={inputClass} placeholder="e.g. 24" />
                </Field>
                <Field label="Last menstrual period (LMP)">
                  <input type="date" name="lmpDate" value={pregnancy.lmpDate} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Expected due date (EDD)">
                  <input type="date" name="dueDate" value={pregnancy.dueDate} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Gravida (total pregnancies)" hint="Include current pregnancy.">
                  <input type="number" min="0" name="gravida" value={pregnancy.gravida} onChange={handleChange} className={inputClass} placeholder="e.g. 2" />
                </Field>
                <Field label="Para (births reaching viability)">
                  <input type="number" min="0" name="para" value={pregnancy.para} onChange={handleChange} className={inputClass} placeholder="e.g. 1" />
                </Field>
                <Field label="Previous pregnancy complications">
                  <input name="previousPregnancyComplications" value={pregnancy.previousPregnancyComplications} onChange={handleChange} className={inputClass} placeholder="e.g. pre-eclampsia, preterm birth" />
                </Field>
                <Field label="High-risk pregnancy status">
                  <select name="highRiskPregnancy" value={pregnancy.highRiskPregnancy} onChange={handleChange} className={inputClass}>
                    <option value="">Not assessed / recorded</option>
                    <option value="Yes">Yes — clinician identified</option>
                    <option value="No">No — per clinical assessment</option>
                  </select>
                </Field>
                <Field label="Multiple pregnancy">
                  <select name="multiplePregnancy" value={pregnancy.multiplePregnancy} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="Singleton">Singleton</option>
                    <option value="Twins">Twins</option>
                    <option value="Higher order">Triplets or more</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </Field>
                <Field label="ANC visits completed">
                  <input type="number" min="0" name="ancVisits" value={pregnancy.ancVisits} onChange={handleChange} className={inputClass} placeholder="Number of visits" />
                </Field>
                <Field label="Next ANC visit">
                  <input type="date" name="nextVisitDate" value={pregnancy.nextVisitDate} onChange={handleChange} className={inputClass} />
                </Field>
                <Field label="Blood group">
                  <select name="bloodGroup" value={pregnancy.bloodGroup} onChange={handleChange} className={inputClass}>
                    <option value="">Select blood group</option>
                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => <option key={group} value={group}>{group}</option>)}
                  </select>
                </Field>
              </div>
            </Section>

            <Section title="Maternal measurements & investigations" description="Enter results from documented clinical checks." icon={Stethoscope}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Temperature (°C)">
                  <input type="number" min="30" max="45" step="0.1" name="temperature" value={pregnancy.temperature} onChange={handleChange} className={inputClass} placeholder="e.g. 36.8" />
                </Field>
                <Field label="Pulse (beats/min)">
                  <input type="number" min="0" name="pulse" value={pregnancy.pulse} onChange={handleChange} className={inputClass} placeholder="Measured pulse" />
                </Field>
                <Field label="Blood pressure (mmHg)" hint="Enter as systolic/diastolic, e.g. 120/80.">
                  <input name="bp" value={pregnancy.bp} onChange={handleChange} className={inputClass} placeholder="120/80" />
                </Field>
                <Field label="Hemoglobin (g/dL)">
                  <input type="number" min="0" step="0.1" name="hemoglobin" value={pregnancy.hemoglobin} onChange={handleChange} className={inputClass} placeholder="e.g. 11.2" />
                </Field>
                <Field label="Current weight (kg)">
                  <input type="number" min="0" step="0.1" name="weight" value={pregnancy.weight} onChange={handleChange} className={inputClass} placeholder="e.g. 58.5" />
                </Field>
                <Field label="Blood sugar result" hint="Record value and unit/test context in notes if needed.">
                  <input name="bloodSugar" value={pregnancy.bloodSugar} onChange={handleChange} className={inputClass} placeholder="Result / unit" />
                </Field>
                <Field label="Urine test">
                  <select name="urineTest" value={pregnancy.urineTest} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="Normal">No abnormality reported</option>
                    <option value="Protein detected">Protein detected</option>
                    <option value="Sugar detected">Sugar detected</option>
                    <option value="Other abnormality">Other abnormality</option>
                    <option value="Pending">Pending</option>
                  </select>
                </Field>
                <Field label="Latest ultrasound date">
                  <input type="date" name="ultrasoundDate" value={pregnancy.ultrasoundDate} onChange={handleChange} className={inputClass} />
                </Field>
                <div className="sm:col-span-2 xl:col-span-3">
                  <Field label="Ultrasound findings / report summary">
                    <textarea name="ultrasoundFindings" rows={2} value={pregnancy.ultrasoundFindings} onChange={handleChange} className={inputClass} placeholder="Summarize the documented report; attach or store the report through your approved workflow." />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="Fetal wellbeing" description="Record only measurements assessed by a trained health worker." icon={HeartPulse}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Fetal heart rate (beats/min)">
                  <input type="number" min="0" name="fetalHeartRate" value={pregnancy.fetalHeartRate} onChange={handleChange} className={inputClass} placeholder="Clinician-measured" />
                </Field>
                <Field label="Fetal movement">
                  <select name="fetalMovement" value={pregnancy.fetalMovement} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="Normal">Usual / normal for this pregnancy</option>
                    <option value="Reduced">Reduced</option>
                    <option value="Absent">Absent</option>
                    <option value="Not yet expected">Not yet expected / not applicable</option>
                  </select>
                </Field>
                <Field label="Fundal height (cm)">
                  <input type="number" min="0" step="0.5" name="fundalHeight" value={pregnancy.fundalHeight} onChange={handleChange} className={inputClass} placeholder="Clinician-measured" />
                </Field>
                <Field label="Fetal position / presentation">
                  <select name="fetalPosition" value={pregnancy.fetalPosition} onChange={handleChange} className={inputClass}>
                    <option value="">Not assessed</option>
                    <option value="Cephalic">Cephalic (head-down)</option>
                    <option value="Breech">Breech</option>
                    <option value="Transverse">Transverse</option>
                    <option value="Unknown">Unknown / not recorded</option>
                  </select>
                </Field>
              </div>
            </Section>

            <Section title="Antenatal screening" description="Record screening status from verified test reports; do not infer results." icon={ShieldCheck}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="HIV screening">
                  <select name="hivScreening" value={pregnancy.hivScreening} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="Completed">Completed — result in clinical record</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined / not done</option>
                  </select>
                </Field>
                <Field label="Syphilis screening">
                  <select name="syphilisScreening" value={pregnancy.syphilisScreening} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="Completed">Completed — result in clinical record</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined / not done</option>
                  </select>
                </Field>
                <Field label="Hepatitis B screening">
                  <select name="hepatitisBScreening" value={pregnancy.hepatitisBScreening} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="Completed">Completed — result in clinical record</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined / not done</option>
                  </select>
                </Field>
              </div>
            </Section>

            <Section title="Supplements & preventive care" description="Track prescribed supplements and vaccinations." icon={Pill}>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <Field label="Iron / folic acid tablets">
                  <input name="ironTablets" value={pregnancy.ironTablets} onChange={handleChange} className={inputClass} placeholder="e.g. daily / missed doses" />
                </Field>
                <Field label="Calcium tablets">
                  <input name="calciumTablets" value={pregnancy.calciumTablets} onChange={handleChange} className={inputClass} placeholder="e.g. daily / missed doses" />
                </Field>
                <Field label="Folic acid">
                  <select name="folicAcid" value={pregnancy.folicAcid} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="Taking as prescribed">Taking as prescribed</option>
                    <option value="Missed doses">Missed doses reported</option>
                    <option value="Not prescribed">Not prescribed / not recorded</option>
                  </select>
                </Field>
                <Field label="Tetanus / Td vaccination status">
                  <select name="tetanusVaccination" value={pregnancy.tetanusVaccination} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="Up to date">Up to date per record</option>
                    <option value="Due">Due</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </Field>
              </div>
            </Section>

            <Section title="Nutrition & emotional wellbeing" description="Record counselling and concerns to follow up respectfully." icon={HeartPulse}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nutrition counselling">
                  <select name="nutritionCounselling" value={pregnancy.nutritionCounselling} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="Completed">Counselling completed</option>
                    <option value="Follow-up needed">Follow-up needed</option>
                    <option value="Referred">Referred for additional support</option>
                  </select>
                </Field>
                <Field label="Emotional wellbeing check">
                  <select name="mentalWellbeing" value={pregnancy.mentalWellbeing} onChange={handleChange} className={inputClass}>
                    <option value="">Not recorded</option>
                    <option value="No concern reported">No concern reported today</option>
                    <option value="Support requested">Support requested</option>
                    <option value="Follow-up needed">Follow-up needed</option>
                    <option value="Referred">Referred to qualified support</option>
                  </select>
                </Field>
              </div>
            </Section>

            <Section title="Danger signs screening" description="Select any symptom reported or observed today." icon={ShieldCheck}>
              <div className="grid gap-2 sm:grid-cols-2">
                {dangerSignOptions.map((sign) => (
                  <label key={sign} className={`flex cursor-pointer items-start gap-2 rounded-xl border p-3 text-sm transition ${pregnancy.dangerSigns.includes(sign) ? "border-rose-300 bg-rose-50 text-rose-800" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>
                    <input
                      type="checkbox"
                      checked={pregnancy.dangerSigns.includes(sign)}
                      onChange={() => toggleDangerSign(sign)}
                      className="mt-0.5 accent-rose-600"
                    />
                    <span>{sign}</span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Any danger sign requires prompt assessment in line with local maternity referral protocols. Severe bleeding, fits, difficulty breathing, or other emergency symptoms require emergency care.
              </p>
            </Section>

            <Section title="Birth preparedness & clinical notes" description="Document plans, referrals, and clinician observations." icon={ClipboardList}>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Planned birth facility">
                    <input name="birthFacility" value={pregnancy.birthFacility} onChange={handleChange} className={inputClass} placeholder="Facility / hospital name" />
                  </Field>
                  <Field label="Emergency contact">
                    <input name="emergencyContact" value={pregnancy.emergencyContact} onChange={handleChange} className={inputClass} placeholder="Contact name / phone per policy" />
                  </Field>
                  <Field label="Transport arranged">
                    <select name="transportArranged" value={pregnancy.transportArranged} onChange={handleChange} className={inputClass}>
                      <option value="">Not recorded</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No — needs planning</option>
                      <option value="Assistance needed">Assistance needed</option>
                    </select>
                  </Field>
                  <Field label="Referral status">
                    <select name="referralStatus" value={pregnancy.referralStatus} onChange={handleChange} className={inputClass}>
                      <option value="">No referral status recorded</option>
                      <option value="Not required">Not required at this visit</option>
                      <option value="Recommended">Referral recommended</option>
                      <option value="Referred">Referred</option>
                      <option value="Follow-up pending">Follow-up pending</option>
                      <option value="Completed">Referral follow-up completed</option>
                    </select>
                  </Field>
                </div>
                <Field label="Delivery / birth preparedness plan">
                  <textarea name="deliveryPlan" rows={3} value={pregnancy.deliveryPlan} onChange={handleChange} className={inputClass} placeholder="Planned facility, transport, birth companion, emergency contact, referral plan…" />
                </Field>
                <Field label="Clinical / ASHA visit notes">
                  <textarea name="notes" rows={4} value={pregnancy.notes} onChange={handleChange} className={inputClass} placeholder="Symptoms, test results, counselling, referral details, follow-up actions…" />
                </Field>
              </div>
            </Section>

            <div className="sticky bottom-3 z-10 flex flex-col gap-3 rounded-2xl border border-pink-200 bg-gradient-to-r from-white via-white to-pink-50/90 p-3 shadow-xl shadow-pink-100/70 backdrop-blur sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">Save the latest verified information after each ANC visit.</p>
              <button
                type="button"
                onClick={saveData}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-200 transition hover:from-blue-800 hover:to-pink-600 hover:shadow-md hover:shadow-pink-200/70 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? <RefreshCw size={17} className="animate-spin" /> : <Save size={17} />}
                {saving ? "Saving record…" : "Save pregnancy record"}
              </button>
            </div>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Activity size={18} className="text-blue-700" />
                <h2 className="text-sm font-bold text-slate-800">Visit overview</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs text-slate-500">Gestational age</span>
                  <span className="text-sm font-bold text-slate-800">{gestationLabel}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs text-slate-500">ANC visits recorded</span>
                  <span className="text-sm font-bold text-slate-800">{pregnancy.ancVisits || "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <span className="text-xs text-slate-500">Next visit</span>
                  <span className="text-right text-sm font-bold text-slate-800">{pregnancy.nextVisitDate || "Not scheduled"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">Blood group</span>
                  <span className="text-sm font-bold text-slate-800">{pregnancy.bloodGroup || "Not recorded"}</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-pink-200 bg-gradient-to-br from-blue-100/80 via-white to-pink-100/80 p-4 shadow-sm shadow-pink-100/60">
              <div className="mb-2 flex items-center gap-2 text-blue-900">
                <CalendarClock size={18} />
                <h2 className="text-sm font-bold">Follow-up checklist</h2>
              </div>
              <p className="mb-3 text-xs leading-relaxed text-blue-800">Use local ANC guidelines and the clinician’s plan to determine timing and required tests.</p>
              <ul className="space-y-2 text-xs text-blue-950">
                <li>• Confirm next ANC appointment.</li>
                <li>• Review available lab and ultrasound reports.</li>
                <li>• Check prescribed supplements and vaccination record.</li>
                <li>• Document counselling and any referral.</li>
                <li>• Confirm birth preparedness and emergency transport plan.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-100/80 to-amber-50 p-4 shadow-sm shadow-pink-100/60">
              <div className="mb-2 flex items-center gap-2 text-amber-900">
                <AlertTriangle size={18} />
                <h2 className="text-sm font-bold">Important clinical note</h2>
              </div>
              <p className="text-xs leading-relaxed text-amber-900">
                This tracker supports documentation only. It does not diagnose pregnancy complications or replace assessment by a qualified health professional. Do not delay referral when danger signs are present.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PregnancyDashboard;
