import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StatsCard from "../components/StatsCard";
import AlertPanel from "../components/AlertPanel";
import Navbar from "../components/Navbar";
import Topbar from "../components/Topbar";

import {
  Users, UserPlus, Bell, AlertCircle, 
  Baby, Syringe, Activity, ChevronRight, 
  LayoutDashboard, Search, Menu, X
} from "lucide-react";

const AshaDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ patients: 0, pregnancy: 0, vaccines: 0, visits: 0 });
  const [alerts, setAlerts] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulate API Fetch with a slight delay for smooth transition
    setTimeout(() => {
      setStats({ patients: 124, pregnancy: 18, vaccines: 12, visits: 5 });
      setAlerts([
        { type: "danger", msg: "Riya Sharma – Vaccination overdue", time: "2h ago" },
        { type: "warning", msg: "Pooja Devi – Pregnancy checkup due", time: "5h ago" },
        { type: "info", msg: "New patient registered today", time: "1d ago" }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const quickActions = [
    { title: "Patients", path: "/patients", icon: <Users size={20} />, color: "bg-emerald-500" },
    { title: "Register", path: "/register-patient", icon: <UserPlus size={20} />, color: "bg-blue-500" },
    { title: "Alerts", path: "/alerts", icon: <Bell size={20} />, color: "bg-rose-500" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900">

      {/* <Navbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} /> */}
      {/* <Topbar toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} /> */}
      

      {/* MAIN LAYOUT */}
      <main className="flex-1 lg:ml-0 p-4 md:p-10 mt-14 lg:mt-0 max-w-7xl mx-auto w-full">
        
        {/* TOP GREETING */}
        <header className="mb-8">
          <motion.p 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-1"
          >
            Welcome Back, Asha Worker
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black tracking-tight text-slate-800"
          >
            Daily <span className="text-emerald-600">Overview.</span>
          </motion.h1>
        </header>

        {/* QUICK ACTIONS ROW */}
        <section className="grid grid-cols-3 gap-3 md:gap-6 mb-10">
          {quickActions.map((action, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center bg-white border border-slate-200 p-4 md:p-6 rounded-2xl shadow-sm hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
            >
              <div className={`${action.color} text-white p-3 rounded-xl mb-3 shadow-lg shadow-emerald-100 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <span className="font-bold text-xs md:text-sm text-slate-700">{action.title}</span>
            </motion.button>
          ))}
        </section>

        {/* STATS GRID */}
       <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

<StatsCard label="Total Patients" value={stats.patients} icon={<Users size={20}/>} trend="+4 this week" loading={loading} />

<StatsCard label="Pregnancy" value={stats.pregnancy} icon={<Baby size={20}/>} trend="High Priority" loading={loading} />

<StatsCard label="Vaccines" value={stats.vaccines} icon={<Syringe size={20}/>} trend="Due Soon" loading={loading} color="text-rose-600" />

<StatsCard label="Today's Visits" value={stats.visits} icon={<Activity size={20}/>} trend="2 completed" loading={loading} />

</section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ALERTS SECTION */}
         <AlertPanel alerts={alerts} />

          {/* PROGRESS CARD (MINIMAL DATA) */}
          <div className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
             <div className="relative z-10">
                <h3 className="text-emerald-200 font-bold text-xs uppercase tracking-widest mb-2">Target Status</h3>
                <h2 className="text-2xl font-black mb-6">Monthly Vaccination Target</h2>
                <div className="w-full bg-emerald-800 h-3 rounded-full overflow-hidden mb-2">
                   <motion.div initial={{ width: 0 }} animate={{ width: "65%" }} transition={{ duration: 1.5 }} className="h-full bg-emerald-400" />
                </div>
                <p className="text-emerald-300 text-sm font-medium">65% Completed (42/65 children)</p>
             </div>
             
             <button className="relative z-10 w-full bg-emerald-400 text-emerald-950 font-black py-4 rounded-2xl hover:bg-white transition-colors">
               Generate Report
             </button>

             {/* Minimalist background circles for "vibe" without heavy images */}
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-800 rounded-full opacity-50 blur-3xl"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

// COMPONENT: STAT CARD
const StatCard = ({ label, value, icon, trend, loading, color = "text-emerald-600" }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[140px]"
  >
    <div className="flex justify-between items-start">
      <div className={`p-2 bg-slate-50 rounded-xl ${color}`}>
        {icon}
      </div>
      {loading ? (
        <div className="h-4 w-16 bg-slate-100 animate-pulse rounded"></div>
      ) : (
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{trend}</span>
      )}
    </div>
    
    <div>
      {loading ? (
        <div className="h-8 w-12 bg-slate-100 animate-pulse rounded mb-2"></div>
      ) : (
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h2>
      )}
      <p className="text-sm font-bold text-slate-500">{label}</p>
    </div>
  </motion.div>
);

export default AshaDashboard;