import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { 
  User, MapPin, Droplets, Calendar, Activity, 
  TrendingUp, ShieldCheck, Download, QrCode, Plus, ArrowLeft, 
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; 
import AshaNavbar from "../../components/AshaNavbar";

const API = import.meta.env.VITE_API_URL;

// offline
import { cachePatientProfile, getCachedPatientProfile } from "../../services/patientCacheService";
import { distributeMedicine } from "../../services/medicineService";

const PatientProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);
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

// medicine fn

const fetchPatientMedicines = async () => {

  try {

    const user = JSON.parse(localStorage.getItem("user"))

    const res = await fetch(`${API}/api/medicine/patient/${id}`,{
      headers:{
        Authorization:`Bearer ${user.token}`
      }
    })

    const data = await res.json()

    setMedicines(data)

  } catch(err){
    console.log("Medicine fetch error",err)
  }

}

const fetchMedicines = async () => {

  try{

    const user = JSON.parse(localStorage.getItem("user"))

    const res = await fetch(`${API}/api/medicine/all`,{
      headers:{
        Authorization:`Bearer ${user.token}`
      }
    })

    const data = await res.json()

    setMedicineList(data)

  }catch(err){
    console.log("Medicine list error",err)
  }

}

// handle submit medicine
const giveMedicine = async () => {

  try{

    const user = JSON.parse(localStorage.getItem("user"))

    const payload = {
      patientId: id,
      medicineId: medicineData.medicineId,
      quantity: Number(medicineData.quantity)
    }

    console.log("Sending medicine:", payload)

    const res = await fetch(`${API}/api/medicine/distribute`,{

      method:"POST",

      headers:{
        "Content-Type":"application/json",
        Authorization:`Bearer ${user.token}`
      },

      body:JSON.stringify({
        patientId:id,
        medicineId:medicineData.medicineId,
        quantity:Number(medicineData.quantity)
      })

    })

    if(res.ok){

      alert("Medicine given successfully")

      setShowMedicineForm(false)

      setMedicineData({
        medicineId:"",
        quantity:""
      })

      fetchPatientMedicines()

    }

  }catch(err){

    console.log(err)

  }

}

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
  const downloadCard = async () => {
    const card = document.getElementById("healthCard");
    const canvas = await html2canvas(card, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF();
    pdf.addImage(imgData, "PNG", 15, 15, 180, 105);
    pdf.save(`${patient?.name}_HealthCard.pdf`);
  };

  const handleAddVital = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    const response = await fetch(`${API}/api/vitals/add`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${user.token}`
  },
  body: JSON.stringify({
    patientId: id,
    ...formData
  })
})

    if (response.ok) {
      alert("Vitals added successfully");
      fetch(`${API}/api/vitals/${id}`).then(res => res.json()).then(setVitals);
      setFormData({ bloodPressure: "", weight: "", glucose: "", heartRate: "", notes: "" });
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
    <div className="min-h-screen flex items-center justify-center bg-[#064a8f] text-white">
      Loading patient record...
    </div>
  )
}

  return (
    <div className="min-h-screen bg-[#064a8f] bg-gradient-to-b from-[#064a8f] to-[#1259a1] pb-12">
      <AshaNavbar />

      <main className="pt-20 px-4 max-w-7xl mx-auto">
        {/* BREADCRUMB */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-blue-200 text-xs font-bold mb-6 uppercase tracking-widest hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to List
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: PROFILE & VACCINES */}
          <div className="lg:col-span-4 space-y-6">
            
          {/* PERSONAL INFO CARD - WITH EDIT LOGIC */}
<div className="bg-white rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden">
  <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-50 rounded-full" />

  <div className="flex justify-between items-start mb-6 relative z-10">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
        <User size={32} />
      </div>
      <div>
        {isEditing ? (
          <input 
            className="text-xl font-black text-slate-800 border-b-2 border-blue-500 outline-none w-full"
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

{/* Newborn / Pregnancy Toggle */}

<div className="mt-4 space-y-3">

{/* NEWBORN */}
<label className="flex items-center gap-3 cursor-pointer">
{/* Inside the Newborn Toggle */}
<input
  type="checkbox"
  checked={!!editData.isNewborn} // Force boolean with !!
  onChange={(e) => setEditData({
    ...editData,
    isNewborn: e.target.checked // This captures true/false correctly
  })}
/>

<span className="text-sm font-bold text-slate-700">
Newborn
</span>

</label>


{/* PREGNANT */}

{/* PREGNANT TOGGLE - UPDATED */}
{editData.gender === "Female" && (
  <label className="flex items-center gap-3 cursor-pointer">
    <input
      type="checkbox"
      // Use !! to ensure it's a true boolean (not undefined/null)
      checked={editData.pregnancyStatus === "pregnant"} 
      onChange={(e) =>
  setEditData({
    ...editData,
    pregnancyStatus: e.target.checked ? "pregnant" : "not_pregnant"
  })
}
    />
    <span className="text-sm font-bold text-pink-600">
      Pregnant
    </span>
  </label>
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
         
<div className="bg-white rounded-[2.5rem] p-6 shadow-xl">
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
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100"
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

<div className="bg-white rounded-[2.5rem] p-6 shadow-xl">

  {/* HEADER */}
  <button
    onClick={() => setIsMedExpanded(!isMedExpanded)}
    className="w-full flex items-center justify-between mb-2"
  >

    <div className="flex items-center gap-2">
      <Activity className="text-blue-500" size={20} />
      <h3 className="font-bold text-slate-800">Medicine Tracker</h3>

      <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-bold">
        {medicines.length}
      </span>
    </div>

    <ChevronDown
      size={20}
      className={`transition-transform ${isMedExpanded ? "rotate-180" : ""}`}
    />

  </button>


  <AnimatePresence>
  {isMedExpanded && (

  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="overflow-hidden pt-3 border-t border-slate-50"
  >

    {/* GIVE MEDICINE BUTTON */}

    <button
      onClick={()=>setShowMedicineForm(!showMedicineForm)}
      className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg mb-3"
    >
      + Give Medicine
    </button>


    {/* FORM */}

    {showMedicineForm && (

      <div className="space-y-3 mb-4">

        <select
          value={medicineData.medicineId}
          onChange={(e)=>setMedicineData({...medicineData,medicineId:e.target.value})}
          className="w-full border rounded-lg p-2 text-sm"
        >

          <option value="">Select Medicine</option>

          {medicineList.map(m => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}

        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={medicineData.quantity}
          onChange={(e)=>setMedicineData({...medicineData,quantity:e.target.value})}
          className="w-full border rounded-lg p-2 text-sm"
        />

        <button
          onClick={giveMedicine}
          className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs"
        >
          Save
        </button>

      </div>

    )}


    {/* HISTORY */}

    <div className="space-y-2">

      {medicines.length === 0 && (
        <p className="text-sm text-gray-400">
          No medicines given yet
        </p>
      )}

      {medicines.map(m => (

        <div
          key={m._id}
          className="flex justify-between items-center border p-2 rounded-lg"
        >

          <div>

            <p className="font-semibold text-sm">
              {m.medicineId?.name}
            </p>

            <p className="text-xs text-gray-400">
              {new Date(m.givenDate).toLocaleDateString()}
            </p>

          </div>

          <span className="text-sm font-bold">
            {m.quantity}
          </span>

        </div>

      ))}

    </div>

  </motion.div>

  )}
  </AnimatePresence>

</div>

          </div>

          {/* RIGHT COLUMN: VITALS & CHART */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ADD VITALS FORM */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-[2.5rem] p-6">
              <div className="flex items-center gap-2 mb-6 text-white">
                <Plus size={20} className="bg-pink-500 rounded-lg p-0.5" />
                <h3 className="font-bold">Record New Vitals</h3>
              </div>
              <form onSubmit={handleAddVital} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-200 uppercase ml-2">BP (120/80)</label>
                  <input name="bloodPressure" value={formData.bloodPressure} onChange={handleChange} className="w-full bg-white rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-200 uppercase ml-2">Weight (kg)</label>
                  <input name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-white rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-200 uppercase ml-2">Glucose</label>
                  <input name="glucose" value={formData.glucose} onChange={handleChange} className="w-full bg-white rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-blue-200 uppercase ml-2">Heart Rate</label>
                  <input name="heartRate" value={formData.heartRate} onChange={handleChange} className="w-full bg-white rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
                </div>
                <div className="col-span-2 md:col-span-3 space-y-1">
                  <label className="text-[10px] font-black text-blue-200 uppercase ml-2">Notes</label>
                  <input name="notes" value={formData.notes} onChange={handleChange} placeholder="General health notes..." className="w-full bg-white rounded-xl py-2 px-3 text-sm outline-none focus:ring-2 focus:ring-pink-400 transition-all" />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 rounded-xl text-sm transition-all shadow-lg shadow-pink-900/20">
                    Save
                  </button>
                </div>
              </form>
            </div>

            {/* CHART SECTION */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="text-blue-500" size={20} />
                <h3 className="font-bold text-slate-800">Health Trends</h3>
              </div>
              <div className="h-64 w-full">
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
            </div>

            {/* VITALS TABLE */}
            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-50 flex items-center gap-2">
                <Activity className="text-rose-500" size={20} />
                <h3 className="font-bold text-slate-800">Vitals History</h3>
              </div>
              <table className="w-full text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">BP</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Glucose</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Heart Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {vitals.map(v => (
                    <tr key={v._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-sm font-bold text-slate-700">{v.bloodPressure}</td>
                      <td className="p-4 text-sm text-slate-600">{v.weight} kg</td>
                      <td className="p-4 text-sm text-slate-600">{v.glucose} mg/dL</td>
                      <td className="p-4 text-sm text-slate-600">{v.heartRate} bpm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* HIDDEN HEALTH CARD FOR DOWNLOAD */}
      <div className="fixed -left-[2000px]">
        <div id="healthCard" className="w-[600px] p-8 bg-white border-[12px] border-blue-600 rounded-[3rem]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black text-blue-700 leading-none">JeevanVriksha</h2>
              <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Digital Health Passport</p>
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">MARCH 2026</div>
          </div>
          <div className="flex gap-8">
            <div className="w-40 h-40 bg-slate-100 rounded-3xl flex items-center justify-center border-4 border-slate-50">
             <QRCodeCanvas 
            value={`https://jeevanvriksha.vercel.app/health-card/${patient?._id}`}
            size={140}
          />

            </div>
            <div className="flex-1 space-y-2 py-2">
              <p className="text-xl font-black text-slate-800">{patient?.name}</p>
              <p className="text-md text-slate-600"><b>Village:</b> {patient?.village}</p>
              <p className="text-md text-slate-600"><b>Age:</b> {patient?.age} Years</p>
              <p className="text-md text-slate-600"><b>Blood:</b> {patient?.bloodGroup}</p>
              <p className="text-xs text-blue-500 font-bold mt-4 uppercase tracking-tighter">Scan to access full history</p>
            </div>
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
          <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-5 mb-6 flex items-center justify-center">
            <div className="w-full aspect-square max-w-[200px]">
              <QRCodeCanvas 
                value={`https://jeevanvriksha.vercel.app/health-card/${patient?._id}`}
                style={{ width: '100%', height: '100%' }}
                size={512}
                level={"H"}
                includeMargin={false}
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