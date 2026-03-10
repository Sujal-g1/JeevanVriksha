import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Bell, Baby, Syringe, Activity, Target, Loader2 } from "lucide-react";

import StatsCard from "../components/StatsCard";
import AlertPanel from "../components/AlertPanel";
import AshaNavbar from "../components/AshaNavbar";
import ActivityFeed from "../components/ActivityFeed";

const AshaDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ patients: 0, pregnancy: 0, vaccines: 0, visits: 0 });
  const [activity, setActivity] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Optimization: Fetch with a timeout for low-bandwidth scenarios
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const [sRes, aRes] = await Promise.all([
          fetch("http://localhost:5001/api/dashboard/stats", { signal: controller.signal }),
          fetch("http://localhost:5001/api/activity", { signal: controller.signal })
        ]);
        
        clearTimeout(timeoutId);
        setStats(await sRes.json());
        setActivity(await aRes.json());
      } catch (e) {
        console.error("Connection slow or offline:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { title: "Patients", path: "/patients", icon: <Users size={18} />, color: "bg-emerald-600" },
    { title: "Register", path: "/create-patient", icon: <UserPlus size={18} />, color: "bg-blue-600" },
    { title: "Alerts", path: "/alerts", icon: <Bell size={18} />, color: "bg-rose-600" },
  ];

  return (
    <div className="min-h-screen bg-[#064a8f] bg-gradient-to-b from-[#064a8f] to-[#1259a1]">
      <AshaNavbar />

      <main className="pt-20 pb-10 px-4 max-w-6xl mx-auto">
        {/* HEADER WITH SLOW-INTERNET INDICATOR */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-white">Daily <span className="text-pink-400">Overview</span></h1>
            <p className="text-blue-200 text-xs font-medium">Real-time health tracking</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-blue-200 text-[10px] font-bold uppercase animate-pulse">
              <Loader2 size={12} className="animate-spin" /> Syncing...
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="flex items-center justify-center md:justify-start gap-3 bg-white/10 hover:bg-white/20 border border-white/10 p-2.5 rounded-xl transition-all active:scale-95"
            >
              <div className={`${action.color} text-white p-2 rounded-lg shadow-lg`}>{action.icon}</div>
              <span className="hidden md:block text-[11px] font-bold text-white uppercase tracking-wider">{action.title}</span>
            </button>
          ))}
        </motion.div>

        {/* STATS - WITH SKELETON LOADING STATE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatsCard label="Patients" value={stats.patients} icon={<Users size={16}/>} trend="+4" loading={loading} />
          <StatsCard label="Pregnancy" value={stats.pregnancy} icon={<Baby size={16}/>} trend="High" loading={loading} />
          <StatsCard label="Vaccines" value={stats.vaccines} icon={<Syringe size={16}/>} trend="Due" loading={loading} color="text-rose-500" />
          <StatsCard label="Visits" value={stats.visits} icon={<Activity size={16}/>} trend="2/4" loading={loading} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            {/* Conditional Rendering for data panels */}
            <div className={`bg-white rounded-2xl overflow-hidden shadow-xl transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              <AlertPanel alerts={[]} />
            </div>
            <div className={`bg-white rounded-2xl overflow-hidden shadow-xl transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              <ActivityFeed activity={activity} />
            </div>
          </div>

          {/* TARGET CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-4"
          >
            <div className="bg-emerald-600 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} />
                  <h3 className="font-bold text-sm">Monthly Progress</h3>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-black mb-1.5 opacity-80 uppercase tracking-widest">
                  <span>Progress</span>
                  <span>65%</span>
                </div>
                  <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden ">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: "65%" }} 
                      transition={{ duration: 2 }}
                      className="h-full bg-white rounded-full" 
                    />
                  </div>

                    <div className="text-[11px] font-medium text-emerald-100 mb-5 mt-2">
               Lorem ipsum dolor sit amet.
              </div>
                </div>
                <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold py-2.5 rounded-xl text-xs transition-all border border-white/20">
                  Generate Report
                </button>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </div>
          </motion.div>

         
          
        </div>
      </main>
    </div>
  );
};

export default AshaDashboard;