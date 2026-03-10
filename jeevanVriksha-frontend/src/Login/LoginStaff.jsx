import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/logo.png";
import Startpage from "../assets/startpage.png";

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
        const response = await fetch("http://localhost:5001/api/auth/staff-login", {
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
            Encrypted Worker Terminal 📶
          </p>
        </motion.div>
      </div>

      {/* ---------------- DESKTOP LAYOUT ---------------- */}
      <div className="hidden md:flex w-full">
        
        {/* LEFT SIDE: BLUE BRANDING CIRCLES */}
        {/* <div className="w-1/2 items-center justify-center bg-blue-50 relative overflow-hidden flex border-r border-blue-100">
          
          <motion.div
            animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="absolute w-80 h-80 bg-blue-200 rounded-full opacity-30 blur-2xl"
          />

          <motion.div
            animate={{ scale: [1.1, 1, 1.1], rotate: [0, -10, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute w-[500px] h-[500px] bg-blue-300 rounded-full opacity-10 blur-3xl"
          />

          <div className="relative text-center px-10 z-10">
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              src={Logo}
              className="w-32 mx-auto mb-6  "
              alt="logo"
            />
            <motion.h2
              className="text-4xl font-black text-blue-900 tracking-tighter"
            >
              Jeevan<span className="text-blue-600">Vriksha</span>
            </motion.h2>
            <p className="text-blue-800/60 mt-4 text-lg font-medium max-w-xs mx-auto">
               Community Management System
            </p>
          </div>
        </div> */}
        
         <div className="w-1/2 items-center justify-center bg-blue-50 relative overflow-hidden flex">
                  
                  {/* THE CIRCLES (Exactly as your original) */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute w-72 h-72 bg-blue-200 rounded-full opacity-20"
                  />
        
                  <motion.div
                    animate={{ scale: [1.1, 1, 1.1] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute w-96 h-96 bg-blue-300 rounded-full opacity-10"
                  />
        
                  <div className="relative text-center px-10 z-10">
                    <motion.img
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      src={Logo}
                      className="w-36 mx-auto mb-6 drop-shadow-lg"
                      alt="logo"
                    />
                    <motion.h2
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-4xl font-bold text-blue-900 tracking-tighter"
                    >
                      JeevanVriksha
                    </motion.h2>
                    <p className="text-blue-800/60 mt-3 text-lg font-medium">Community Management System</p>
                  </div>
                </div>

        {/* RIGHT SIDE: LOGIN FORM */}
        <div className="flex w-1/2 items-center justify-center p-12 bg-white">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-10">
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Worker Sign In</h2>
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