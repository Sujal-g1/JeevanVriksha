import React, { useState, useEffect } from "react";
import { Sliders, MapPin, Maximize, Minimize } from "lucide-react";
import Logo from "../assets/logo.png";

const AshaNavbar = () => {
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(100); // Percentage based
  const [showTools, setShowTools] = useState(false);
    const [ashaName, setAshaName] = useState("");

  useEffect(() => {
    // Apply Brightness
    document.documentElement.style.filter = `brightness(${brightness}%)`;
    
    // Apply Zoom correctly to the root element
    // This scales everything: text, icons, and containers
    document.documentElement.style.zoom = `${zoom}%`;
  }, [brightness, zoom]);


    // --- ASHA name
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.name) {
    setAshaName(user.name);
  }
}, []);


  return (
    <nav className="fixed top-0 left-0 w-full h-14 bg-[#064a8f] border-b border-white/10 flex items-center justify-between px-4 z-[100] shadow-md">
      <div className="flex items-center gap-3">
        <img src={Logo} alt="logo" className="h-10 w-10 object-contain bg-white rounded-lg p-0.5" />
        <div className="leading-tight">
          <h1 className="text-white text-sm font-bold">
             {ashaName || "ASHA Worker"}
          </h1>
          <div className="flex items-center gap-1 text-[9px] text-blue-200 font-medium">
            <MapPin size={8} /> live location
          </div>
        </div>
      </div>

      <div className="relative">
        <button 
          onClick={() => setShowTools(!showTools)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all border border-white/10"
        >
          <Sliders size={14} />
        </button>

        {showTools && (
          <div className="absolute top-12 right-0 w-64 bg-white rounded-2xl shadow-2xl p-4 border border-slate-200 z-[101]">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase flex justify-between">
                  Brightness <span>{brightness}%</span>
                </label>
                <input type="range" min="50" max="150" value={brightness} onChange={(e)=>setBrightness(e.target.value)} className="w-full h-1.5 accent-blue-600 bg-slate-100 rounded-lg appearance-none mt-2" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase flex justify-between">
                  UI Scale (Zoom) <span>{zoom}%</span>
                </label>
                <input type="range" min="70" max="130" step="5" value={zoom} onChange={(e)=>setZoom(e.target.value)} className="w-full h-1.5 accent-blue-600 bg-slate-100 rounded-lg appearance-none mt-2" />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AshaNavbar;