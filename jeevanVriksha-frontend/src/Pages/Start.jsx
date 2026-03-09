import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Startpage from "../assets/startpage.png";
import Logo from "../assets/logo.png";

const Start = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload background image logic
  useEffect(() => {
    const img = new Image();
    img.src = Startpage;
    img.onload = () => setIsLoaded(true);
  }, []);

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-green-950">
      
      {/* 1. BACKGROUND OPTIMIZATION:
          - bg-green-950 shows instantly.
          - Overlay shows instantly.
          - The actual image fades in only when fully downloaded. */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 z-0 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${Startpage})` }}
      />

      {/* Static Overlay - Always visible to ensure text is readable immediately */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-[1]" />

      {/* Logo Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center mt-10 will-change-transform"
      >
        <img
          src={Logo}
          alt="logo"
          loading="eager" // Load this first!
          className="w-[120px] md:w-[140px] drop-shadow-lg"
        />

        <h1 className="mt-4 text-3xl font-bold text-white tracking-wide">
          JeevanVriksha
        </h1>

        <p className="text-green-200 text-sm mt-1">
          Rural Healthcare Platform
        </p>
      </motion.div>

      {/* Login Options */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 w-full px-6 mb-16 flex flex-col gap-4 max-w-md"
      >
        {/* Patient Button */}
        <button
          onClick={() => navigate("/loginUser")}
          className="w-full py-4 rounded-xl bg-white text-black shadow-lg
          flex flex-col items-center justify-center
          active:scale-95 transition-all duration-75"
        >
          <span className="text-xl font-semibold leading-tight">मेरा स्वास्थ्य</span>
          <span className="text-[10px] text-green-700 font-bold uppercase tracking-widest">Patient Login</span>
        </button>

        {/* Staff Button */}
        <button
          onClick={() => navigate("/loginStaff")}
          className="w-full py-4 rounded-xl bg-blue-900 text-white shadow-lg
          flex flex-col items-center justify-center
          active:scale-95 transition-all duration-75"
        >
          <span className="text-xl font-semibold leading-tight">कार्यकर्ता लॉगिन</span>
          <span className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Staff Login</span>
        </button>
      </motion.div>

      {/* Footer - Static to save CPU */}
      <div className="relative z-10 text-center text-[10px] text-green-200/60 mb-4 uppercase tracking-widest">
       .........................
      </div>
    </div>
  );
};

export default Start;