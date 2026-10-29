import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/logo.png";
import Startpage from "../assets/startpage.png";

const API = import.meta.env.VITE_API_URL;

const LoginForm = ({ handleLogin, workerId, setWorkerId, password, setPassword, loading }) => (
  <form onSubmit={handleLogin} className="space-y-5">

    <div>
      <label className="text-sm text-gray-600 font-semibold uppercase tracking-tight">
        Government ID / आईडी नंबर
      </label>

      <input
        type="text"
        required
        value={workerId}
        placeholder="ASHA-XXXX-2024"
        onChange={(e) => setWorkerId(e.target.value)}
        className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all font-mono"
      />
    </div>

    <div>
      <label className="text-sm text-gray-600 font-semibold uppercase tracking-tight">
        Security Password / पासवर्ड
      </label>

      <input
        type="password"
        required
        value={password}
        placeholder="••••••••"
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mt-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none transition-all"
      />
    </div>

    <motion.button
      whileTap={{ scale: 0.97 }}
      type="submit"
      disabled={loading}
      className="w-full bg-blue-800 hover:bg-blue-900 text-white py-4 rounded-lg font-bold shadow-lg shadow-blue-200"
    >
      {loading ? "Verifying Credentials..." : "Secure Login"}
    </motion.button>

  </form>
);

const LoginStaff = ({ setUser }) => {
  const [workerId, setWorkerId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBgLoaded, setIsBgLoaded] = useState(false);

  const navigate = useNavigate();

  // Efficiency: Preload background image for mobile
  useEffect(() => {
    const img = new Image();
    img.src = Startpage;
    img.onload = () => setIsBgLoaded(true);
  }, []);

// const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

    
//    console.log("📡 Attempting staff login for:", workerId);

//     try {
//         const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             // We map 'workerId' from React to 'identifier' for the Backend
//          body: JSON.stringify({workerId,password})
//         });

//         const data = await response.json();

//         if (response.ok) {
//             console.log("✅ Staff Login Successful!", data.user);
//             localStorage.setItem('token', data.token);
            
//             // Redirect based on role from DB
//             if (data.user.role === 'head_asha') {
//                 navigate('/head-asha-dashboard');
//             } else {
//                 navigate('/asha-dashboard');
//             }
//         } else {
//             console.error("❌ Login Failed:", data.msg);
//             alert(data.msg);
//         }
//     } catch (err) {
//         console.error("🌐 Connection Error:", err);
//     }
//     setLoading(false);
// };

const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("🚀 Login process started...");

    try {
        const response = await fetch(`${API}/api/auth/staff-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({
            workerId: workerId,
            password: password
})
        });

        console.log("📡 Server responded with status:", response.status);
        const data = await response.json();

        if (response.ok) {
            console.log("✅ Success:", data);
            localStorage.setItem('user', JSON.stringify({
                token: data.token,
                role: data.user.role,
                name: data.user.name
            }));
            if (setUser) setUser(data.user);
            navigate(data.user.role === 'head_asha' ? '/admin-dashboard' : '/asha-dashboard');
        } else {
            alert(data.message || "Login Failed");
        }
    } catch (err) {
        console.error("❌ Network Error:", err);
        alert("Connection refused! Is your backend actually running on port 5001?");
    } finally {
        // This runs no matter what, so the button stops spinning
        setLoading(false); 
    }
};


  return (
    <div className="min-h-screen w-full flex bg-gray-50 font-sans">
      
      {/* ---------------- MOBILE LAYOUT ---------------- */}
      <div className="md:hidden w-full min-h-screen flex items-end relative overflow-hidden bg-blue-900">
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${isBgLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ backgroundImage: `url(${Startpage})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-blue-950/40"></div>
        </div>

        <motion.div
          initial={{ y: "70%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 w-full h-[92vh] bg-white/85 rounded-t-[40px] shadow-2xl p-8"
        >
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8"></div>
          <div className="text-center mb-6">
            <img src={Logo} className="w-16 mx-auto mb-2" alt="logo" loading="eager" />
            <h1 className="text-xl font-bold text-blue-900 tracking-tight uppercase">Staff Portal</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1 text-center">Authorized Access</h2>
          <p className="text-gray-400 text-xs mb-8 text-center uppercase tracking-widest">ASHA & Admin Login</p>

          <LoginForm
           handleLogin={handleLogin}
           workerId={workerId}
           setWorkerId={setWorkerId}
           password={password}
           setPassword={setPassword}
          loading={loading}/>

          <p className="mt-8 text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Secured by JeevanVriksha  v2.0.1
          </p>
        </motion.div>
      </div>

      {/* ---------------- DESKTOP LAYOUT ---------------- */}
      <div className="hidden md:flex w-full">
        
      <div className="relative flex w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-sky-100">

  {/* Ambient background glow */}
  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,197,253,0.22),transparent_65%)]" />

  {/* Original animated circles */}
  <motion.div
    animate={{ scale: [1, 1.1, 1], x: [0, 12, 0], y: [0, -10, 0] }}
    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    className="absolute h-72 w-72 rounded-full bg-blue-200/30 blur-[1px]"
  />

  <motion.div
    animate={{ scale: [1.1, 1, 1.1], x: [0, -15, 0], y: [0, 12, 0] }}
    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    className="absolute h-96 w-96 rounded-full bg-blue-300/20"
  />

  {/* Large soft outer ring */}
  <motion.div
    animate={{ scale: [1, 1.04, 1], opacity: [0.25, 0.45, 0.25] }}
    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    className="absolute h-[30rem] w-[30rem] rounded-full border border-blue-300/30"
  />

  {/* Inner decorative ring */}
  <div className="pointer-events-none absolute h-[22rem] w-[22rem] rounded-full border border-dashed border-blue-300/25" />

  {/* Floating particles */}
  {[
    { x: "-145px", y: "-115px", delay: 0 },
    { x: "145px", y: "-90px", delay: 0.8 },
    { x: "-125px", y: "115px", delay: 1.4 },
    { x: "155px", y: "115px", delay: 0.5 },
    { x: "0px", y: "-180px", delay: 1.8 },
  ].map((particle, index) => (
    <motion.span
      key={index}
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.25, 0.8, 0.25],
        y: [0, -8, 0],
      }}
      transition={{
        duration: 3 + index * 0.4,
        repeat: Infinity,
        delay: particle.delay,
        ease: "easeInOut",
      }}
      style={{
        left: `calc(50% + ${particle.x})`,
        top: `calc(50% + ${particle.y})`,
      }}
      className="absolute h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_14px_rgba(56,189,248,0.55)]"
    />
  ))}

  {/* Main content */}
  <div className="relative z-10 flex flex-col items-center px-10 text-center">

    {/* Logo glow */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="relative mb-7 flex h-36 w-36 items-center justify-center"
    >
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-blue-300/40 blur-2xl"
      />

      <motion.img
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        src={Logo}
        alt="JeevanVriksha logo"
        className="relative z-10 h-100 w-100 object-contain drop-shadow-[0_8px_16px_rgba(30,64,175,0.15)]"
      />
    </motion.div>

    {/* Brand name */}
    <motion.h2
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="text-4xl font-bold tracking-tight text-blue-950"
    >
      JeevanVriksha
    </motion.h2>

    {/* Accent divider */}
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 64, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="mt-4 h-1 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"
    />

    {/* Subtitle */}
    {/* <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="mt-4 text-base font-medium tracking-wide text-blue-800/65"
    >
      Smarter Fieldwork. Better Health Outcomes
    </motion.p> */}
  </div>

  {/* Bottom decorative accent */}
  <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-200 via-sky-400/60 to-blue-200" />

  {/* Corner accents */}
  <div className="pointer-events-none absolute left-8 top-8 h-12 w-12 rounded-tl-2xl border-l border-t border-blue-300/40" />
  <div className="pointer-events-none absolute bottom-8 right-8 h-12 w-12 rounded-br-2xl border-b border-r border-blue-300/40" />

    </ div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="flex w-1/2 items-center justify-center p-12
        bg-gradient-to-br from-blue-50 via-white to-sky-100">

<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,197,253,0.22),transparent_65%)]" />

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-10">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">ASHA & ADMIN Sign In</h2>
              <p className="text-gray-500 mt-2 font-medium">Please enter your government-issued ID to continue.</p>
            </div>
            
            <LoginForm
            handleLogin={handleLogin}
            workerId={workerId}
            setWorkerId={setWorkerId}
            password={password}
            setPassword={setPassword}
             loading={loading}
            />

            <div className="mt-16 pt-6 border-t border-gray-100 flex justify-between items-center opacity-50">
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">Secured by JeevanVriksha</span>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">v2.0.1</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginStaff;