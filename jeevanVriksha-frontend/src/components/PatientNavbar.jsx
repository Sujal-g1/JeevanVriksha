import React, { useState, useEffect } from "react";
import { Sliders, MapPin, Camera, Shield, Menu, X, Home, BookOpen, Users, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import AIChatbot from "./AIChatbot";
import { FaBrain } from "react-icons/fa";

const PatientNavbar = ({ patientName }) => {
  const navigate = useNavigate();
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(100);
  const [showTools, setShowTools] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ashaName, setAshaName] = useState("");

  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness}%)`;
    document.documentElement.style.zoom = `${zoom}%`;
  }, [brightness, zoom]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.name) setAshaName(user.name);
  }, []);

  const navItems = [
    { name: "Dashboard", icon: <Home size={20}/>, path: "/dashboard" },
    { name: "Patient List", icon: <Users size={20}/>, path: "/patients" },
    { name: "ASHA Help Guide", icon: <BookOpen size={20}/>, path: "/asha-module" },
    { name: "Skin Sensor", icon: <Camera size={20}/>, path: "/skin-sensor" }
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md border-b border-green-100 flex items-center justify-between px-4 md:px-6 z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          {/* Sidebar Trigger Button */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-green-50 rounded-xl text-green-700 transition-colors"
          >
            <Menu size={24} />
          </button>

          <div className="relative p-1 bg-green-50 rounded-xl border border-green-100 hidden sm:block">
            <img src={Logo} alt="logo" className="h-8 w-8 object-contain" />
          </div>

          <div>
            <h1 className="text-green-900 text-sm font-black tracking-tight leading-none uppercase">
               {patientName || ashaName || "Health Worker"}
            </h1>
            <p className="text-[9px] text-green-600 font-bold uppercase tracking-wider mt-0.5">
              JeevanVriksha Cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
         <button
  onClick={() => window.open("https://skin-disease-ai-f-git-main-chirag6.vercel.app/", "_blank")}
  className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl text-[10px] font-black shadow-md shadow-blue-100 active:scale-95 transition-all"
>
  <Camera size={18}/>
  <span className="hidden md:inline uppercase">Skin Sensor</span>
</button> 
          <button
            onClick={() => setShowBot(true)}
            className="flex items-center gap-2 bg-[#00a859] text-white px-3 py-2 rounded-xl text-[10px] font-black shadow-md shadow-green-100 active:scale-95 transition-all"
          >
            <FaBrain size={18}/>
            <span className="hidden md:inline uppercase">AI Assistant</span>
          </button>

          <button 
            onClick={() => setShowTools(!showTools)}
            className={`p-2 rounded-xl border transition-all ${showTools ? 'bg-green-600 text-white border-green-600' : 'bg-white text-green-700 border-green-200 hover:bg-green-50'}`}
          >
            <Sliders size={18} />
          </button>
        </div>

        {/* Settings Dropdown */}
        {showTools && (
          <div className="absolute top-14 right-6 w-64 bg-white border border-green-100 rounded-2xl shadow-xl p-5 animate-in fade-in slide-in-from-top-2 z-[110]">
             <h4 className="text-green-900 text-[10px] font-black uppercase mb-4 flex items-center gap-2">
                <Shield size={12}/> Interface Settings
              </h4>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-green-700 uppercase">Brightness <span>{brightness}%</span></div>
                  <input type="range" min="50" max="150" value={brightness} onChange={(e)=>setBrightness(e.target.value)} className="w-full h-1.5 accent-green-600 bg-green-100 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-green-700 uppercase">UI Scale <span>{zoom}%</span></div>
                  <input type="range" min="70" max="130" step="5" value={zoom} onChange={(e)=>setZoom(e.target.value)} className="w-full h-1.5 accent-green-600 bg-green-100 rounded-lg appearance-none cursor-pointer" />
                </div>
              </div>
          </div>
        )}
      </nav>

      {/* --- SIDEBAR OVERLAY --- */}
      <div 
        className={`fixed inset-0 bg-green-900/20 backdrop-blur-sm z-[200] transition-opacity duration-300 ${isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* --- SIDEBAR PANEL --- */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-[201] shadow-2xl transform transition-transform duration-300 ease-out p-6 flex flex-col ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="logo" className="h-10 w-10" />
            <span className="font-black text-green-900 tracking-tighter text-lg uppercase">Jeevan<br/>Vriksha</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-green-50 text-green-700 rounded-full">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-green-800 font-bold hover:bg-green-50 transition-colors group"
            >
              <span className="text-green-500 group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl text-red-600 font-bold hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>

      {showBot && <AIChatbot close={()=>setShowBot(false)} />}
    </>
  );
};

export default PatientNavbar;