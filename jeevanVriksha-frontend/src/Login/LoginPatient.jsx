import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/logo.png";
import Startpage from "../assets/startpage.png";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { jwtDecode } from "jwt-decode";

const LoginForm = ({ handleLogin, identifier, setIdentifier, password, setPassword, loading }) => (
  <form onSubmit={handleLogin} className="space-y-4">
    
    <div>
      <label className="text-sm text-gray-600 font-medium">
        Mobile Number / मोबाइल नंबर
      </label>

      <input
        type="tel"
        required
        value={identifier}
        placeholder="9999999999"
        onChange={(e) => setIdentifier(e.target.value)}
        className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
      />
    </div>

    <div>
      <label className="text-sm text-gray-600 font-medium">
        Password / पासवर्ड
      </label>

      <input
        type="password"
        required
        value={password}
        placeholder="••••••••"
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition-all"
      />
    </div>

    <motion.button
      whileTap={{ scale: 0.97 }}
      type="submit"
      disabled={loading}
      className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-lg font-bold shadow-lg"
    >
      {loading ? "Authenticating..." : "Sign In"}
    </motion.button>

  </form>
);


const API = import.meta.env.VITE_API_URL;

const LoginPatient = ({ setUser }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);

  console.log("📡 Attempting patient login:", identifier);

  try {

    const response = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        phone: identifier,
        password
      })
    });

    const data = await response.json();
    console.log("LOGIN RESPONSE:", data);

    if (response.ok) {

      console.log("✅ Login Successful!");

const decoded = jwtDecode(data.token);

const userData = {
  id: decoded.id || decoded._id,
  role: decoded.role,
  token: data.token
};

localStorage.setItem("user", JSON.stringify(userData));
setUser(userData);

      // redirect
      navigate(`/patient-dashboard/${userData.id}`);

    } else {
      alert(data.message || data.msg || "Login failed");
    }

  } catch (err) {
    console.error("🌐 Connection Error:", err);
    alert("Server connection failed");
  }

  setLoading(false);
};

const handleGoogleLogin = async () => {

  const result = await signInWithPopup(auth, provider);

  const token = await result.user.getIdToken();

  const response = await fetch(`${API}/api/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token })
  });

  const data = await response.json();

  if (response.ok) {

    // store user
    const userData = {
      role: data.role,
      token: data.token
    };

    localStorage.setItem("user", JSON.stringify(userData));

    // update state
    setUser(userData);

    // redirect
    navigate("/patient-dashboard");

  }
};

 

  return (
    <div className="min-h-screen w-full flex bg-gray-50 font-sans">
      
      {/* ---------------- MOBILE LAYOUT (UNCHANGED) ---------------- */}
      <div className="md:hidden w-full min-h-screen flex items-end relative overflow-hidden">
        <div className="absolute inset-0 bg-green-900" style={{ backgroundImage: `url(${Startpage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <motion.div
         initial={{ y: "70%" }} animate={{ y: 0 }} transition={{ duration: 1 }} className="relative w-full h-[92vh] bg-[#f8fff4e1] rounded-t-[40px] shadow-2xl p-8 overflow-y-auto">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
          <div className="text-center mb-6">
            <img src={Logo} className="w-20 mx-auto mb-2" alt="logo" loading="eager" />
            <h1 className="text-xl font-bold text-green-900">JevanVriksha</h1>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Sign In</h2>
          <p className="text-gray-500 text-sm mb-6">Enter your credentials to continue</p>

          

         <LoginForm
  handleLogin={handleLogin}
  identifier={identifier}
  setIdentifier={setIdentifier}
  password={password}
  setPassword={setPassword}
  loading={loading}
/>

<motion.button
  whileTap={{ scale: 0.98 }}
  onClick={handleGoogleLogin}
  type="button" // Always specify type="button" to prevent form submission
  className="w-full mt-4 flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
>
  <img 
    src="https://www.svgrepo.com/show/475656/google-color.svg" 
    alt="Google" 
    className="w-5 h-5 shrink-0" 
  />
  <span className="font-bold text-gray-700">
    Continue with Google
  </span>
</motion.button>

         <p className="text-center text-sm mt-6">
            Don't have an account? 
            <span
              onClick={() => navigate("/signup-patient")}
             className="text-green-700 font-semibold cursor-pointer ml-1" >
            Sign up
            </span>
            </p>

          <p className="mt-6 text-center text-xs text-gray-400">Low connectivity mode active 📶</p>
        </motion.div>
      </div>

      {/* ---------------- DESKTOP LAYOUT (FIXED & RESTORED) ---------------- */}
      <div className="hidden md:flex w-full">
        
        {/* LEFT SIDE BRANDING - Restored Circles */}
        <div className="w-1/2 items-center justify-center bg-green-100 relative overflow-hidden flex">
          
          {/* THE CIRCLES (Exactly as your original) */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute w-72 h-72 bg-green-300 rounded-full opacity-20"
          />

          <motion.div
            animate={{ scale: [1.1, 1, 1.1] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute w-96 h-96 bg-green-400 rounded-full opacity-10"
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
              className="text-4xl font-bold text-green-900 tracking-tighter"
            >
              JeevanVriksha
            </motion.h2>
            <p className="text-gray-600 mt-3 text-lg font-medium">Smart Rural Healthcare Platform</p>
          </div>
        </div>

        {/* RIGHT SIDE LOGIN CARD - Fixed Visibility */}
        <div className="flex w-1/2 items-center justify-center p-12 bg-white">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 border border-gray-50"
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-1">Sign In</h2>
            <p className="text-gray-500 text-sm mb-8 font-medium">Please enter your patient credentials</p>
            
            {/* The Form is now injected here */}
            <LoginForm
  handleLogin={handleLogin}
  identifier={identifier}
  setIdentifier={setIdentifier}
  password={password}
  setPassword={setPassword}
  loading={loading}
/>

<motion.button
  whileTap={{ scale: 0.98 }}
  onClick={handleGoogleLogin}
  type="button" // Always specify type="button" to prevent form submission
  className="w-full mt-4 flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
>
  <img 
    src="https://www.svgrepo.com/show/475656/google-color.svg" 
    alt="Google" 
    className="w-5 h-5 shrink-0" 
  />
  <span className="font-bold text-gray-700">
    Continue with Google
  </span>
</motion.button>

            <p className="text-center text-sm mt-6">
            Don't have an account? 
            <span
              onClick={() => navigate("/signup-patient")}
             className="text-green-700 font-semibold cursor-pointer ml-1" >
            Sign up
            </span>
            </p>

            

            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                Secure Patient Access
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPatient;