import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, ChevronRight } from "lucide-react";

const AlertPanel = ({ alerts }) => {

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">
          Priority Alerts
        </h2>

        <button className="text-xs font-bold text-emerald-600 hover:underline">
          Mark all read
        </button>
      </div>

      <div className="space-y-4">

        <AnimatePresence>

          {alerts.map((alert, i) => (

            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-white border border-transparent hover:border-emerald-100 transition-all cursor-pointer"
            >

              <div className="flex items-center gap-4">

                <div className={`p-2 rounded-full ${
                  alert.type === "danger"
                    ? "bg-rose-100 text-rose-600"
                    : alert.type === "warning"
                    ? "bg-amber-100 text-amber-600"
                    : "bg-blue-100 text-blue-600"
                }`}>
                  <AlertCircle size={18} />
                </div>

                <div>
                  <p className="font-bold text-slate-700 text-sm md:text-base">
                    {alert.msg}
                  </p>

                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {alert.time}
                  </p>
                </div>

              </div>

              <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500" />

            </motion.div>

          ))}

        </AnimatePresence>

      </div>

    </div>
  );
};

export default AlertPanel;