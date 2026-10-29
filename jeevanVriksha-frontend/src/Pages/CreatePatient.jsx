
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRoundPlus,
  UserRound,
  Phone,
  LockKeyhole,
  CalendarDays,
  MapPin,
  Droplets,
  UsersRound,
  ShieldCheck,
  WifiOff,
  LoaderCircle,
} from "lucide-react";

import AshaNavbar from "../components/AshaNavbar";
import { addToQueue } from "../services/offlineQueueService";

const API = import.meta.env.VITE_API_URL;

const initialForm = {
  name: "",
  phone: "",
  password: "",
  dob: "",
  ageYears: "0",
  ageMonths: "0",
  ageDays: "0",
  village: "",
  gender: "Male",
  bloodGroup: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

const CreatePatient = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === "dob") {
      const age = calculateAge(value);
  
      setForm((prev) => ({
        ...prev,
        dob: value,
        ageYears: age ? String(age.years) : "",
        ageMonths: age ? String(age.months) : "",
        ageDays: age ? String(age.days) : "",
      }));
  
      return;
    }
  
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user?.token && navigator.onLine) {
      alert("Your session has expired. Please log in again.");
      return;
    }

    setSubmitting(true);

    try {
      if (navigator.onLine) {
        const res = await fetch(`${API}/api/patientAsha/create`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Unable to create patient.");
          return;
        }

        alert("Patient created successfully.");
        navigate("/patients");
      } else {
        await addToQueue(
          "CREATE_PATIENT",
          "/api/patientAsha/create",
          form
        );

        alert(
          "No internet connection. Patient details have been saved offline and will sync later."
        );

        navigate("/patients");
      }
    } catch (error) {
      console.error("Create patient error:", error);
      alert(
        navigator.onLine
          ? "Network error. Please try again."
          : "Unable to save the patient offline. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
  
    const birthDate = new Date(`${dob}T00:00:00`);
    const today = new Date();
  
    if (
      Number.isNaN(birthDate.getTime()) ||
      birthDate > new Date(today.getFullYear(), today.getMonth(), today.getDate())
    ) {
      return null;
    }
  
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
  
    if (days < 0) {
      months--;
  
      // Number of days in the previous calendar month
      const previousMonthDays = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
  
      days += previousMonthDays;
    }
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    return { years, months, days };
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AshaNavbar />

      <main className="relative overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pt-28 bg-[radial-gradient(ellipse_at_top_left,rgba(35,109,181,0.24),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(98,168,232,0.34),transparent_40%),linear-gradient(125deg,#B9DEFF_0%,#E5F2FF_38%,#C9E4FF_70%,#DCEBFA_100%)] ">
        {/* Background decoration */}
        <div className="pointer-events-none absolute -right-24 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-96 h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-3xl">
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
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <UserRoundPlus size={27} strokeWidth={1.8} />
            </div>

            <div className="min-w-0 pt-0.5">
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                Patient Management
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Create Patient Profile
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Register a patient and maintain their basic information for
                healthcare follow-ups.
              </p>
            </div>
          </div>

          {/* Offline information */}
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
              <ShieldCheck size={19} />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800">
                Secure patient registration
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                Enter accurate patient details. If you are offline, the form
                can be queued for later synchronization.
              </p>
            </div>
          </div>

          {/* Form card */}
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-xl shadow-slate-200/50">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UserRound size={20} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Basic Information
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Fields marked with * are required.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-7 px-5 py-6 sm:px-8 sm:py-8">
                {/* Personal details */}
                <section>
                  <div className="mb-5 flex items-center gap-2">
                    <span className="h-5 w-1 rounded-full bg-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Personal Details
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className={labelClass}>
                        Patient Full Name <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <UserRound
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          placeholder="Enter patient's full name"
                          value={form.name}
                          onChange={handleChange}
                          autoComplete="name"
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>


                    {/* Age */}
               {/* Date of Birth */}
<div className="sm:col-span-2">
  <label htmlFor="dob" className={labelClass}>
    Date of Birth <span className="text-red-500">*</span>
  </label>

  <div className="relative">
    <CalendarDays
      size={18}
      className="pointer-events-none absolute left-3.5 top-1/2
        -translate-y-1/2 text-slate-400"
    />

    <input
      id="dob"
      name="dob"
      type="date"
      value={form.dob}
      onChange={handleChange}
      max={new Date().toLocaleDateString("en-CA")}
      className={inputClass}
      required
    />
  </div>
</div>

{/* Automatically calculated age */}
<div className="sm:col-span-2">
  <label className={labelClass}>
    Patient Age
  </label>

  <div className="grid grid-cols-3 gap-3">
    {[
      { name: "ageYears", label: "Years" },
      { name: "ageMonths", label: "Months" },
      { name: "ageDays", label: "Days" },
    ].map(({ name, label }) => (
      <div key={name}>
        <label
          htmlFor={name}
          className="mb-1.5 block text-xs font-medium text-slate-500"
        >
          {label}
        </label>

        <input
          id={name}
          name={name}
          type="number"
          value={form[name]}
          readOnly
          placeholder="—"
          className="w-full cursor-not-allowed rounded-xl border
            border-slate-200 bg-slate-200/60 px-3 py-3
            text-sm font-semibold text-slate-700 outline-none"
          required
        />
      </div>
    ))}
  </div>

  <p className="mt-2 text-xs text-slate-500">
    Age is calculated automatically from the date of birth.
  </p>
</div>

                    {/* Gender */}
                    <div>
                      <label htmlFor="gender" className={labelClass}>
                        Gender <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <UsersRound
                          size={18}
                          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                          id="gender"
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className={`${inputClass} appearance-none`}
                          required
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Blood group */}
                    <div>
                      <label htmlFor="bloodGroup" className={labelClass}>
                        Blood Group
                      </label>

                      <div className="relative">
                        <Droplets
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <select
                          id="bloodGroup"
                          name="bloodGroup"
                          value={form.bloodGroup}
                          onChange={handleChange}
                          className={`${inputClass} appearance-none`}
                        >
                          <option value="">Select blood group</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="Unknown">Unknown</option>
                        </select>
                      </div>
                    </div>

                    {/* Village */}
                    <div>
                      <label htmlFor="village" className={labelClass}>
                        Village / Locality{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="village"
                          name="village"
                          type="text"
                          placeholder="Enter village name"
                          value={form.village}
                          onChange={handleChange}
                          autoComplete="address-level2"
                          className={inputClass}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Account details */}
                <section>
                  <div className="mb-5 flex items-center gap-2">
                    <span className="h-5 w-1 rounded-full bg-blue-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Account Details
                    </h3>
                  </div>

                  <div className="space-y-5">
                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className={labelClass}>
                        Mobile Number <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          value={form.phone}
                          onChange={handleChange}
                          autoComplete="tel"
                          inputMode="numeric"
                          pattern="[0-9]{10}"
                          maxLength={10}
                          className={inputClass}
                          required
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Enter a 10-digit mobile number.
                      </p>
                    </div>

                    {/* Password */}
                    <div>
                      <label htmlFor="password" className={labelClass}>
                        Login Password{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <LockKeyhole
                          size={18}
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Create a login password"
                          value={form.password}
                          onChange={handleChange}
                          autoComplete="new-password"
                          minLength={6}
                          className={inputClass}
                          required
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Use at least 6 characters.
                      </p>
                    </div>
                  </div>
                </section>
              </div>

              {/* Form footer */}
              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-5 sm:px-8">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Saving Patient...
                    </>
                  ) : (
                    <>
                      <UserRoundPlus size={18} />
                      Create Patient Profile
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <WifiOff size={14} />
                  <span>Offline-ready registration</span>
                </div>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Please ensure patient information is accurate before submitting.
          </p>
        </div>
      </main>
    </div>
  );
};

export default CreatePatient;
