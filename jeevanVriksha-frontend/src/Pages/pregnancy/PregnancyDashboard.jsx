import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AshaNavbar from "../../components/AshaNavbar";
import { 
  ArrowLeft, Activity, Calendar, Droplets, 
  Weight, Pill, ClipboardList, AlertTriangle, TrendingUp 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const PregnancyDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [patient, setPatient] = useState(null);
  const [pregnancy, setPregnancy] = useState({
    trimester: "", dueDate: "", hemoglobin: "",
    bp: "", weight: "", ironTablets: "", notes: ""
  });
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [activeChart, setActiveChart] = useState("weight");

  // Chart data (ideally this would come from your history API)
  const chartData = [
    { month: "1st", weight: 50, hb: 11, bp: 120, iron: 10 },
    { month: "3rd", weight: 52, hb: 10.8, bp: 118, iron: 20 },
    { month: "5th", weight: 55, hb: 10.5, bp: 122, iron: 35 },
    { month: "7th", weight: 58, hb: 10.2, bp: 125, iron: 50 },
    { month: "9th", weight: 60, hb: 10, bp: 128, iron: 65 }
  ];

  const checkRisk = (data) => {
    const alerts = [];
    if (data.hemoglobin && Number(data.hemoglobin) < 10) alerts.push("Low Hemoglobin (Anemia Risk)");
    if(data.bp && data.bp.includes("/")){

const systolic = Number(data.bp.split("/")[0])

if(systolic > 140){
alerts.push("High Blood Pressure (Preeclampsia Risk)")
}

} 
    if (data.weight && Number(data.weight) < 45) alerts.push("Low maternal weight");
    if (data.ironTablets && Number(data.ironTablets) < 30) alerts.push("Low Iron Tablet Intake");
    setRiskAlerts(alerts);

    if(data.hemoglobin && Number(data.hemoglobin) < 7){
alerts.push("🚨 Severe Anemia — Immediate referral needed")
}

if(data.bp && data.bp.includes("/")){
const systolic = Number(data.bp.split("/")[0])
if(systolic > 160){
alerts.push("🚨 Hypertensive Crisis — Emergency care needed")
}
}
  };

  useEffect(() => {
    fetch(`http://localhost:5001/api/patients/${id}`).then(res => res.json()).then(setPatient);
    fetch(`http://localhost:5001/api/pregnancy/${id}`).then(res => res.json()).then(data => {
      if (data) {
        const formatted = {
          trimester: data.trimester || "",
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
          hemoglobin: data.hemoglobin || "",
          bp: data.bp || "",
          weight: data.weight || "",
          ironTablets: data.ironTablets || "",
          notes: data.notes || ""
        };
        setPregnancy(formatted);
        checkRisk(formatted);
      }
    });
  }, [id]);

 const handleChange = (e) => {
const updated = {
  ...pregnancy,
  [e.target.name]: e.target.value
}

setPregnancy(updated)

checkRisk(updated)

};

  const saveData = async () => {
    await fetch("http://localhost:5001/api/pregnancy/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId: id, ...pregnancy })
    });
   checkRisk(pregnancy)
    alert("Pregnancy data saved successfully!");
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-[#064a8f] bg-gradient-to-b from-[#064a8f] to-[#1259a1] pb-20">
      <AshaNavbar />

      <main className="pt-24 px-4 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-200 text-xs font-black mb-6 uppercase tracking-widest hover:text-white transition-all"
        >
          <ArrowLeft size={16} /> Back to Profile
        </button>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: FORM & ALERTS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* HEADER */}
            <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-6 rounded-[2.5rem] border border-white/20">
              <div>
                <h1 className="text-2xl font-black text-white">ANC Tracker</h1>
                <p className="text-blue-200 text-sm font-medium">Patient: <span className="text-white font-bold">{patient.name}</span></p>
              </div>
              <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-900/30">
                <Droplets size={24} />
              </div>
            </div>

            {/* RISK PANEL */}
            <AnimatePresence>
              {riskAlerts.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-rose-50 border border-rose-100 rounded-[2rem] p-5 shadow-xl shadow-rose-900/20"
                >
                  <div className="flex items-center gap-2 mb-3 text-rose-600">
                    <AlertTriangle size={20} className="animate-pulse" />
                    <h3 className="font-black text-xs uppercase tracking-widest">High Risk Alerts Identified</h3>
                  </div>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {riskAlerts.map((alert, index) => (
                      <li key={index} className="bg-white/60 p-2 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 border border-rose-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> {alert}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>

            {/* PREGNANCY FORM CARD */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Trimester</label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input name="trimester" value={pregnancy.trimester} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="1 / 2 / 3" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Expected Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input name="dueDate" type="date" value={pregnancy.dueDate} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Hemoglobin (g/dL)</label>
                  <div className="relative">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-300" size={16} />
                    <input name="hemoglobin" value={pregnancy.hemoglobin} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="11.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Blood Pressure</label>
                  <div className="relative">
                    <Activity className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
                    <input name="bp" value={pregnancy.bp} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="120/80" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Weight (kg)</label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" size={16} />
                    <input name="weight" value={pregnancy.weight} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="65" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Iron Tablets Taken</label>
                  <div className="relative">
                    <Pill className="absolute left-3 top-1/2 -translate-y-1/2 text-orange-400" size={16} />
                    <input name="ironTablets" value={pregnancy.ironTablets} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Qty" />
                  </div>
                </div>

              </div>

              <div className="mt-6">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Doctor's Observation Notes</label>
                <div className="relative mt-1">
                  <ClipboardList className="absolute left-3 top-3 text-slate-300" size={16} />
                  <textarea name="notes" rows="3" value={pregnancy.notes} onChange={handleChange} className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Add clinical notes..." />
                </div>
              </div>

              <button
                onClick={saveData}
                className="w-full mt-8 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
              >
                Sync with Central Database
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: CHARTS */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-[2.5rem] p-6 shadow-2xl">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={20} className="text-blue-600" />
                <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Health Insights</h3>
              </div>

              {/* TABS */}
              <div className="grid grid-cols-2 gap-2 mb-8">
                {[
                  {id: 'weight', label: 'Weight', color: 'blue'},
                  {id: 'hb', label: 'Hemoglobin', color: 'pink'},
                  {id: 'bp', label: 'Blood Pressure', color: 'purple'},
                  {id: 'iron', label: 'Iron Intake', color: 'orange'}
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChart(tab.id)}
                    className={`py-2 px-4 rounded-xl text-[10px] font-black uppercase transition-all border-2 
                      ${activeChart === tab.id 
                        ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* CHART AREA */}
              <div className="h-64 w-full bg-slate-50 rounded-3xl p-4 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 'bold'}} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                    <Line 
                      type="monotone" 
                      dataKey={activeChart} 
                      stroke={
                        activeChart === 'weight' ? '#2563eb' : 
                        activeChart === 'hb' ? '#ec4899' : 
                        activeChart === 'bp' ? '#7c3aed' : '#f97316'
                      } 
                      strokeWidth={4} 
                      dot={{r: 6, fill: 'white', strokeWidth: 3}} 
                      activeDot={{r: 8}} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] text-blue-600 font-bold leading-relaxed">
                  <b>ASHA Pro-tip:</b> Consistent tracking of {activeChart} helps in early detection of complications. Ensure data is updated every 15 days.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default PregnancyDashboard;