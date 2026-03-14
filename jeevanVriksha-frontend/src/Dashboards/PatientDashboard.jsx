import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AshaNavbar from "../components/AshaNavbar";
import { ArrowLeft, AlertTriangle } from "lucide-react";

import PatientVitalsChart from "../components/patientDashboardData/PatientVitalsChart";
import PatientOverviewCard from "../components/patientDashboardData/PatientOverviewCard";
import PatientVaccines from "../components/patientDashboardData/PatientVaccines";
import PatientMedicines from "../components/patientDashboardData/PatientMedicines";

const API = import.meta.env.VITE_API_URL;

const PatientDashboard = () => {

const { id } = useParams();
const navigate = useNavigate();

const [patient,setPatient] = useState(null);
const [vitals,setVitals] = useState([]);
const [vaccines,setVaccines] = useState([]);
const [medicines,setMedicines] = useState([]);
const [loading,setLoading] = useState(true);

useEffect(()=>{

const loadData = async () => {

try{

const user = JSON.parse(localStorage.getItem("user"));

if(!user) return;

const headers = {
Authorization:`Bearer ${user.token}`
};

const res = await fetch(`${API}/api/patients/dashboard`,{ headers });

const data = await res.json();

console.log("Dashboard API:",data);

/* PATIENT PROFILE */
setPatient(data.profile || {});

/* VITALS */
setVitals(Array.isArray(data.vitals) ? data.vitals : []);

/* VACCINES */
setVaccines(Array.isArray(data.vaccinations) ? data.vaccinations : []);

/* MEDICINES (if backend sends it) */
setMedicines(Array.isArray(data.medicines) ? data.medicines : []);

}catch(err){

console.error("Dashboard fetch error:",err);

}finally{

setLoading(false);

}

};

loadData();

},[id]);

if(loading){
return(
<div className="min-h-screen flex items-center justify-center text-white bg-[#064a8f]">
Loading dashboard...
</div>
)
}

if(!patient){
return(
<div className="min-h-screen flex items-center justify-center text-white bg-[#064a8f]">
No patient data
</div>
)
}

return(

<div className="min-h-screen bg-[#064a8f] bg-gradient-to-b from-[#064a8f] to-[#1259a1] pb-20">

<AshaNavbar/>

<main className="pt-24 px-4 max-w-7xl mx-auto">

<button
onClick={()=>navigate(-1)}
className="flex items-center gap-2 text-blue-200 text-xs font-black mb-6 uppercase"
>
<ArrowLeft size={16}/> Back
</button>

<div className="grid lg:grid-cols-12 gap-6">

{/* LEFT SIDE */}

<div className="lg:col-span-4 space-y-6">

<PatientOverviewCard patient={patient}/>

<div className="bg-white rounded-3xl p-6 shadow-xl">

<h3 className="flex items-center gap-2 font-bold mb-4">
<AlertTriangle size={18}/> Health Alerts
</h3>

{vitals.length > 0 ? (

<div className="space-y-2 text-sm">

{vitals.some(v => Number(v.glucose) > 140) && (
<p className="text-red-500 font-semibold">
High Glucose detected
</p>
)}

{vitals.some(v => Number(v.weight) > 90) && (
<p className="text-orange-500 font-semibold">
Weight above recommended range
</p>
)}

</div>

):(

<p className="text-gray-400 text-sm">
No alerts available
</p>

)}

</div>

</div>

{/* RIGHT SIDE */}

<div className="lg:col-span-8 space-y-6">

{/* CHART */}
<PatientVitalsChart vitals={vitals}/>

{/* VACCINES */}
<PatientVaccines vaccines={vaccines}/>

{/* MEDICINES */}
<PatientMedicines medicines={medicines}/>

</div>

</div>

</main>

</div>

);

};

export default PatientDashboard;