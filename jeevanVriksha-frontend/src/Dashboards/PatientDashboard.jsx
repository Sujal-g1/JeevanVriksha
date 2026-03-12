import React, { useEffect, useState } from "react";
import axios from "axios";

import PatientSidebar from "../components/patientDashboardData/PatientSidebar";
import OverviewCard from "../components/patientDashboardData/OverviewCard";
import HealthSummary from "../components/patientDashboardData/HealthSummary";
import VaccinationPanel from "../components/patientDashboardData/VaccinationPanel";
import MedicalTimeline from "../components/patientDashboardData/MedicalTimeline";
import HealthChart from "../components/patientDashboardData/HealthChart";
import AlertsPanel from "../components/patientDashboardData/AlertsPanel";

import { Menu, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const PatientDashboard = () => {

  const [profile, setProfile] = useState({});
  const [vitals, setVitals] = useState({});
  const [vaccines, setVaccines] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const user = JSON.parse(localStorage.getItem("user"));
        console.log("USER:",user);
        if(!user) return;

        const res = await axios.get(
          `${API}/api/patient/dashboard-data`,
          {
            headers:{
              Authorization:`Bearer ${user.token}`
            }
          }
        );

        const data = res.data;

        setProfile(data.profile || {});
        setVitals(data.vitals || {});
        setVaccines(data.vaccinations || []);

        const events = [];

        if(data.vitals){
          events.push({
            type:"vital",
            label:`Vitals recorded (BP ${data.vitals.bloodPressure})`,
            date:data.vitals.createdAt
          });
        }

        data.vaccinations?.forEach(v=>{
          events.push({
            type:"vaccine",
            label:`Vaccine: ${v.vaccineName}`,
            date:v.dueDate
          })
        });

        setTimeline(
          events.sort((a,b)=> new Date(b.date) - new Date(a.date))
        );

      } catch(err){
        console.error("Dashboard fetch error:",err);
      } finally{
        setLoading(false);
      }

    };

    fetchDashboard();

  },[]);


  return (

    <div className="flex min-h-screen bg-slate-50">

      {/* SIDEBAR */}

      <div className={`fixed lg:relative z-40 ${sidebarOpen ? "block" : "hidden"} lg:block`}>
        <PatientSidebar/>
      </div>

      {/* OVERLAY MOBILE */}

      {sidebarOpen && (
        <div
          onClick={()=>setSidebarOpen(false)}
          className="fixed inset-0 bg-black/30 lg:hidden"
        />
      )}

      {/* MAIN AREA */}

      <div className="flex-1 flex flex-col">

        {/* HEADER */}

        <header className="bg-white border-b px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <button
              className="lg:hidden"
              onClick={()=>setSidebarOpen(!sidebarOpen)}
            >
              <Menu/>
            </button>

            <h1 className="text-xl font-bold">
              Health Dashboard
            </h1>

          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin"/>
              Syncing...
            </div>
          )}

        </header>

        {/* CONTENT */}

        <div className="p-6 space-y-6">

          {/* PROFILE */}

          <OverviewCard profile={profile}/>

          {/* HEALTH STATS */}

          <HealthSummary vitals={vitals}/>

          {/* GRID SECTION */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CHART */}

            <div className="lg:col-span-2">
              <HealthChart vitals={vitals}/>
            </div>

            {/* ALERTS */}

            <AlertsPanel vaccines={vaccines}/>

          </div>

          {/* VACCINATION */}

          <VaccinationPanel vaccines={vaccines}/>

          {/* MEDICAL TIMELINE */}

          <MedicalTimeline events={timeline}/>

        </div>

      </div>

    </div>

  );

};

export default PatientDashboard;