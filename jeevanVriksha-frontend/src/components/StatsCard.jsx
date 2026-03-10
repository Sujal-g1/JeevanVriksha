import React from "react";
import { motion } from "framer-motion";

const StatsCard = ({ label, value, icon, trend, loading, color = "text-emerald-600" }) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white p-3 md:p-4 rounded-2xl border border-white/20 shadow-lg flex flex-col justify-between min-h-[100px] md:min-h-[120px] relative overflow-hidden transition-all"
    >
      {/* Background Decorative Element for Polish */}
      <div className={`absolute -right-2 -top-2 w-12 h-12 rounded-full opacity-5 blur-xl ${color.replace('text', 'bg')}`} />

      <div className="flex justify-between items-start mb-2">
        <div className={`p-1.5 md:p-2 bg-slate-50 rounded-lg ${color} shadow-sm`}>
          {/* Ensure icon size is consistent even if passed differently */}
          {React.cloneElement(icon, { size: 16 })}
        </div>

        {loading ? (
          <div className="h-3 w-10 bg-slate-100 animate-pulse rounded-full" />
        ) : (
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 uppercase tracking-tighter ${color}`}>
            {trend}
          </span>
        )}
      </div>

      <div className="mt-auto">
        {loading ? (
          <div className="space-y-1">
            <div className="h-5 w-8 bg-slate-100 animate-pulse rounded" />
            <div className="h-3 w-14 bg-slate-50 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-none">
              {value}
            </h2>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-1 truncate">
              {label}
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;