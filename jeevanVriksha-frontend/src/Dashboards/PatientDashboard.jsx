import React, { useEffect, useState } from "react";
import axios from "axios";

import PatientSidebar from "../components/patientDashboardData/PatientSidebar";
import OverviewCard from "../components/patientDashboardData/OverviewCard";
import HealthSummary from "../components/patientDashboardData/HealthSummary";
import VaccinationPanel from "../components/patientDashboardData/VaccinationPanel";
import MedicalTimeline from "../components/patientDashboardData/MedicalTimeline";
import HealthChart from "../components/patientDashboardData/HealthChart";
import AlertsPanel from "../components/patientDashboardData/AlertsPanel";

import { Menu } from "lucide-react";

const PatientDashboard = () => {
  const [profile, setProfile] = useState({});
  const [vitals, setVitals] = useState({});
  const [vaccines, setVaccines] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        const res = await axios.get(
          "http://localhost:5001/api/patient/dashboard-data",
          {
            headers: { Authorization: `Bearer ${user?.token}` }
          }
        );

        const data = res.data;

        setProfile(data.profile || {});
        setVitals(data.vitals || {});
        setVaccines(data.vaccinations || []);

        const events = [];

        if (data.vitals) {
          events.push({
            type: "vital",
            label: `Vitals recorded (BP ${data.vitals.bloodPressure})`,
            date: data.vitals.createdAt
          });
        }

        data.vaccinations?.forEach(v =>
          events.push({
            type: "vaccine",
            label: `Vaccine: ${v.vaccineName}`,
            date: v.dueDate
          })
        );

        setTimeline(events.sort((a, b) => new Date(b.date) - new Date(a.date)));

      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* Sidebar */}
      <div className={`${sidebarOpen ? "block" : "hidden"} lg:block`}>
        <PatientSidebar />
      </div>

      <div className="flex-1 flex flex-col">

        {/* Header */}
        <header className="bg-white border-b px-6 py-4 flex items-center gap-4">
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu />
          </button>

          <h1 className="text-xl font-bold">
            Patient Dashboard
          </h1>
        </header>

        <div className="p-6 space-y-6">

          {/* Overview */}
          <OverviewCard profile={profile} />

          {/* Health summary */}
          <HealthSummary vitals={vitals} />

          {/* Analytics */}
          <HealthChart vitals={vitals} />

          {/* Vaccination */}
          <VaccinationPanel vaccines={vaccines} />

          {/* Alerts */}
          <AlertsPanel vaccines={vaccines} />

          {/* Timeline */}
          <MedicalTimeline events={timeline} />

        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;