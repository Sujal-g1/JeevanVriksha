import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Bell, Baby, Syringe, Activity, Target, Loader2 ,ChevronDown} from "lucide-react";

import StatsCard from "../components/StatsCard";
import AlertPanel from "../components/AlertPanel";
import AshaNavbar from "../components/AshaNavbar";
import ActivityFeed from "../components/ActivityFeed";
import TodoPage from "../Pages/TodoPage"

const API = import.meta.env.VITE_API_URL;

const AshaDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
  patients: 0,
  pregnant: 0,
  highRisk: 0,
  newborns: 0,
  vaccineDue: 0,
  visitsToday: 0
});
  const [activity, setActivity] = useState([]);
  const [alerts,setAlerts] = useState([]);
  const [isMedicineExpanded, setIsMedicineExpanded] = useState(false);

  // ----- tasks
  const [tasks, setTasks] = useState([]);
  const [expandedTask, setExpandedTask] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  // todo
const [showTodo,setShowTodo] = useState(false)
const [todoText,setTodoText] = useState("")

//medicine
const [medicineStock, setMedicineStock] = useState([])

  // reminder
  const sendReminder = async (task) => {

  try {
    await fetch(`${API}/api/reminders/send`,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        patientId:task.patientId?._id,
        message:`Reminder for ${task.taskType}`
      })
    })

    alert("Reminder sent")

  } catch(err){
    console.error(err)
  }

}

// fetch tasks
const fetchTasks = async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    const res = await fetch(`{API}/api/tasks/today`, {
      headers: {
        Authorization: `Bearer ${user.token}`
      }
    });

    const data = await res.json();
    setTasks(data);

  } catch (err) {
    console.error(err);
  }
};

// medicine fetch
const fetchMedicineStock = async () => {

  try {

    const user = JSON.parse(localStorage.getItem("user"))

    const res = await fetch(`${API}/api/medicine/my-stock`,{
      headers:{
        Authorization:`Bearer ${user.token}`
      }
    })

    const data = await res.json()
console.log("Medicine API response:", data)
    setMedicineStock(data)

  } catch(err){

    console.log("Medicine stock error",err)

  }

}

// task completion or reminder comp.
const markComplete = async (taskId) => {

  try {

    await fetch(`${API}/api/tasks/${taskId}`,{
      method:"PATCH",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        status:"completed"
      })
    })

    // setTasks(prev => prev.filter(t => t._id !== taskId))
    fetchTasks()
    setShowConfirm(null)

  } catch(err){
    console.error(err)
  }

}

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Optimization: Fetch with a timeout for low-bandwidth scenarios
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const user = JSON.parse(localStorage.getItem("user"))

      const [sRes, aRes, alertRes , taskRes] = await Promise.all([
  fetch(`${API}/api/dashboard/stats`,{
    headers:{
      Authorization:`Bearer ${user.token}`
    }
  }),

  fetch(`${API}/api/activity`,{
    headers:{
      Authorization:`Bearer ${user.token}`
    }
  }),

  fetch(`${API}/api/alerts`,{
    headers:{
      Authorization:`Bearer ${user.token}`
    }
  }),
  fetch(`${API}/api/tasks/today`,{
    headers:{ Authorization:`Bearer ${user.token}` }
  })
])
await fetchMedicineStock()
        
        clearTimeout(timeoutId);
       const data = await sRes.json();

setStats({
  patients: data.patients || 0,
  pregnant: data.pregnancy || 0,
  highRisk: data.highRisk || 0,
  newborns: data.newborns || 0,
  vaccineDue: data.vaccines || 0,
  visitsToday: data.visits || 0
});
        setActivity(await aRes.json());
        setAlerts(await alertRes.json());
        setTasks(await taskRes.json());
      } catch (e) {
        console.error("Connection slow or offline:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { title: "Patients", path: "/patients", icon: <Users size={18} />, color: "bg-emerald-600" },
    { title: "Register", path: "/create-patient", icon: <UserPlus size={18} />, color: "bg-blue-600" },
    { title: "Alerts", path: "/alerts", icon: <Bell size={18} />, color: "bg-rose-600" },
  ];

  return (
    <div className="min-h-screen bg-[#064a8f] bg-gradient-to-b from-[#064a8f] to-[#1259a1]">
      <AshaNavbar />

      <main className="pt-20 pb-10 px-4 max-w-6xl mx-auto">
        {/* HEADER WITH SLOW-INTERNET INDICATOR */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-white">Daily <span className="text-pink-400">Overview</span></h1>
            <p className="text-blue-200 text-xs font-medium">Real-time health tracking</p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-blue-200 text-[10px] font-bold uppercase animate-pulse">
              <Loader2 size={12} className="animate-spin" /> Syncing...
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="flex items-center justify-center md:justify-start gap-3 bg-white/10 hover:bg-white/20 border border-white/10 p-2.5 rounded-xl transition-all active:scale-95"
            >
              <div className={`${action.color} text-white p-2 rounded-lg shadow-lg`}>{action.icon}</div>
              <span className="hidden md:block text-[11px] font-bold text-white uppercase tracking-wider">{action.title}</span>
            </button>
          ))}
        </motion.div>

        {/* STATS - WITH SKELETON LOADING STATE */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
         <StatsCard label="Total Patients" value={stats.patients} icon={<Users size={16}/>} />
        <StatsCard label="Pregnant Women" value={stats.pregnant} icon={<Baby size={16}/>} />
        <StatsCard label="High Risk Cases" value={stats.highRisk} icon={<Bell size={16}/>} color="text-red-500"/>
        <StatsCard label="Newborns" value={stats.newborns} icon={<Baby size={16}/>} />
        <StatsCard label="Vaccination Due" value={stats.vaccineDue} icon={<Syringe size={16}/>} />    
        <StatsCard label="Visits Today" value={stats.visitsToday} icon={<Activity size={16}/>} />
      </div>

      {/* MEDICINE STOCK DROPDOWN */}
<div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-all duration-300">
  
  {/* Trigger Header */}
  <button 
    onClick={() => setIsMedicineExpanded(!isMedicineExpanded)}
    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center gap-2">
      <Activity size={18} className="text-blue-600"/>
      <h3 className="font-bold text-lg text-gray-800">
        Medicine Stock
      </h3>
    </div>
    
    <div className={`transition-transform duration-300 ${isMedicineExpanded ? 'rotate-180' : ''}`}>
      <ChevronDown size={20} className="text-gray-400" />
    </div>
  </button>

  {/* Expandable Content */}
  <div 
    className={`px-6 transition-all duration-300 ease-in-out overflow-hidden ${
      isMedicineExpanded ? 'max-h-[1000px] pb-6 opacity-100' : 'max-h-0 opacity-0'
    }`}
  >
    <div className="space-y-3 pt-2">
      {medicineStock.length === 0 ? (
        <p className="text-gray-400 text-sm italic">
          No medicines available
        </p>
      ) : (
        medicineStock.map(stock => (
          <div
            key={stock._id}
            // Logic to close dropdown when a specific item is clicked, if desired:
            // onClick={() => setIsMedicineExpanded(false)}
            className="flex justify-between items-center border border-gray-100 p-3 rounded-xl hover:border-blue-100 hover:bg-blue-50/30 transition-all"
          >
            <div>
              <p className="font-semibold text-sm text-gray-700">
                {stock.medicineId?.name}
              </p>
              <p className="text-xs text-gray-400">
                {stock.medicineId?.dosage}
              </p>
            </div>

            <div className="text-right">
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {stock.quantity}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</div>


      {/* TASKS SECTION */}

              {/* <div className="bg-white rounded-2xl shadow-xl p-5 mb-6">

<div className="flex justify-between items-center mb-4">

<h3 className="font-bold text-lg">Today's Tasks</h3>

          <button
onClick={()=>navigate("/todo")}
className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg"
>
+ Todo
</button>

</div>

<div className="space-y-3">

{tasks.length === 0 && (
<div className="text-gray-400 text-sm">
No tasks for today 🎉
</div>
)}

{tasks.map(task => (

<div
key={task._id}
className="border rounded-xl p-3 hover:bg-gray-50 transition"
>

<button
onClick={()=>setExpandedTask(expandedTask===task._id ? null : task._id)}
className="w-full flex justify-between items-center"
>

<div className="text-left">

<div className="font-semibold text-sm">
{task.taskType.toUpperCase()}
</div>

<div className="text-xs text-gray-500">
{task.patientId?.name}
</div>

</div>

<div className="text-gray-400 text-xs">
{expandedTask===task._id ? "▲" : "▼"}
</div>

</button>

{expandedTask===task._id && (

<div className="mt-3 border-t pt-3 flex gap-2">

<button
onClick={()=>sendReminder(task)}
className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-3 py-1 rounded"
>
Send Reminder
</button>

<button
onClick={()=>setShowConfirm(task._id)}
className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded"
>
Complete
</button>

</div>

)}

{showConfirm===task._id && (

<div className="mt-3 bg-gray-100 p-2 rounded text-xs flex justify-between">

<span>Mark task complete?</span>

<div className="flex gap-2">

<button
onClick={()=>setShowConfirm(null)}
className="bg-gray-300 px-2 py-1 rounded"
>
Cancel
</button>

<button
onClick={()=>markComplete(task._id)}
className="bg-green-600 text-white px-2 py-1 rounded"
>
Confirm
</button>

</div>

</div>

)}

</div>

))}

</div>

</div> */}

<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
  {/* Header Section */}
  <div className="flex justify-between items-center mb-6">
    <div>
      <h3 className="font-extrabold text-xl text-gray-800 tracking-tight">Today's Tasks</h3>
      <p className="text-xs text-gray-500 mt-1">{tasks.length} tasks remaining</p>
    </div>
    <button
      onClick={() => navigate("/todo")}
      className="bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
    >
      <span className="text-lg leading-none">+</span> New Task
    </button>
  </div>

  <div className="space-y-4">
    {/* Empty State */}
    {tasks.length === 0 && (
      <div className="py-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
        <div className="text-3xl mb-2">🎉</div>
        <div className="text-gray-500 font-medium">All caught up!</div>
        <div className="text-gray-400 text-xs">No tasks for today.</div>
      </div>
    )}

    {/* Task List */}
    {tasks.map((task) => (
      <div
        key={task._id}
        className={`group border rounded-2xl transition-all duration-200 ${
          expandedTask === task._id 
            ? "border-blue-200 shadow-md ring-4 ring-blue-50" 
            : "border-gray-100 hover:border-blue-200 hover:shadow-sm"
        }`}
      >
        <button
          onClick={() => setExpandedTask(expandedTask === task._id ? null : task._id)}
          className="w-full flex justify-between items-center p-4"
        >
          <div className="flex items-center gap-4 text-left">
            {/* Status Indicator Dot */}
            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-gray-700">
                  {task.taskType.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-500 rounded-md uppercase tracking-wider">
                  Pending
                </span>
              </div>
              <div className="text-xs font-medium text-gray-400 flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {task.patientId?.name || "No Patient Linked"}
              </div>
            </div>
          </div>

          <div className={`transition-transform duration-200 ${expandedTask === task._id ? "rotate-180" : ""}`}>
            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {/* Expanded Actions */}
        {expandedTask === task._id && (
          <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="border-t border-gray-50 pt-4 flex gap-3">
              <button
                onClick={() => sendReminder(task)}
                className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs py-2.5 rounded-xl transition"
              >
                🔔 Send Reminder
              </button>
              <button
                onClick={() => setShowConfirm(task._id)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-sm transition"
              >
                ✓ Complete
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Overlay-style UI */}
        {showConfirm === task._id && (
          <div className="m-3 p-3 bg-green-50 border border-green-100 rounded-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-green-800 font-bold text-xs">Mark as finished?</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="bg-white border border-green-200 text-green-700 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                >
                  No
                </button>
                <button
                  onClick={() => markComplete(task._id)}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold shadow-sm"
                >
                  Yes, Complete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    ))}
  </div>
</div>



        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8 space-y-5">
            {/* Conditional Rendering for data panels */}
            {/* <div className={`bg-white rounded-2xl overflow-hidden shadow-xl transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
             <AlertPanel alerts={alerts.slice(0,5)} />
            </div> */}
            <div className={`bg-white rounded-2xl overflow-hidden shadow-xl transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              <ActivityFeed activity={activity} />
            </div>
          </div>

          {/* TARGET CARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-4"
          >
            <div className="bg-emerald-600 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} />
                  <h3 className="font-bold text-sm">Monthly Progress</h3>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-[10px] font-black mb-1.5 opacity-80 uppercase tracking-widest">
                  <span>Progress</span>
                  <span>65%</span>
                </div>
                  <div className="w-full bg-black/20 h-2 rounded-full overflow-hidden ">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: "65%" }} 
                      transition={{ duration: 2 }}
                      className="h-full bg-white rounded-full" 
                    />
                  </div>

                    <div className="text-[11px] font-medium text-emerald-100 mb-5 mt-2">
             ..
              </div>
                </div>
                <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold py-2.5 rounded-xl text-xs transition-all border border-white/20">
                  Generate Report
                </button>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            </div>
          </motion.div>

         
          
        </div>
      </main>
    </div>
  );
};

export default AshaDashboard;