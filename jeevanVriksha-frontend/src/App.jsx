import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { UIProvider } from "./context/UIContext";

// Public Pages
import Start from "./Pages/Start";
import LoginPatient from "./Login/LoginPatient";
import LoginStaff from "./Login/LoginStaff";
import SignupPatient from "./Login/SignupPatient";            

// Dashboards
import AshaDashboard from "./Dashboards/AshaDashboard"
import PatientDashboard from "./Dashboards/PatientDashboard"
import AdminDashboard from "./Dashboards/AdminDashboard"

import PatientList from "./Pages/patients-Asha/PatientList";
import PatientProfile from "./Pages/patients-Asha/PatientProfile";

import QRScanner from "./Pages/QRScanner"
import HealthCard from "./Pages/HealthCard";

import PregnancyDashboard from "./Pages/pregnancy/PregnancyDashboard"
import NewbornDashboard from "./Pages/newborn/NewbornDashboard"
import CreatePatient from "./Pages/CreatePatient"
import Alerts from "./Pages/Alerts"
import TodoPage from "./Pages/TodoPage"


// ---- offline sync 
import { syncVitals } from "./services/vitalsService";
import { syncPatients } from "./services/syncPatients";

//  Queue offline
import { syncQueue } from "./services/queueSyncService";

import { syncMedicineQueue } from "./services/syncMedicineQueue";

// Protected Route Wrapper
const ProtectedRoute = ({ user, role, children }) => {

  const storedUser = user || JSON.parse(localStorage.getItem("user"));
  if (!storedUser) return <Navigate to="/" />;
  if (role && storedUser.role !== role) return <Navigate to="/" />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [online, setOnline] = useState(navigator.onLine);

  // --------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // -------
useEffect(() => {

  const handleOnline = () => {

    console.log("Internet restored. Syncing medicine queue...");

    syncMedicineQueue();

  };

  window.addEventListener("online", handleOnline);

  return () => {
    window.removeEventListener("online", handleOnline);
  };

}, []);

// --------
useEffect(() => {

  const handleOnline = () => {
    syncVitals();
    syncPatients();
    syncQueue();
    syncMedicineQueue();
  };

  window.addEventListener("online", handleOnline);

  return () => {
    window.removeEventListener("online", handleOnline);
  };

}, []);

// --------
useEffect(() => {

  const goOnline = () => setOnline(true);
  const goOffline = () => setOnline(false);

  window.addEventListener("online", goOnline);
  window.addEventListener("offline", goOffline);

  return () => {
    window.removeEventListener("online", goOnline);
    window.removeEventListener("offline", goOffline);
  };

}, []);

  return (
    <>
    {!online && (
  <div className="bg-red-500 text-white text-center p-2">
    Offline Mode — Data will sync automatically
  </div>
)}
    <UIProvider>
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Start />} />
        <Route path="/loginUser" element={<LoginPatient setUser={setUser} />} />
        <Route path="/loginStaff" element={<LoginStaff setUser={setUser} />} />
        <Route path="/signup-patient" element={<SignupPatient />} />

        {/* Patient Dashboard */}
       <Route
  path="/patient-dashboard/:id"
  element={
    <ProtectedRoute user={user} role="patient">
      <PatientDashboard />
    </ProtectedRoute>
  }
/>

        {/* ASHA Dashboard */}
        <Route
          path="/asha-dashboard"
          element={
            <ProtectedRoute user={user} role="asha">
              <AshaDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute user={user} role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      {/* <Route path="/patient/dashboard/:id" element={<PatientDashboard/>}/> */}
        <Route path="/patients" element={<PatientList />} />
        <Route path="/patients/:id" element={<PatientProfile />} />

        <Route path="/scan" element={<QRScanner />} />
        <Route path="/health-card/:id" element={<HealthCard />} />

        <Route path="/pregnancy/:id" element={<PregnancyDashboard/>}/>
        <Route path="/newborn/:id" element={<NewbornDashboard/>}/>  

        <Route path="/create-patient" element={<CreatePatient/>}/>  
        <Route path="/alerts" element={<Alerts/>}/>

        <Route path="/todo" element={<TodoPage />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
    </UIProvider>
    </>
  );
}

export default App;