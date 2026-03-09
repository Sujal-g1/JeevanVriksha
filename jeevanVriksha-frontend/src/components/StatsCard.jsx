import React from "react";
import { motion } from "framer-motion";

const StatsCard = ({ label, value, icon, trend, loading, color = "text-emerald-600" }) => {

  return (
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {trend}
          </span>
        )}

      </div>

      <div>
        {loading ? (
          <div className="h-8 w-12 bg-slate-100 animate-pulse rounded mb-2"></div>
        ) : (
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {value}
          </h2>
        )}

        <p className="text-sm font-bold text-slate-500">
          {label}
        </p>
      </div>

    </motion.div>
  );
};

export default StatsCard;