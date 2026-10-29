import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Startpage from "../assets/startpage.png";
import Logo from "../assets/logo.png";

const Start = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleStaffLogin = () => {
    if (isOpening) return;
  
    setIsOpening(true);
  
    setTimeout(() => {
      navigate("/loginStaff");
    }, 700);
  };


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
          className="w-[200px] md:w-[280px] drop-shadow-lg"
        />

        <h1 className="mt-4 text-4xl font-bold text-white tracking-wide">
          JeevanVriksha
        </h1>

        <p className="text-green-400 text-sm mt-2">
        Smarter Fieldwork. Better Health Outcomes.
        </p>
      </motion.div>

      {/* Login Options */}
      {/* <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 w-full px-6 flex flex-col gap-4 max-w-md"
      > */}
        {/* Patient Button */}
        {/* <button
          onClick={() => navigate("/loginUser")}
          className="w-full py-4 rounded-xl bg-white text-black shadow-lg
          flex flex-col items-center justify-center
          active:scale-95 transition-all duration-75"
        >
          <span className="text-xl font-semibold leading-tight">मेरा स्वास्थ्य</span>
          <span className="text-[10px] text-green-700 font-bold uppercase tracking-widest">Patient Login</span>
        </button> */}

        {/* Staff Button */}
        {/* <button
          onClick={() => navigate("/loginStaff")}
          className="w-full py-4 rounded-xl bg-blue-900 text-white shadow-lg
          flex flex-col items-center justify-center
          active:scale-95 transition-all duration-75"
        > */}
          {/* <span className="text-xl font-semibold leading-tight">कार्यकर्ता लॉगिन</span> */}
          {/* <span className="text-lg text-blue-200 font-semibold uppercase leading-tight">Staff Login</span>
        </button>
      </motion.div> */}

    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative z-10 w-full max-w-md px-6"
    >
      <motion.button
        onClick={handleStaffLogin}
        disabled={isOpening}
        whileTap={{ scale: 0.97 }}
        animate={{
          scale: isOpening ? 0.98 : 1,
          borderColor: isOpening
            ? "rgba(103, 232, 249, 0.6)"
            : "rgba(255, 255, 255, 0)",
        }}
        className="group relative flex w-full items-center justify-between
          overflow-hidden rounded-full border
          bg-blue-900/80 px-5 py-4 text-left
          backdrop-blur-xl transition-colors duration-300
          hover:bg-blue-900 disabled:cursor-wait"
      >
        {/* Animated background sweep */}
        <motion.span  aria-hidden="true"
          initial={{ x: "-120%" }}
          animate={isOpening ? { x: "120%" } : { x: "-120%" }}
          transition={{
            duration: 0.65,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute inset-0
            bg-gradient-to-r from-transparent
            via-cyan-300/15 to-transparent"
        />

        {/* Soft glow */}
        <motion.span
          aria-hidden="true"
          animate={{
            opacity: isOpening ? 0.8 : 0.3,
            scale: isOpening ? 1.4 : 1,
          }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute -left-12 -top-16
            h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl"
        />

        {/* Label */}
        <span className="relative flex items-center gap-3">
          <span className="flex flex-col gap-1">
            <motion.span
              key={isOpening ? "opening" : "login"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-base font-semibold tracking-wide text-white"
            >
              {isOpening ? "" : "Staff Login"}
            </motion.span>
          </span>
        </span>

        {/* Animated arrow / loader */}
        <motion.span
  className="group/arrow relative ml-3 flex h-9 w-9 shrink-0
    items-center justify-center rounded-full
    border border-white/10 bg-white/[0.04] text-white/60
    transition-all duration-300
    hover:border-cyan-200/30 hover:bg-cyan-300/10 hover:text-cyan-100"
  animate={
    isOpening
      ? {
          rotate: 360,
          backgroundColor: "rgba(103, 232, 249, 0.15)",
          borderColor: "rgba(103, 232, 249, 0.3)",
          color: "rgba(207, 250, 254, 1)",
        }
      : {
          rotate: 0,
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          borderColor: "rgba(255, 255, 255, 0.1)",
          color: "rgba(255, 255, 255, 0.6)",
        }
  }
  transition={
    isOpening
      ? { rotate: { duration: 0.7, ease: "linear" } }
      : { duration: 0.3 }
  }
>
  {isOpening ? (
    <motion.span
      className="h-4 w-4 rounded-full border-2
        border-cyan-200/30 border-t-cyan-200"
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  ) : (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      className="h-4 w-4"
      initial={false}
      animate={{ x: 0 }}
      whileHover={{ x: 2 }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-6-6 6 6-6 6"
      />
    </motion.svg>
  )}
</motion.span>

        {/* Bottom accent */}
        <motion.span
          aria-hidden="true"
          animate={{
            opacity: isOpening ? 1 : 0.5,
            scaleX: isOpening ? 1 : 0.7,
          }}
          transition={{ duration: 0.35 }}
          className="absolute bottom-0 left-5 right-5 h-px origin-center
            bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent"
        />
      </motion.button>
    </motion.div>

      {/* Footer - Static to save CPU */}
      <div className="relative z-10 text-center text-[10px] text-green-200/60 mb-4 uppercase tracking-widest">
       .........................
      </div>
    </div>
  );
};

export default Start;