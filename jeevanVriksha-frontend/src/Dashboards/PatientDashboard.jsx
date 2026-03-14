import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PatientNavbar from "../components/PatientNavbar";
import { ArrowLeft, AlertTriangle, Activity, Heart, ShieldCheck } from "lucide-react";

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
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if(!user) return;
      const res = await fetch(`${API}/api/patients/dashboard`,{ 
        headers: { Authorization:`Bearer ${user.token}` } 
      });
      const data = await res.json();
      setPatient(data.profile || {});
      setVitals(Array.isArray(data.vitals) ? data.vitals : []);
      setVaccines(Array.isArray(data.vaccinations) ? data.vaccinations : []);
      setMedicines(Array.isArray(data.medicines) ? data.medicines : []);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  loadData();
},[id]);

if(loading){
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#e8f5e9]">
      <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-green-800 font-black text-xs tracking-widest uppercase">Accessing Health Cloud...</p>
    </div>
  )
}

// Inside PatientDashboard.jsx return statement...

return (
  <div className="min-h-screen bg-[#f1fcf4] pb-20">
    <div className="fixed inset-0 bg-gradient-to-br from-[#dcfce7] via-white to-white pointer-events-none" />
    
    <PatientNavbar patientName={patient?.name} />
  
    {/* Added 'overflow-hidden' and 'px-4' to prevent horizontal scroll on mobile */}
    <main className="relative pt-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
      <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-green-900  text-xs font-bold mb-6 uppercase tracking-widest hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </button>
      {/* Live Monitor Header */}
      <div className="flex items-center justify-center sm:justify-end mb-6">
        <div className="bg-white/60 backdrop-blur-sm border border-green-200 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
          <Activity size={14} className="text-green-600 animate-pulse" />
          <span className="text-[10px] font-black text-green-800 uppercase tracking-widest">Live telemetry active</span>
        </div>
      </div>

      {/* Grid: 1 column on mobile, 12 on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: Takes full width on mobile, 4 columns on desktop */}
        <div className="lg:col-span-4 space-y-6">
          <div className="transition-transform duration-300 active:scale-[0.98]">
            <PatientOverviewCard patient={patient}/>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-7 border border-green-100 shadow-xl shadow-green-900/5">
            <h3 className="flex items-center gap-2 font-black text-[10px] uppercase tracking-[0.2em] text-green-900 mb-6 border-b border-green-50 pb-3">
              <AlertTriangle size={16} className="text-orange-500"/> System Intelligence
            </h3>

            {/* Content of Alerts remains the same, but ensure padding is responsive */}
            <div className="space-y-4">
              {/* Alert Items */}
              {vitals.some(v => Number(v.glucose) > 140) && (
                 <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 flex items-start gap-3">
                    <Heart className="text-red-500 shrink-0" size={18}/>
                    <div>
                      <p className="text-red-900 text-xs font-black uppercase tracking-tighter leading-none">High Glucose</p>
                      <p className="text-[10px] text-red-700 mt-1 opacity-70 italic font-bold">Monitor immediate intake</p>
                    </div>
                  </div>
              )}
              {/* ... other alerts */}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Visualizations */}
        <div className="lg:col-span-8 space-y-6 md:gap-8">
          {/* Ensure Chart is responsive */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-4 md:p-6 border border-green-100 shadow-xl shadow-green-900/5 overflow-x-auto">
            <PatientVitalsChart vitals={vitals}/>
          </div>

          {/* Bottom Row - Stack on mobile, side-by-side on tablet/desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-green-100 shadow-lg shadow-green-900/5">
               <PatientVaccines vaccines={vaccines}/>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-green-100 shadow-lg shadow-green-900/5">
               <PatientMedicines medicines={medicines}/>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);
};

export default PatientDashboard;