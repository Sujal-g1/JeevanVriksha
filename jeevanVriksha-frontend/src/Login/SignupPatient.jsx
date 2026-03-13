import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/logo.png";
import Startpage from "../assets/startpage.png";

const API = import.meta.env.VITE_API_URL;

const SignupForm = ({
  handleSignup,
  name,
  setName,
  phone,
  setPhone,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading
}) => (

  <form onSubmit={handleSignup} className="space-y-4">

    <div>
      <label className="text-sm text-gray-600 font-medium">
        Full Name
      </label>

      <input
        required
        value={name}
        onChange={(e)=>setName(e.target.value)}
        placeholder="Enter your name"
        className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    <div>
      <label className="text-sm text-gray-600 font-medium">
        Mobile Number
      </label>

      <input
        required
        value={phone}
        onChange={(e)=>setPhone(e.target.value)}
        placeholder="9999999999"
        className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    <div>
      <label className="text-sm text-gray-600 font-medium">
        Password
      </label>

      <input
        type="password"
        required
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        placeholder="••••••••"
        className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    <div>
      <label className="text-sm text-gray-600 font-medium">
        Confirm Password
      </label>

      <input
        type="password"
        required
        value={confirmPassword}
        onChange={(e)=>setConfirmPassword(e.target.value)}
        placeholder="••••••••"
        className="w-full mt-1 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
      />
    </div>

    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={loading}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-md"
    >
      {loading ? "Creating Account..." : "Create Account"}
    </motion.button>

  </form>
);


const SignupPatient = () => {

  const [name,setName] = useState("");
  const [phone,setPhone] = useState("");
  const [password,setPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [loading,setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if(password !== confirmPassword){
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    try{

      const res = await fetch(`${API}/api/auth/signup`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          name,
          phone,
          password
        })
      });

      const data = await res.json();

      if(res.ok){
        alert("Account created successfully");
        navigate("/loginUser");
      }else{
        alert(data.message || "Signup failed");
      }

    }catch(err){
      console.error(err);
      alert("Server connection failed");
    }

    setLoading(false);
  };


  


  return (

    <div className="min-h-screen flex bg-gray-50">

      {/* MOBILE */}
      <div className="md:hidden w-full flex items-end relative overflow-hidden">
         <div className="absolute inset-0 bg-green-900" style={{ backgroundImage: `url(${Startpage})`, backgroundSize: "cover", backgroundPosition: "center" }}>
         <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* <div className="absolute inset-0 bg-gradient-to-br from-green-700 to-green-900" /> */}

        <motion.div
          initial={{ y:"70%" }}
          animate={{ y:0 }}
          transition={{ duration:1 }}
          className="relative w-full h-[92vh] bg-[#f8fff4e1] rounded-t-[40px] shadow-2xl p-8 overflow-y-auto"
        >

          <div className="text-center mb-6">
            <img src={Logo} className="w-20 mx-auto mb-2" alt="logo"/>
            <h1 className="text-xl font-bold text-green-900">JeevanVriksha</h1>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">Create Account</h2>
          <p className="text-gray-500 text-sm mb-6">
            Register to access your health records
          </p>

          <SignupForm
  handleSignup={handleSignup}
  name={name}
  setName={setName}
  phone={phone}
  setPhone={setPhone}
  password={password}
  setPassword={setPassword}
  confirmPassword={confirmPassword}
  setConfirmPassword={setConfirmPassword}
  loading={loading}
/>
          <p className="text-center text-sm mt-6">
            Already have an account?
            <span
              onClick={()=>navigate("/loginUser")}
              className="text-green-700 font-semibold ml-1 cursor-pointer"
            >
              Sign In
            </span>
          </p>

        </motion.div>

      </div>


      {/* DESKTOP */}
    <div className="hidden md:flex w-full">

  {/* LEFT SIDE BRAND PANEL */}
  <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800 relative overflow-hidden text-white">

    {/* Floating shapes */}
    <motion.div
      animate={{ scale: [1,1.1,1] }}
      transition={{ duration:8, repeat:Infinity }}
      className="absolute w-96 h-96 bg-white opacity-10 rounded-full"
    />

    <motion.div
      animate={{ scale: [1.1,1,1.1] }}
      transition={{ duration:10, repeat:Infinity }}
      className="absolute w-72 h-72 bg-white opacity-10 rounded-full"
    />

    <div className="relative text-center px-10 z-10">

      <img src={Logo} className="w-32 mx-auto mb-6 drop-shadow-lg" />

      <h2 className="text-4xl font-bold tracking-tight">
        Join JeevanVriksha
      </h2>

      <p className="mt-4 text-green-100 text-lg">
        Your Digital Health Companion
      </p>

      {/* <p className="mt-2 text-green-200 text-sm max-w-sm mx-auto">
        Securely access prescriptions, vaccination records,
        and vital health data anytime.
      </p> */}

    </div>

  </div>


  {/* RIGHT SIDE SIGNUP CARD */}
  <div className="w-1/2 flex items-center justify-center p-12 bg-gray-50">

    <motion.div
      initial={{ opacity:0, x:20 }}
      animate={{ opacity:1, x:0 }}
      transition={{ duration:0.5 }}
      className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10 border border-gray-100"
    >

      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        Create Account
      </h2>

      <p className="text-gray-500 text-sm mb-8">
        Register to access your personal health dashboard
      </p>

       <SignupForm
  handleSignup={handleSignup}
  name={name}
  setName={setName}
  phone={phone}
  setPhone={setPhone}
  password={password}
  setPassword={setPassword}
  confirmPassword={confirmPassword}
  setConfirmPassword={setConfirmPassword}
  loading={loading}
/>

      <p className="text-center text-sm mt-6">
        Already have an account?
        <span
          onClick={()=>navigate("/loginUser")}
          className="text-green-700 font-semibold ml-1 cursor-pointer hover:underline"
        >
          Sign In
        </span>
      </p>

    </motion.div>

  </div>

</div>

    </div>

  );

};

export default SignupPatient;