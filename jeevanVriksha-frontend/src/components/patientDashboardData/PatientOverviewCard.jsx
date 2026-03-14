import React from "react";
import { User, MapPin, Droplets, Calendar, Hash } from "lucide-react";

const PatientOverviewCard = ({ patient }) => {
  return (
    <div className="bg-white rounded-[2rem] p-5 md:p-8 shadow-xl border border-green-50 relative overflow-hidden">
      {/* Decorative Brand Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 z-0" />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8">
          {/* Enhanced Avatar with Pulse */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-200">
              <User size={32} className="text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-black text-green-900 leading-tight uppercase tracking-tight">
              {patient?.name}
            </h2>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-green-600/70">
              <Hash size={12} strokeWidth={3} />
              <span className="text-[10px] font-black tracking-widest uppercase">
                ID-{patient?._id?.slice(-6)}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid - Fits 2 columns on mobile, 1 on tablet sidebar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50/50 p-3 rounded-2xl border border-green-100/50">
            <div className="flex items-center gap-2 text-green-800 mb-1">
              <MapPin size={14} className="text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Location</span>
            </div>
            <p className="text-sm font-bold text-slate-700 truncate">{patient?.village}</p>
          </div>

          <div className="bg-green-50/50 p-3 rounded-2xl border border-green-100/50">
            <div className="flex items-center gap-2 text-green-800 mb-1">
              <Calendar size={14} className="text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Age</span>
            </div>
            <p className="text-sm font-bold text-slate-700">{patient?.age} Years</p>
          </div>

          <div className="bg-green-50/50 p-3 rounded-2xl border border-green-100/50 col-span-2">
            <div className="flex items-center gap-2 text-green-800 mb-1">
              <Droplets size={14} className="text-green-600" />
              <span className="text-[10px] font-black uppercase tracking-tighter">Blood Group</span>
            </div>
            <p className="text-sm font-bold text-slate-700">{patient?.bloodGroup || "Not Set"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientOverviewCard;