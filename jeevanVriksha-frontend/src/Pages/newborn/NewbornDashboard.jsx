
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AshaNavbar from "../../components/AshaNavbar";
import {
  ArrowLeft,
  Baby,
  HeartPulse,
  Thermometer,
  Weight,
  Milk,
  ClipboardList,
  ShieldCheck,
  Save,
  Activity,
  CalendarDays,
  Ruler,
  UserRound,
  Syringe,
  Droplets,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const initialNewborn = {
  birthWeight: "",
  temperature: "",
  breastfeeding: "",
  notes: "",
  birthDate: "",
  gender: "",
  birthLength: "",
  headCircumference: "",
  deliveryType: "",
  feedingFrequency: "",
  urineOutput: "",
  stoolStatus: "",
  jaundice: "",
  cordCondition: "",
  immunizationStatus: "",
  nextVisitDate: "",
};

const NewbornDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [newborn, setNewborn] = useState(initialNewborn);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch patient and newborn details.
  
    useEffect(() => {
    let active = true;

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!user?.token) {
            throw new Error("Session expired. Please log in again.");
        }

        if (!id) {
            throw new Error("Patient ID is missing from the URL.");
        }

        const headers = {
            Authorization: `Bearer ${user.token}`,
        };

        const [patientRes, newbornRes] = await Promise.all([
            fetch(`${API}/api/patients/${id}`, { headers }),
            fetch(`${API}/api/newborn/${id}`, { headers }),
        ]);

        const patientResult = await patientRes.json().catch(() => null);
        const newbornResult = newbornRes.ok
            ? await newbornRes.json().catch(() => null)
            : null;

        if (!patientRes.ok) {
            throw new Error(
            patientResult?.message ||
                `Unable to load patient (${patientRes.status}).`
            );
        }

        // PatientProfile uses this endpoint with a direct patient response.
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

        const newbornData =
            newbornResult?.newborn ??
            newbornResult?.data?.newborn ??
            newbornResult?.data ??
            newbornResult;

        if (!active) return;

        setPatient(patientData);

        if (
            newbornData &&
            typeof newbornData === "object" &&
            !Array.isArray(newbornData)
        ) {
            setNewborn((prev) => ({
            ...initialNewborn,
            ...prev,
            ...newbornData,
            }));
        }
        } catch (err) {
        console.error("Newborn dashboard load error:", err);

        if (active) {
            setError(err.message || "Failed to load patient information.");
            setPatient(null);
        }
        } finally {
        if (active) setLoading(false);
        }
    };

    loadData();

    return () => {
        active = false;
    };
    }, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    setNewborn((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  
    const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);
    setError("");
    setSuccess("");

    try {
        const user = JSON.parse(localStorage.getItem("user") || "null");

        if (!user?.token) {
        throw new Error("Session expired. Please log in again.");
        }

        const headers = {
        Authorization: `Bearer ${user.token}`,
        };

        const [patientRes, newbornRes] = await Promise.all([
        fetch(`${API}/api/patients/${id}`, { headers }),
        fetch(`${API}/api/newborn/${id}`, { headers }),
        ]);

        const patientResult = await patientRes.json().catch(() => null);
        const newbornResult = newbornRes.ok
        ? await newbornRes.json().catch(() => null)
        : null;

        if (!patientRes.ok) {
        throw new Error(
            patientResult?.message || "Unable to refresh patient details."
        );
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

        if (
        newbornData &&
        typeof newbornData === "object" &&
        !Array.isArray(newbornData)
        ) {
        setNewborn((prev) => ({
            ...initialNewborn,
            ...prev,
            ...newbornData,
        }));
        }

        setSuccess("Patient and newborn data refreshed.");
    } catch (err) {
        console.error("Refresh error:", err);
        setError(err.message || "Unable to refresh the record.");
    } finally {
        setRefreshing(false);
    }
    };


  const saveData = async (e) => {
    if (e) e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Basic validation for entered measurements.
      if (
        newborn.birthWeight !== "" &&
        (!Number.isFinite(Number(newborn.birthWeight)) ||
          Number(newborn.birthWeight) <= 0)
      ) {
        throw new Error("Enter a valid birth weight greater than zero.");
      }

      if (
        newborn.temperature !== "" &&
        (!Number.isFinite(Number(newborn.temperature)) ||
          Number(newborn.temperature) < 30 ||
          Number(newborn.temperature) > 45)
      ) {
        throw new Error("Enter a valid temperature between 30°C and 45°C.");
      }

      const response = await fetch(`${API}/api/newborn/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: id,
          ...newborn,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            result.error ||
            "Unable to save newborn record."
        );
      }

      setSuccess(result.message || "Newborn record saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save newborn record.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  const labelClass =
    "mb-1.5 block text-xs font-bold text-slate-700 sm:text-sm";

  const sectionClass =
    "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5";

  const getPatientName = () =>
    patient?.name ||
    patient?.fullName ||
    patient?.personalDetails?.name ||
    patient?.patient?.name ||
    "Patient name unavailable";

  const getTemperatureStatus = () => {
    if (
      newborn.temperature === "" ||
      newborn.temperature === null ||
      newborn.temperature === undefined
    ) {
      return "Not recorded";
    }

    const temperature = Number(newborn.temperature);

    if (temperature < 36.5) return "Below expected range";
    if (temperature > 37.5) return "Above expected range";

    return "Within expected range";
  };

  const summaryCards = [
    {
      label: "Birth weight",
      value: newborn.birthWeight !== ""
        ? `${newborn.birthWeight} kg`
        : "--",
      description: "Recorded at birth",
      icon: Weight,
      iconStyle: "bg-violet-50 text-violet-600",
    },
    {
      label: "Temperature",
      value: newborn.temperature !== ""
        ? `${newborn.temperature}°C`
        : "--",
      description: getTemperatureStatus(),
      icon: Thermometer,
      iconStyle: "bg-orange-50 text-orange-600",
    },
    {
      label: "Breastfeeding",
      value: newborn.breastfeeding || "Not recorded",
      description: "Feeding status",
      icon: Milk,
      iconStyle: "bg-pink-50 text-pink-600",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AshaNavbar />

        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <div className="text-center">
            <LoaderCircle
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />
            <p className="mt-3 text-sm text-slate-500">
              Loading newborn record...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AshaNavbar />

        <main className="mx-auto max-w-xl px-4 pt-28">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <AlertCircle
              size={32}
              className="mx-auto text-red-500"
            />

            <h2 className="mt-3 text-lg font-bold text-slate-800">
              Patient record unavailable
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error || "Unable to retrieve patient details."}
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? "animate-spin" : ""}
                />
                Retry
              </button>

              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AshaNavbar />

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Refresh newborn record"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <Baby size={24} />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
                  JeevanVriksha Healthcare
                </p>
                <h1 className="mt-0.5 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                  Newborn Monitoring
                </h1>
                <p className="mt-1 text-xs text-slate-500">
                  Health tracking and follow-up records
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <ShieldCheck size={15} />
              ASHA Health Record
            </div>
          </div>
        </div>

        {/* Patient summary */}
        <section className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 p-4 text-white shadow-md sm:p-5">
          <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/10" />

          <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/15">
                <Baby size={27} />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] text-blue-100">
                  Mother / Patient
                </p>
                <h2 className="mt-0.5 truncate text-lg font-bold">
                  {getPatientName()}
                </h2>
                <p className="mt-1 break-all text-[11px] text-blue-100">
                  Patient ID: {patient._id || patient.id || id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5">
              <Activity size={17} />
              <div>
                <p className="text-[10px] text-blue-100">
                  Monitoring
                </p>
                <p className="text-xs font-bold">
                  Newborn health record
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-4 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Measurement summary cards */}
        <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className={`rounded-xl p-2.5 ${card.iconStyle}`}>
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-1 truncate text-xl font-black text-slate-900">
                      {card.value}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      {card.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <form onSubmit={saveData} className="space-y-4">
          {/* Birth details */}
          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <Baby size={20} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Birth Details
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Basic information about the newborn
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="birthDate" className={labelClass}>
                  Date of Birth
                </label>
                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="birthDate"
                    type="date"
                    name="birthDate"
                    value={newborn.birthDate || ""}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className={labelClass}>
                  Gender
                </label>
                <div className="relative">
                  <UserRound
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    id="gender"
                    name="gender"
                    value={newborn.gender || ""}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none pl-9`}
                  >
                    <option value="">Select</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                    <option value="Unknown">Not recorded</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="deliveryType" className={labelClass}>
                  Delivery Type
                </label>
                <select
                  id="deliveryType"
                  name="deliveryType"
                  value={newborn.deliveryType || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select</option>
                  <option value="Vaginal">Vaginal delivery</option>
                  <option value="Cesarean">Cesarean delivery</option>
                  <option value="Assisted">Assisted delivery</option>
                  <option value="Unknown">Not recorded</option>
                </select>
              </div>

              <div>
                <label htmlFor="birthWeight" className={labelClass}>
                  Birth Weight (kg)
                </label>
                <div className="relative">
                  <Weight
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="birthWeight"
                    type="number"
                    min="0"
                    step="0.01"
                    name="birthWeight"
                    placeholder="e.g. 3.20"
                    value={newborn.birthWeight ?? ""}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="birthLength" className={labelClass}>
                  Birth Length (cm)
                </label>
                <div className="relative">
                  <Ruler
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="birthLength"
                    type="number"
                    min="0"
                    step="0.1"
                    name="birthLength"
                    placeholder="Length in cm"
                    value={newborn.birthLength ?? ""}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="headCircumference"
                  className={labelClass}
                >
                  Head Circumference (cm)
                </label>
                <input
                  id="headCircumference"
                  type="number"
                  min="0"
                  step="0.1"
                  name="headCircumference"
                  placeholder="Measurement in cm"
                  value={newborn.headCircumference ?? ""}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Current health measurements */}
          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600">
                <HeartPulse size={20} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Current Health Measurements
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Record measurements taken during this visit
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="temperature" className={labelClass}>
                  Body Temperature (°C)
                </label>
                <div className="relative">
                  <Thermometer
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="temperature"
                    type="number"
                    step="0.1"
                    name="temperature"
                    placeholder="e.g. 36.8"
                    value={newborn.temperature ?? ""}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  {getTemperatureStatus()}. Seek prompt clinical assessment
                  for an abnormal reading.
                </p>
              </div>

              <div>
                <label htmlFor="breastfeeding" className={labelClass}>
                  Breastfeeding Status
                </label>
                <div className="relative">
                  <Milk
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <select
                    id="breastfeeding"
                    name="breastfeeding"
                    value={newborn.breastfeeding ?? ""}
                    onChange={handleChange}
                    className={`${inputClass} appearance-none pl-9`}
                  >
                    <option value="">Select status</option>
                    <option value="Yes">Breastfeeding</option>
                    <option value="No">Not breastfeeding</option>
                    <option value="Partial">Partial breastfeeding</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Feeding and daily care */}
          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-pink-50 p-2.5 text-pink-600">
                <Milk size={20} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Feeding & Daily Care
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Record observations during the home visit
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label htmlFor="feedingFrequency" className={labelClass}>
                  Feeding Pattern
                </label>
                <select
                  id="feedingFrequency"
                  name="feedingFrequency"
                  value={newborn.feedingFrequency || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select pattern</option>
                  <option value="On demand">On demand</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Difficulty feeding">Difficulty feeding</option>
                  <option value="Not recorded">Not recorded</option>
                </select>
              </div>

              <div>
                <label htmlFor="urineOutput" className={labelClass}>
                  Urine Output
                </label>
                <select
                  id="urineOutput"
                  name="urineOutput"
                  value={newborn.urineOutput || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select observation</option>
                  <option value="Observed">Urination observed</option>
                  <option value="Not observed">Not observed</option>
                  <option value="Concern reported">Concern reported</option>
                  <option value="Not recorded">Not recorded</option>
                </select>
              </div>

              <div>
                <label htmlFor="stoolStatus" className={labelClass}>
                  Stool Observation
                </label>
                <select
                  id="stoolStatus"
                  name="stoolStatus"
                  value={newborn.stoolStatus || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select observation</option>
                  <option value="Normal">No concern reported</option>
                  <option value="Abnormal">Abnormal observation</option>
                  <option value="Not passed">Stool not passed</option>
                  <option value="Not recorded">Not recorded</option>
                </select>
              </div>
            </div>
          </section>

          {/* Newborn observations */}
          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                <ClipboardList size={20} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Newborn Observations
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Record observations and concerns for follow-up
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="jaundice" className={labelClass}>
                  Jaundice Observation
                </label>
                <select
                  id="jaundice"
                  name="jaundice"
                  value={newborn.jaundice || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select observation</option>
                  <option value="Observed">Yellowing observed</option>
                  <option value="Not observed">Not observed</option>
                  <option value="Not assessed">Not assessed</option>
                </select>
              </div>

              <div>
                <label htmlFor="cordCondition" className={labelClass}>
                  Umbilical Cord Condition
                </label>
                <select
                  id="cordCondition"
                  name="cordCondition"
                  value={newborn.cordCondition || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select observation</option>
                  <option value="Appears normal">No visible concern</option>
                  <option value="Redness">Redness observed</option>
                  <option value="Discharge">Discharge observed</option>
                  <option value="Not assessed">Not assessed</option>
                </select>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-amber-700"
                />
                <p className="text-xs leading-5 text-amber-900">
                  Difficulty feeding, abnormal temperature, jaundice, or
                  umbilical redness/discharge can require prompt assessment.
                  Follow newborn-care protocols and escalate concerning
                  observations to a qualified healthcare professional.
                </p>
              </div>
            </div>
          </section>

          {/* Immunization and follow-up */}
          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <Syringe size={20} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Immunization & Follow-up
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Track recorded immunization status and the next visit
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="immunizationStatus"
                  className={labelClass}
                >
                  Immunization Status
                </label>
                <select
                  id="immunizationStatus"
                  name="immunizationStatus"
                  value={newborn.immunizationStatus || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select status</option>
                  <option value="Up to date">Recorded doses up to date</option>
                  <option value="Pending">Dose pending</option>
                  <option value="Not verified">Not verified</option>
                </select>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Verify doses against the child's immunization record.
                </p>
              </div>

              <div>
                <label htmlFor="nextVisitDate" className={labelClass}>
                  Next Follow-up Date
                </label>
                <div className="relative">
                  <CalendarDays
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="nextVisitDate"
                    type="date"
                    name="nextVisitDate"
                    value={newborn.nextVisitDate || ""}
                    onChange={handleChange}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Health notes */}
          <section className={sectionClass}>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
                <ClipboardList size={20} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Health Notes & Observations
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Additional observations from the ASHA visit
                </p>
              </div>
            </div>

            <label htmlFor="notes" className={labelClass}>
              Notes
            </label>

            <textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={2000}
              placeholder="Record feeding concerns, symptoms, care observations, or follow-up instructions..."
              value={newborn.notes || ""}
              onChange={handleChange}
              className={`${inputClass} resize-y leading-6`}
            />

            <p className="mt-1.5 text-right text-[11px] text-slate-400">
              {(newborn.notes || "").length}/2000 characters
            </p>
          </section>

          {/* Save action */}
          <div className="flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-start gap-2.5">
              <ShieldCheck
                size={19}
                className="mt-0.5 shrink-0 text-blue-600"
              />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Newborn health record
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Review the recorded information before saving.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Saving Record..." : "Save Newborn Record"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default NewbornDashboard;
