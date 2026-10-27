import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { QRCodeCanvas } from "qrcode.react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { 
  User, MapPin, Droplets, Calendar, Activity, 
  TrendingUp, ShieldCheck, Download, QrCode, Plus, ArrowLeft, RefreshCw,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 
import AshaNavbar from "../../components/AshaNavbar";

const API = import.meta.env.VITE_API_URL;

// offline
import { cachePatientProfile, getCachedPatientProfile } from "../../services/patientCacheService";

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vitalsSubmitting, setVitalsSubmitting] = useState(false);
  const [vitalsMessage, setVitalsMessage] = useState("");
  const [formData, setFormData] = useState({
    bloodPressure: "",
    weight: "",
    glucose: "",
    heartRate: "",
    notes: ""
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
  name: "",
  village: "",
  age: "",
  bloodGroup: "",
  phone: "",
  gender: "",
  allergies: "",
  isNewborn: false,
  pregnancyStatus: "not_pregnant"
});

const [refreshing, setRefreshing] = useState(false);

const [isVacExpanded, setIsVacExpanded] = useState(false);
const [pregnancyExists,setPregnancyExists] = useState(false)
const [newbornExists,setNewbornExists] = useState(false)

//  medicine 
const [medicines, setMedicines] = useState([])
const [showMedicineForm, setShowMedicineForm] = useState(false)
const [medicineList, setMedicineList] = useState([])
const [medicineData, setMedicineData] = useState({
  medicineId:"",
  quantity:""
})
const [isMedExpanded, setIsMedExpanded] = useState(false)
const [medicineSubmitting, setMedicineSubmitting] = useState(false)
const [medicineError, setMedicineError] = useState("")
const [medicineSuccess, setMedicineSuccess] = useState("")

// medicine fn

const fetchPatientMedicines = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.token) throw new Error("Your session has expired. Please log in again.");

    const res = await fetch(`${API}/api/medicine/patient/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data.message || "Unable to load medicine history.");
    setMedicines(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Medicine fetch error:", err);
    setMedicineError(err.message || "Unable to load medicine history.");
  }
};

const handleRefresh = () => {
  if (refreshing) return;

  setRefreshing(true);

  setTimeout(() => {
    window.location.reload();
  }, 400);
};

const fetchMedicines = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.token) throw new Error("Your session has expired. Please log in again.");

    const res = await fetch(`${API}/api/medicine/all`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    const data = await res.json().catch(() => []);
    if (!res.ok) throw new Error(data.message || "Unable to load the medicine list.");
    setMedicineList(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Medicine list error:", err);
    setMedicineError(err.message || "Unable to load the medicine list.");
  }
};

const giveMedicine = async (e) => {
  e?.preventDefault();
  setMedicineError("");
  setMedicineSuccess("");

  const quantity = Number(medicineData.quantity);
  if (!medicineData.medicineId) {
    setMedicineError("Please select a medicine.");
    return;
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    setMedicineError("Enter a whole-number quantity greater than zero.");
    return;
  }

  try {
    setMedicineSubmitting(true);
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.token) throw new Error("Your session has expired. Please log in again.");

    const res = await fetch(`${API}/api/medicine/distribute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
      body: JSON.stringify({ patientId: id, medicineId: medicineData.medicineId, quantity }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || "Medicine could not be distributed.");

    setMedicineSuccess(data.message || "Medicine recorded successfully.");
    setMedicineData({ medicineId: "", quantity: "" });
    setShowMedicineForm(false);
    await fetchPatientMedicines();
  } catch (err) {
    console.error("Give medicine error:", err);
    setMedicineError(err.message || "Something went wrong. Please try again.");
  } finally {
    setMedicineSubmitting(false);
  }
};

// Inside PatientProfile component
const checkData = async () => {
  try {
    const pregRes = await fetch(`${API}/api/pregnancy/${id}`);
    const pregData = await pregRes.json();
    // Check if patientId exists in the record
    setPregnancyExists(!!(pregData && pregData.patientId));

    const newRes = await fetch(`${API}/api/newborn/${id}`);
    const newData = await newRes.json();
    setNewbornExists(!!(newData && newData.patientId));
  } catch (err) {
    console.log("Pregnancy/Newborn fetch error:", err);
  }
};

// Keep your initial load
useEffect(() => {
  checkData();
}, [id]);



// Update useEffect to sync these from the patient object
useEffect(() => {
  if (patient) {
    setEditData({
      name: patient.name || "",
      village: patient.village || "",
      age: patient.age || "",
      bloodGroup: patient.bloodGroup || "",
      phone: patient.phone || "",
      gender: patient.gender || "Male",
      allergies: patient.allergies || "None",
      isNewborn: patient.isNewborn || false,
      pregnancyStatus: patient.pregnancyStatus || "not_pregnant"
    });
  }
}, [patient]);

const handleUpdatePatient = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    
    // Safety check: if gender is not Female, they cannot be pregnant
  const finalData = {
  ...editData,
  
};
    console.log("Sending update:", finalData)
    const response = await fetch(`${API}/api/patients/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`
      },
      body: JSON.stringify(finalData) // send cleaned data
    });

    if (response.ok) {
     setIsEditing(false);

// reload patient from server
const refreshed = await fetch(`${API}/api/patients/${id}`, {
  headers: {
    Authorization: `Bearer ${user.token}`
  }
});

const newPatient = await refreshed.json();

setPatient(newPatient);
await cachePatientProfile({
  ...newPatient,
  vitals,
  vaccines
});

await checkData();
    }
  } catch (err) {
    alert("Update failed.");
  }
};
// const handleUpdatePatient = async () => {
//   try {
//     const user = JSON.parse(localStorage.getItem("user"));
//     const response = await fetch(`http://localhost:5001/api/patients/update/${id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${user.token}`
//       },
//       body: JSON.stringify(editData)
//     });

//     if (response.ok) {
//       const updated = await response.json();
//       setPatient(updated);
//       setIsEditing(false);
      
//       await checkData(); 
//       // ---------------------

//       alert("Profile updated successfully!");
//     }
//   } catch (err) {
//     alert("Update failed. Please check your connection.");
//   }
// };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


useEffect(() => {

  const loadData = async () => {

  const user = JSON.parse(localStorage.getItem("user"))

  try {

    const headers = {
      Authorization: `Bearer ${user.token}`
    }

    if (navigator.onLine) {

      const [pRes, vRes, vacRes] = await Promise.all([
        fetch(`${API}/api/patients/${id}`, { headers }),
        fetch(`${API}/api/vitals/${id}`, { headers }),
        fetch(`${API}/api/vaccinations/${id}`, { headers })
      ])

      const pData = pRes.ok ? await pRes.json() : null
      const vData = vRes.ok ? await vRes.json() : []
      const vacData = vacRes.ok ? await vacRes.json() : []

      setPatient(pData || {})
      setVitals(Array.isArray(vData) ? vData : [])
      setVaccines(Array.isArray(vacData) ? vacData : [])
      fetchPatientMedicines()
      fetchMedicines()

      // SAVE PROFILE TO CACHE
      await cachePatientProfile({
        ...pData,
        vitals: vData,
        vaccines: vacData
      })

    } else {

      // OFFLINE → LOAD FROM CACHE
      const cached = await getCachedPatientProfile(id)

      if (cached) {

        setPatient(cached)
        setVitals(cached.vitals || [])
        setVaccines(cached.vaccines || [])

      }

    }

  } catch (err) {

    console.log("Offline fallback")

    const cached = await getCachedPatientProfile(id)

    if (cached) {

      setPatient(cached)
      setVitals(cached.vitals || [])
      setVaccines(cached.vaccines || [])

    }

  } finally {

    setLoading(false)

  }

}

  loadData()

}, [id])



// ----- health card
// const downloadCard = async () => {

//   const element = document.getElementById("healthCard");

//   if (!element) {
//     alert("Health card not ready");
//     return;
//   }

//   const canvas = await html2canvas(element, {
//     scale: 3,
//     useCORS: true
//   });

//   const imgData = canvas.toDataURL("image/png");

//   const pdf = new jsPDF("landscape", "mm", "a4");

//   const width = 260;
//   const height = (canvas.height * width) / canvas.width;

//   pdf.addImage(imgData, "PNG", 10, 20, width, height);

//   pdf.save(`${patient?.name || "patient"}_HealthCard.pdf`);
// };

const downloadCard = async () => {

  const original = document.getElementById("healthCard");

  if (!original) {
    alert("Health card not ready");
    return;
  }

  // Clone the card so we can sanitize styles
  const clone = original.cloneNode(true);

  // Reset problematic styles
  clone.style.background = "#ffffff";
  clone.style.color = "#000000";

  // Remove Tailwind classes that may contain oklch colors
  clone.querySelectorAll("*").forEach(el => {
    el.style.background = "#ffffff";
    el.style.color = "#000000";
    el.style.borderColor = "#e5e7eb";
  });

  // Put clone temporarily into DOM
  clone.style.position = "fixed";
  clone.style.top = "-10000px";
  document.body.appendChild(clone);

  const canvas = await html2canvas(clone, {
    scale: 3,
    backgroundColor: "#ffffff"
  });

  document.body.removeChild(clone);

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("landscape","mm","a4");

  const width = 260;
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(imgData,"PNG",10,20,width,height);

  pdf.save(`${patient?.name || "patient"}_HealthCard.pdf`);
};




  const handleAddVital = async (e) => {
    e.preventDefault();
    setVitalsMessage("");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.token) {
      setVitalsMessage("Your session has expired. Please log in again.");
      return;
    }

    const hasValue = Object.values(formData).some((value) => String(value).trim() !== "");
    if (!hasValue) {
      setVitalsMessage("Enter at least one vital measurement or a note before saving.");
      return;
    }

    try {
      setVitalsSubmitting(true);
      const response = await fetch(`${API}/api/vitals/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ patientId: id, ...formData }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "Unable to save vitals. Please try again.");

      const refresh = await fetch(`${API}/api/vitals/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const refreshedVitals = await refresh.json().catch(() => []);
      if (refresh.ok) setVitals(Array.isArray(refreshedVitals) ? refreshedVitals : []);
      setVitalsMessage("Vitals saved successfully.");
      setFormData({ bloodPressure: "", weight: "", glucose: "", heartRate: "", notes: "" });
    } catch (error) {
      console.error("ADD VITALS ERROR:", error);
      setVitalsMessage(error.message || "Unable to save vitals. Check your connection and try again.");
    } finally {
      setVitalsSubmitting(false);
    }
  };

  const chartData = Array.isArray(vitals)
  ? vitals
      .filter(v => v.weight || v.glucose)
      .map(v => ({
        date: new Date(v.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short"
        }),
        weight: Number(v.weight) || 0,
        glucose: Number(v.glucose) || 0
      }))
      .reverse()
  : []

  if (loading) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm font-semibold text-slate-600">
      Loading patient record...
    </div>
  )
}

  return (
    <div className="min-h-screen bg-slate-50 pb-12 text-slate-800">
      <AshaNavbar />

      <main className="mx-auto w-full max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8">

     <div className="mb-6 flex flex-wrap items-center  gap-3">
  <button
    type="button"
    onClick={() => navigate(-1)}
    className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-blue-700 hover:shadow-sm"
  >
    <ArrowLeft size={17} />
    Back to Dashboard
  </button>

 <button
  type="button"
  onClick={handleRefresh}
  disabled={refreshing}
  aria-label="Refresh page"
  title="Refresh page"
  className="inline-flex h-9 w-auto shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
>
  <RefreshCw
    size={16}
    strokeWidth={2.2}
    className={refreshing ? "animate-spin" : ""}
  />
  <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
</button>
</div>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
          
          {/* LEFT COLUMN: PROFILE & VACCINES */}
          <div className="space-y-6 xl:col-span-4">
            
          {/* PERSONAL INFO CARD - WITH EDIT LOGIC */}
<div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm sm:p-6 relative overflow-hidden">
  <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-50 rounded-full" />

  <div className="flex justify-between items-start mb-6 relative z-10">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
        <User size={32} />
      </div>
      <div>
        {isEditing ? (
          <input 
            className="w-full min-w-0 border-b-2 border-blue-500 bg-transparent text-xl font-black text-slate-800 outline-none"
           value={editData.name || ""}
            onChange={(e) => setEditData({...editData, name: e.target.value})}
          />
        ) : (
          <h2 className="text-2xl font-black text-slate-800 leading-tight">{patient?.name || "Unknown"}</h2>
        )}
        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">ID: {id.slice(-6)}</span>
      </div>
    </div>
    
    {/* EDIT TOGGLE BUTTON */}
    <button 
      onClick={() => isEditing ? handleUpdatePatient() : setIsEditing(true)}
      className={`p-2 rounded-xl font-bold text-xs transition-all ${isEditing ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}
    >
      {isEditing ? "Save Changes" : "Edit Info"}
    </button>
  </div>

  <div className="space-y-4 border-t border-slate-50 pt-6 relative z-10">
    {/* VILLAGE EDIT */}
    <div className="flex items-center gap-3">
      <MapPin size={16} className="text-blue-400" />
      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase">Village</p>
        {isEditing ? (
          <input 
            className="w-full font-bold text-slate-700 border-b border-slate-200 outline-none"
            value={editData.village}
            onChange={(e) => setEditData({...editData, village: e.target.value})}
          />
        ) : (
          <p className="font-bold text-slate-700">{patient?.village}</p>
        )}
      </div>
    </div>

    {/* PHONE EDIT */}
    <div className="flex items-center gap-3">
      <Activity size={16} className="text-emerald-500" />
      <div className="flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Number</p>
        {isEditing ? (
          <input 
            className="w-full font-bold text-slate-700 border-b border-slate-200 outline-none"
            value={editData.phone}
            onChange={(e) => setEditData({...editData, phone: e.target.value})}
          />
        ) : (
          <p className="font-bold text-slate-700">{patient.phone || "Not Provided"}</p>
        )}
      </div>
    </div>

    {/* Gender Edit */}
    <div className="flex items-center gap-3">
  <User size={16} className="text-blue-400" />
  <div className="flex-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase">Gender</p>

    {isEditing ? (
      <select
        className="w-full border-b outline-none"
        value={editData.gender}
        onChange={(e)=>setEditData({...editData, gender:e.target.value})}
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
    ) : (
      <p className="font-bold text-slate-700">{patient?.gender}</p>
    )}

  </div>
</div>

    {/* Age and blood Group */}

    <div className="grid grid-cols-2 gap-3 mt-4">
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Age</p>
        {isEditing ? (
          <input 
            type="number"
            className="w-full bg-transparent font-black text-slate-700 outline-none"
            value={editData.age}
            onChange={(e) => setEditData({...editData, age: e.target.value})}
          />
        ) : (
          <p className="text-sm font-black text-slate-700">{patient?.age} Yrs</p>
        )}
      </div>
      <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100/50">
        <p className="text-[9px] font-black text-rose-300 uppercase mb-1 text-center">Blood</p>
        {isEditing ? (
          <select 
            className="w-full bg-transparent font-black text-rose-600 outline-none text-center"
            value={editData.bloodGroup}
            onChange={(e) => setEditData({...editData, bloodGroup: e.target.value})}
          >
            {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        ) : (
          <p className="text-sm font-black text-rose-600 text-center">{patient?.bloodGroup}</p>
        )}
      </div>
    </div>

    <div className="flex items-center gap-3">
  <Droplets size={16} className="text-rose-400" />

  <div className="flex-1">
    <p className="text-[10px] font-bold text-slate-400 uppercase">
      Allergies
    </p>

    {isEditing ? (
      <input
        value={editData.allergies}
        onChange={(e)=>setEditData({...editData, allergies:e.target.value})}
        className="w-full border-b outline-none"
      />
    ) : (
      <p className="font-bold text-slate-700">{patient.allergies}</p>
    )}
  </div>
</div>

{/* Newborn / Pregnancy status */}
<div className="mt-4 flex flex-wrap gap-2">
  {isEditing ? (
    <>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
        <input
          type="checkbox"
          checked={!!editData.isNewborn}
          onChange={(e) => setEditData({ ...editData, isNewborn: e.target.checked })}
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        Newborn
      </label>
      {editData.gender === "Female" && (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-pink-100 bg-pink-50 px-3 py-2 text-sm font-semibold text-pink-700">
          <input
            type="checkbox"
            checked={editData.pregnancyStatus === "pregnant"}
            onChange={(e) => setEditData({ ...editData, pregnancyStatus: e.target.checked ? "pregnant" : "not_pregnant" })}
            className="h-4 w-4 rounded border-pink-300 text-pink-600 focus:ring-pink-500"
          />
          Pregnant
        </label>
      )}
    </>
  ) : (
    <>
      {patient?.isNewborn && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700">Newborn</span>}
      {patient?.pregnancyStatus === "pregnant" && <span className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-700">Pregnancy active</span>}
      {!patient?.isNewborn && patient?.pregnancyStatus !== "pregnant" && <span className="text-xs text-slate-400">No special care status recorded</span>}
    </>
  )}
</div>
  </div>

  {/* Cancel button only shows during edit */}
  {isEditing && (
    <button 
      onClick={() => setIsEditing(false)}
      className="w-full mt-4 py-2 text-xs font-bold text-rose-400 hover:text-rose-600 transition-colors"
    >
      Discard Changes
    </button>
  )}

    {!isEditing && (
  <>
    <div className="mt-8 flex gap-2 relative z-10">

      <button
        onClick={() => setShowQR(!showQR)}
        className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
      >
        <QrCode size={16} /> QR Pass
      </button>

      <button
        onClick={downloadCard}
        className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
      >
        <Download size={16} /> Health Card
      </button>

    </div>

    

    {/* Change pregnancyExists to patient?.isPregnant */}
{patient?.pregnancyStatus === "pregnant" && (
  <button
    onClick={() => navigate(`/pregnancy/${id}`)}
    className="w-full mt-3 bg-pink-500 text-white py-3 rounded-2xl text-xs font-bold hover:bg-pink-600 transition-all"
  >
    Pregnancy Tracker
  </button>
)}

{/* Change newbornExists to patient?.isNewborn */}
{patient?.isNewborn && (
  <button
    onClick={() => navigate(`/newborn/${id}`)}
    className="w-full mt-3 bg-blue-500 text-white py-3 rounded-2xl text-xs font-bold hover:bg-blue-600 transition-all"
  >
    Newborn Care
  </button>
)}

  </>
)}

</div>

            {/* VACCINATION TABLE */}
         
<div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm sm:p-6">
  <button 
    onClick={() => setIsVacExpanded(!isVacExpanded)} // Add [isVacExpanded, setIsVacExpanded] = useState(false) at the top
    className="w-full flex items-center justify-between mb-2 group"
  >
    <div className="flex items-center gap-2">
      <ShieldCheck className="text-emerald-500" size={20} />
      <h3 className="font-bold text-slate-800">Vaccination Tracker</h3>
      <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
        {vaccines?.length || 0}
      </span>
    </div>
    <div className={`text-black transition-transform duration-300 ${isVacExpanded ? 'rotate-180' : ''}`}>
      <ChevronDown size={20} className={isVacExpanded ? 'rotate-180' : ''} />
    </div>
  </button>

  <AnimatePresence>
  {isVacExpanded && (

  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="overflow-hidden pt-3 border-t border-slate-50"
  >
        <div className="space-y-3 pt-4 border-t border-slate-50">
          {vaccines?.length > 0 ? (
            vaccines.map((v) => {

  const today = new Date();
  const due = new Date(v.dueDate);

  const canComplete =
    today.setHours(0,0,0,0) >= due.setHours(0,0,0,0);

  let statusColor = "bg-gray-100 text-gray-600";
  let label = "Upcoming";

              if (v.status === "completed") {
                statusColor = "bg-emerald-100 text-emerald-600";
                label = "Completed";
              } else if (due < today) {
                statusColor = "bg-red-100 text-red-600";
                label = "Overdue";
              } else if (due <= today) {
                statusColor = "bg-amber-100 text-amber-600";
                label = "Due";
              }

              return (
                <div
                  key={v._id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-700">{v.vaccineName}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">
                      Due: {new Date(v.dueDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${statusColor}`}>
                      {label}
                    </span>

                     {v.status !== "completed" && canComplete && (
<button
onClick={async ()=>{

const user = JSON.parse(localStorage.getItem("user"))

await fetch(`${API}/api/vaccinations/complete/${v._id}`,{
method:"PATCH",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${user.token}`
}
})

const res = await fetch(`${API}/api/vaccinations/${id}`)
const data = await res.json()
setVaccines(data)

}}
className="text-xs bg-blue-600 text-white px-2 py-1 rounded-lg"
>
Complete
</button>
)}
                    
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-slate-400 text-sm">
              No vaccination records available
            </div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
  
  {!isVacExpanded && (
    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Click to view schedule</p>
  )}
</div>

{/* MEDICINE SECTION */}
<div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
  <button
    type="button"
    onClick={() => setIsMedExpanded((open) => !open)}
    aria-expanded={isMedExpanded}
    className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
  >
    <span className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Activity size={20} /></span>
      <span className="min-w-0">
        <span className="block font-bold text-slate-800">Medicine tracker</span>
        <span className="mt-0.5 block text-xs text-slate-500">Distribution history for this patient</span>
      </span>
      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{medicines.length}</span>
    </span>
    <ChevronDown size={19} className={`shrink-0 text-slate-500 transition-transform ${isMedExpanded ? "rotate-180" : ""}`} />
  </button>

  <AnimatePresence initial={false}>
    {isMedExpanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="mt-5 border-t border-slate-100 pt-5">
          {medicineError && (
            <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
              <span>{medicineError}</span>
              <button type="button" onClick={() => setMedicineError("")} aria-label="Dismiss error" className="font-bold">×</button>
            </div>
          )}
          {medicineSuccess && <p role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">{medicineSuccess}</p>}

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Medicine given</h4>
              <p className="mt-1 text-xs text-slate-500">Record the medicine and quantity supplied.</p>
            </div>
            <button
              type="button"
              onClick={() => { setShowMedicineForm((show) => !show); setMedicineError(""); setMedicineSuccess(""); }}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2"
            >
              <Plus size={16} /> {showMedicineForm ? "Cancel" : "Give medicine"}
            </button>
          </div>

          {showMedicineForm && (
            <form onSubmit={giveMedicine} className="mb-5 space-y-4 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
              <div className="space-y-1.5">
                <label htmlFor="patient-medicine" className="block text-xs font-bold uppercase tracking-wide text-slate-600">Medicine</label>
                <select
                  id="patient-medicine"
                  required
                  value={medicineData.medicineId}
                  onChange={(e) => setMedicineData({ ...medicineData, medicineId: e.target.value })}
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select a medicine</option>
                  {medicineList.map((medicine) => <option key={medicine._id} value={medicine._id}>{medicine.name}{medicine.dosage ? ` · ${medicine.dosage}` : ""}</option>)}
                </select>
                {medicineList.length === 0 && <p className="text-xs text-amber-700">No medicines are available in the medicine catalogue.</p>}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="patient-medicine-quantity" className="block text-xs font-bold uppercase tracking-wide text-slate-600">Quantity</label>
                <input
                  id="patient-medicine-quantity"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  required
                  value={medicineData.quantity}
                  onChange={(e) => setMedicineData({ ...medicineData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { setShowMedicineForm(false); setMedicineData({ medicineId: "", quantity: "" }); setMedicineError(""); }} className="min-h-10 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50">Cancel</button>
                <button type="submit" disabled={medicineSubmitting || medicineList.length === 0} className="inline-flex min-h-10 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {medicineSubmitting ? "Saving…" : "Confirm distribution"}
                </button>
              </div>
            </form>
          )}

          {medicines.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center">
              <span className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-500"><Activity size={20} /></span>
              <p className="text-sm font-semibold text-slate-700">No medicine records yet</p>
              <p className="mt-1 text-xs text-slate-500">Medicine distributions will appear here after they are recorded.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {medicines.map((item) => (
                <div key={item._id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-white p-3 transition hover:border-blue-100 hover:bg-slate-50/70">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><Activity size={17} /></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-800">{item.medicineId?.name || "Medicine record"}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{item.givenDate && !Number.isNaN(new Date(item.givenDate).getTime()) ? new Date(item.givenDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Date unavailable"}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-bold text-slate-700">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
</div>
          </div>

          {/* RIGHT COLUMN: VITALS & CHART */}
          <div className="min-w-0 space-y-6 xl:col-span-8">
            
            {/* ADD VITALS FORM */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-2 text-slate-800">
                <Plus size={20} className="bg-blue-300 rounded-lg p-1" />
                <h3 className="font-bold">Record New Vitals</h3>
              </div>
              {vitalsMessage && <p role="status" className={`mb-4 rounded-xl px-3 py-2 text-sm ${vitalsMessage.toLowerCase().includes("success") ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-amber-200 bg-amber-50 text-amber-800"}`}>{vitalsMessage}</p>}
              <form onSubmit={handleAddVital} className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">BP (120/80)</label>
                  <input name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Weight (kg)</label>
                  <input type="number" min="0" step="0.1" name="weight" value={formData.weight} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Glucose</label>
                  <input type="number" min="0" name="glucose" value={formData.glucose} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="space-y-1">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Heart Rate</label>
                  <input type="number" min="0" name="heartRate" value={formData.heartRate} onChange={handleChange} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="col-span-2 md:col-span-3 space-y-1">
                  <label className="ml-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Notes</label>
                  <input name="notes" value={formData.notes} onChange={handleChange} placeholder="General health notes..." className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={vitalsSubmitting} className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                    {vitalsSubmitting ? "Saving…" : "Save vitals"}
                  </button>
                </div>
              </form>
            </div>

            {/* CHART SECTION */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-blue-500" size={20} />
                <h3 className="font-bold text-slate-800">Health Trends</h3>
              </div>
              {chartData.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
                  <TrendingUp size={24} className="mb-2 text-slate-400" />
                  <p className="text-sm font-semibold text-slate-700">Not enough data to show a trend</p>
                  <p className="mt-1 text-xs text-slate-500">Record weight or glucose measurements to populate this chart.</p>
                </div>
              ) : (
              <div className="h-56 w-full sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Line type="monotone" dataKey="weight" stroke="#16a34a" strokeWidth={3} dot={{r: 4, fill: '#16a34a'}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="glucose" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              )}
            </div>

            {/* VITALS TABLE */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 flex items-center gap-2">
                <Activity className="text-rose-500" size={20} />
                <h3 className="font-bold text-slate-800">Vitals History</h3>
              </div>
              <div className="w-full overflow-x-auto"><table className="w-full min-w-[600px] text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">BP</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Glucose</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Heart Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vitals.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-500">No vitals recorded yet.</td></tr>}
                  {vitals.map(v => (
                    <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-sm font-bold text-slate-700">{v.bloodPressure}</td>
                      <td className="p-4 text-sm text-slate-600">{v.weight} kg</td>
                      <td className="p-4 text-sm text-slate-600">{v.glucose} mg/dL</td>
                      <td className="p-4 text-sm text-slate-600">{v.heartRate} bpm</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          </div>
        </div>
      </main>

      {/* HIDDEN HEALTH CARD FOR DOWNLOAD */}
                    <div className="fixed top-0 left-0 opacity-0 pointer-events-none">

<div
id="healthCard"
style={{
width:"650px",
height:"360px",
background:"#ffffff",
borderRadius:"20px",
border:"1px solid #e5e7eb",
display:"flex",
flexDirection:"column",
overflow:"hidden",
fontFamily:"sans-serif"
}}
>

{/* HEADER */}
<div style={{
background:"#1e40af",
color:"#fff",
padding:"10px 16px",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}>
<div style={{fontWeight:"bold"}}>
JeevanVriksha Health ID
</div>

<div style={{fontSize:"12px"}}>
ID: {id.slice(-6)}
</div>
</div>


{/* BODY */}
<div style={{
flex:1,
display:"flex",
alignItems:"center",
padding:"20px",
gap:"25px"
}}>

{/* AVATAR */}
<div style={{
width:"100px",
height:"100px",
background:"#e5e7eb",
borderRadius:"12px",
display:"flex",
alignItems:"center",
justifyContent:"center"
}}>
<User size={45} color="#374151"/>
</div>


{/* DETAILS */}
<div style={{flex:1,lineHeight:"24px"}}>

<div style={{fontSize:"18px",fontWeight:"bold"}}>
{patient?.name}
</div>

<div>Village: {patient?.village}</div>
<div>Age: {patient?.age}</div>
<div>Blood Group: {patient?.bloodGroup}</div>

<div style={{
marginTop:"10px",
fontSize:"12px",
color:"#6b7280"
}}>
Scan QR to access digital health record
</div>

</div>


{/* QR */}
<div style={{
display:"flex",
flexDirection:"column",
alignItems:"center"
}}>

<div style={{
background:"#fff",
padding:"10px",
border:"2px solid #e5e7eb",
borderRadius:"12px"
}}>

<QRCodeSVG
value={`https://jeevanvriksha.vercel.app/health-card/${patient?._id}`}
size={140}
/>

</div>

<div style={{
marginTop:"6px",
fontSize:"11px",
color:"#6b7280"
}}>
Secure Medical QR
</div>

</div>

</div>


{/* FOOTER */}
<div style={{
background:"#f3f4f6",
fontSize:"11px",
padding:"6px",
textAlign:"center"
}}>
JeevanVriksha Rural Healthcare System
</div>

</div>


</div>



      {/* MODAL QR OVERLAY - SCROLL-PROOF PORTAL */}
<AnimatePresence>
  {showQR && (
    // We use a Portal logic here by wrapping the fixed div
    <div className="fixed inset-0 z-[9999] isolate">
      
      {/* 1. Backdrop - Forced to cover the entire device screen */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowQR(false)}
        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
        style={{ height: '100vh', width: '100vw' }}
      />

      {/* 2. Centering Wrapper - Forces the card into the center of the VIEWPORT */}
      <div className="fixed inset-0 flex items-center justify-center p-4 pointer-events-none">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative bg-white w-full max-w-[340px] rounded-[2.5rem] p-6 shadow-2xl overflow-hidden pointer-events-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-pink-500" />

          <div className="text-center mb-6 pt-2">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Health Pass</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scan for Full Record</p>
          </div>

          {/* QR CODE CONTAINER */}
         <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 mb-6 flex justify-center items-center">

  <div className="flex justify-center items-center">

    <QRCodeCanvas
      value={`https://jeevanvriksha.vercel.app/health-card/${patient?._id}`}
      size={160}
      level="H"
      includeMargin={true}
    />

  </div>

</div>


          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm font-black text-slate-800">{patient?.name || "Unknown"}</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tighter">Verified Asha Digital Record</p>
            </div>

            <button 
              onClick={() => setShowQR(false)} 
              className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-transform"
            >
              Close Window
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )}
</AnimatePresence>
      
      
    </div>
  );
};

export default PatientProfile;