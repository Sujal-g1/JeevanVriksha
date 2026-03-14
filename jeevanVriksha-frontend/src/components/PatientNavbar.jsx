import React, { useState, useEffect } from "react";
import { Sliders, MapPin, Camera, Activity, Shield, ChevronDown } from "lucide-react";
import Logo from "../assets/logo.png";
import AIChatbot from "./AIChatbot";
import { FaBrain } from "react-icons/fa";

const PatientNavbar = ({ patientName }) => {
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [showTools, setShowTools] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [locationName, setLocationName] = useState("Fetching...");
  const [ashaName, setAshaName] = useState("");

  // Apply visual settings
  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness}%)`;
    document.documentElement.style.zoom = `${zoom}%`;
  }, [brightness, zoom]);

  // Load ASHA worker name for fallback
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.name) setAshaName(user.name);
  }, []);

  // Live location logic
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data?.address) {
            const city = data.address.city || data.address.town || "Rural Hub";
            setLocationName(`${city}, ${data.address.country_code?.toUpperCase()}`);
          }
        } catch (err) { setLocationName("GPS Active"); }
      });
    }
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-green-100 flex items-center justify-between px-6 z-[100] shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative p-1 bg-green-50 rounded-xl border border-green-100">
          <img src={Logo} alt="logo" className="h-9 w-9 object-contain" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-600"></span>
          </span>
        </div>
        <div>
          <h1 className="text-green-900 text-sm font-black tracking-tight leading-none uppercase">
             {/* Prioritize Patient Name, fallback to ASHA Name */}
             {patientName || ashaName || "Health Worker"}
          </h1>
          <div className="flex items-center gap-1 mt-1 text-[10px] text-green-600 font-bold uppercase tracking-wider">
            <MapPin size={10} />
            <span>{locationName}</span>  
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setShowBot(true)}
          className="flex items-center gap-2 bg-[#00a859] hover:bg-[#008f4a] text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md shadow-green-200 active:scale-95 border border-white/10"
        >
          <FaBrain />
          <span className="hidden sm:inline">AI ASSISTANT</span>
        </button>

        <button
          onClick={() => window.open("https://skin-disease-ai-f-git-main-chirag6.vercel.app/", "_blank")}
          className="p-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl border border-green-200 transition-all"
        >
          <Camera size={18} />
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowTools(!showTools)}
            className={`p-2 rounded-xl border transition-all ${showTools ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
          >
            <Sliders size={18} />
          </button>

          {showTools && (
            <div className="absolute top-14 right-0 w-64 bg-white border border-green-100 rounded-2xl shadow-xl p-5 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-green-900 text-[10px] font-black uppercase mb-4 flex items-center gap-2">
                <Shield size={12}/> Interface Settings
              </h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-green-700 uppercase">
                    Brightness <span>{brightness}%</span>
                  </div>
                  <input type="range" min="50" max="150" value={brightness} onChange={(e)=>setBrightness(e.target.value)} className="w-full h-1.5 accent-green-600 bg-green-100 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-green-700 uppercase">
                    UI Scale <span>{zoom}%</span>
                  </div>
                  <input type="range" min="70" max="130" step="5" value={zoom} onChange={(e)=>setZoom(e.target.value)} className="w-full h-1.5 accent-green-600 bg-green-100 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {showBot && <AIChatbot close={()=>setShowBot(false)} />}
    </nav>
  );
};

export default PatientNavbar;