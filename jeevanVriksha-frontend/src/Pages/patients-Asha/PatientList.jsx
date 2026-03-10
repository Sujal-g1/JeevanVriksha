import React, { useEffect, useState,useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, User, MapPin, Calendar, 
  ChevronRight, Filter, Loader2, ArrowLeft 
} from "lucide-react";
import AshaNavbar from "../../components/AshaNavbar";

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check local cache first for low-internet speed
    const cached = localStorage.getItem("cached_patients");
    if (cached) setPatients(JSON.parse(cached));

   const user = JSON.parse(localStorage.getItem("user"));

  fetch("http://localhost:5001/api/patientAsha", {
  headers: {
    Authorization: `Bearer ${user.token}`
  }
  })
      .then((res) => res.json())
      .then((data) => {
  console.log("PATIENT DATA:", data);

  const patientArray = Array.isArray(data) ? data : data.patients || [];

  setPatients(patientArray);
  localStorage.setItem("cached_patients", JSON.stringify(patientArray));
})
      .catch(err => console.error("Fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  // ------------------ Searching ---------
const filteredPatients = useMemo(() => {

  if (!Array.isArray(patients)) return [];

  const search = searchTerm.toLowerCase();

  return patients.filter((p) => {

    const name = p.name?.toLowerCase() || "";
    const village = p.village?.toLowerCase() || "";
    const phone = p.phone?.toString() || "";
    const id = p._id?.toString() || "";

    return (
      name.includes(search) ||
      village.includes(search) ||
      phone.includes(search) ||
      id.includes(search)
    );
  });

}, [patients, searchTerm]);

  return (
    <div className="min-h-screen bg-[#064a8f] bg-gradient-to-b from-[#064a8f] to-[#1259a1]">
      <AshaNavbar />

      <main className="pt-20 pb-10 px-4 max-w-6xl mx-auto">
        
        {/* HEADER & SEARCH AREA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-blue-200 text-xs font-bold mb-2 uppercase tracking-widest hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <h1 className="text-2xl font-black text-white flex items-center gap-3">
              Patient <span className="text-pink-400">Database</span>
              {loading && <Loader2 size={18} className="animate-spin text-blue-300" />}
            </h1>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by name, mobile or village..."
              className="w-full md:w-80 bg-white/10 border border-white/20 rounded-2xl py-2.5 pl-10 pr-4 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-pink-400/50 focus:bg-white/20 transition-all text-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* DATA CONTAINER */}
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-white/10">
          
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Name</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Village</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</th>
                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <AnimatePresence>
                  {filteredPatients.map((patient) => (
                    <motion.tr 
                      key={patient._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <User size={16} />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{patient.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                          <MapPin size={14} className="text-slate-300" />
                          {patient.village}
                        </div>
                      </td>
                      <td className="p-4 font-medium text-slate-600 text-sm">{patient.age} Yrs</td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => navigate(`/patients/${patient._id}`)}
                          className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-xl font-bold text-xs hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                        >
                          Details <ChevronRight size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* MOBILE LIST VIEW */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredPatients.map((patient) => (
              <div 
                key={patient._id} 
                className="p-4 active:bg-slate-50 flex items-center justify-between group"
                onClick={() => navigate(`/patients/${patient._id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{patient.name}</h3>
                    <p className="text-[11px] text-slate-400 font-medium">{patient.village} • {patient.age} Yrs</p>
                  </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-full text-slate-300 group-active:text-blue-500">
                  <ChevronRight size={18} />
                </div>
              </div>
            ))}
          </div>

          {/* EMPTY STATE */}
          {filteredPatients.length === 0 && !loading && (
            <div className="p-20 text-center">
              <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                <Search size={32} className="text-slate-300" />
              </div>
              <h3 className="font-bold text-slate-800">No patients found</h3>
              <p className="text-xs text-slate-400">Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PatientList;