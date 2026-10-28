import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserRound,
  MapPin,
  ChevronRight,
  Loader2,
  RefreshCw,
  ArrowLeft,
  UsersRound,
  UserPlus,
  WifiOff,
  Phone,
  Mars,
  Venus,
  X,
} from "lucide-react";
import AshaNavbar from "../../components/AshaNavbar";
import {
  cachePatients,
  getCachedPatients,
} from "../../services/patientCacheService";

const API = import.meta.env.VITE_API_URL;


const getAgeLabel = (patient) => {
  const age = patient.age;

  // Legacy age field takes priority when populated.
  if (age !== null && age !== undefined && age !== "") {
    const value = Number(age);

    if (Number.isFinite(value) && value >= 0) {
      return `${value} ${value === 1 ? "year" : "years"}`;
    }
  }

  const years = Number(patient.ageYears || 0);
  const months = Number(patient.ageMonths || 0);
  const days = Number(patient.ageDays || 0);

  if (years > 0 || months > 0 || days > 0) {
    const parts = [];

    if (years > 0) parts.push(`${years} ${years === 1 ? "year" : "years"}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
    if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);

    return parts.join(" ");
  }

  return "Age not specified";
};

const GenderIcon = ({ gender }) => {
  const normalizedGender = gender?.trim().toLowerCase();

  if (normalizedGender === "male") {
    return <Mars size={19} strokeWidth={2} />;
  }

  if (normalizedGender === "female") {
    return <Venus size={19} strokeWidth={2} />;
  }

  return <UserRound size={19} strokeWidth={2} />;
};

const getGenderStyles = (gender) => {
  const normalizedGender = gender?.trim().toLowerCase();

  if (normalizedGender === "male") {
    return "bg-blue-50 text-blue-600";
  }

  if (normalizedGender === "female") {
    return "bg-pink-50 text-pink-600";
  }

  return "bg-slate-100 text-slate-500";
};

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();

  const loadPatients = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    try {
      if (navigator.onLine) {
        if (!user?.token) {
          throw new Error("Your session has expired. Please log in again.");
        }

        const res = await fetch(`${API}/api/patientAsha`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Unable to load patients.");
        }

        const patientArray = Array.isArray(data)
          ? data
          : Array.isArray(data.patients)
            ? data.patients
            : [];

        setPatients(patientArray);
        setLoadError("");
        await cachePatients(patientArray);
      } else {
        const cached = await getCachedPatients();
        setPatients(Array.isArray(cached) ? cached : []);
        setLoadError("");
      }
    } catch (err) {
      console.error("Fetch patients failed:", err);

      try {
        const cached = await getCachedPatients();
        if (Array.isArray(cached) && cached.length > 0) {
          setPatients(cached);
          setLoadError("Showing saved patient records. Connect to the internet to refresh.");
        } else {
          setPatients([]);
          setLoadError(err.message || "Could not load patient records.");
        }
      } catch (cacheError) {
        console.error("Patient cache failed:", cacheError);
        setPatients([]);
        setLoadError(err.message || "Could not load patient records.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // loadPatients is intentionally called once when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setLoading(true);
    try {
      await loadPatients();
    } finally {
      setRefreshing(false);
    }
  };

  const filteredPatients = useMemo(() => {
    if (!Array.isArray(patients)) return [];
    const search = searchTerm.trim().toLowerCase();

    if (!search) return patients;

    return patients.filter((patient) => {
      const name = patient.name?.toLowerCase() || "";
      const village = patient.village?.toLowerCase() || "";
      const phone = patient.phone?.toString() || "";
      const id = patient._id?.toString() || "";

      return (
        name.includes(search) ||
        village.includes(search) ||
        phone.includes(search) ||
        id.toLowerCase().includes(search)
      );
    });
  }, [patients, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">
      <AshaNavbar />

      <main className="relative isolate min-h-screen overflow-hidden px-4 pb-12 pt-24 sm:px-6 sm:pt-28 bg-[radial-gradient(ellipse_at_top_left,rgba(35,109,181,0.24),transparent_42%),radial-gradient(ellipse_at_bottom_right,rgba(98,168,232,0.34),transparent_40%),linear-gradient(125deg,#B9DEFF_0%,#E5F2FF_38%,#C9E4FF_70%,#DCEBFA_100%)] ">
        <div className="pointer-events-none absolute -right-24 top-24 -z-10 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-[28rem] -z-10 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" />

        <div className="mx-auto max-w-6xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-700 hover:shadow-sm"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </button>

          <section className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <UsersRound size={27} strokeWidth={1.8} />
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                  ASHA Worker Portal
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Patient Database
                  </h1>
                  {loading && (
                    <Loader2
                      size={18}
                      className="animate-spin text-blue-600"
                      aria-label="Loading patients"
                    />
                  )}
                </div>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Search, review, and open patient profiles from your registered
                  community.
                </p>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <div className="relative min-w-0 flex-1 sm:min-w-[300px] lg:w-80 lg:flex-none">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  placeholder="Search name, mobile, village..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="Search patients"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-10 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/create-patient")}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.98]"
              >
                <UserPlus size={17} />
                Add Patient
              </button>
            </div>
          </section>

          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total patients
                  </p>
                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {patients.length}
                  </p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <UsersRound size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <WifiOff size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Designed for low connectivity
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Saved patient records can remain accessible from the local
                    cache when you are offline.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {loadError && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {loadError}
            </div>
          )}

          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-100 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <h2 className="font-bold text-slate-900">Registered patients</h2>
                <p className="mt-1 text-xs text-slate-500">
                  {searchTerm
                    ? `${filteredPatients.length} matching ${
                        filteredPatients.length === 1 ? "record" : "records"
                      }`
                    : `${patients.length} ${
                        patients.length === 1 ? "record" : "records"
                      } available`}
                </p>
              </div>
              <span className="mt-2 inline-flex w-fit items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 sm:mt-0">
                {navigator.onLine ? "Online" : "Offline"}
              </span>
            </div>

            {loading && patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <Loader2 size={30} className="animate-spin text-blue-600" />
                <p className="mt-4 text-sm font-semibold text-slate-700">
                  Loading patient records...
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  This may take a moment on a slow connection.
                </p>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="px-6 py-16 text-center sm:py-20">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Search size={27} />
                </div>
                <h3 className="font-bold text-slate-800">
                  {searchTerm ? "No matching patients" : "No patients yet"}
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  {searchTerm
                    ? "Try another name, mobile number, village, or patient ID."
                    : "Registered patients will appear here. Add a patient to get started."}
                </p>
                {!searchTerm && (
                  <button
                    type="button"
                    onClick={() => navigate("/patients/create")}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    <UserPlus size={16} />
                    Add your first patient
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50/80">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Patient
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Village / Locality
                        </th>
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Age
                        </th>
                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <AnimatePresence initial={false}>
                        {filteredPatients.map((patient) => (
                          <motion.tr
                            key={patient._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="group transition-colors hover:bg-blue-50/40"
                          >
                            <td className="px-6 py-4">
                              <div className="flex min-w-[200px] items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <div  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${getGenderStyles(
                                patient.gender )}`}
                              title={patient.gender || "Gender not specified"}
                            >
                              <GenderIcon gender={patient.gender} />
                            </div>
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-bold text-slate-800">
                                    {patient.name || "Unnamed patient"}
                                  </p>
                                  {patient.phone && (
                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                      <Phone size={12} />
                                      {patient.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <MapPin size={15} className="shrink-0 text-slate-400" />
                                <span>{patient.village || "Not specified"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                                {getAgeLabel(patient)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => navigate(`/patients/${patient._id}`)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-600 hover:text-white"
                              >
                                View details
                                <ChevronRight size={14} />
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="divide-y divide-slate-100 md:hidden">
                  <AnimatePresence initial={false}>
                    {filteredPatients.map((patient) => (
                      <motion.button
                        key={patient._id}
                        type="button"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={() => navigate(`/patients/${patient._id}`)}
                        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-slate-50 active:bg-blue-50"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getGenderStyles(
                            patient.gender
                          )}`}
                          title={patient.gender || "Gender not specified"}
                        >
                          <GenderIcon gender={patient.gender} />
                        </div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-bold text-slate-800">
                            {patient.name || "Unnamed patient"}
                          </h3>
                          <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                            <MapPin size={12} className="shrink-0" />
                            {patient.village || "Village not specified"}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                              {getAgeLabel(patient)}
                            </span>
                            {patient.phone && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                                <Phone size={11} />
                                {patient.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          size={19}
                          className="shrink-0 text-slate-400"
                        />
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {filteredPatients.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500 sm:px-6">
                Showing {filteredPatients.length} of {patients.length} patient
                {patients.length === 1 ? "" : "s"}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default PatientList;
