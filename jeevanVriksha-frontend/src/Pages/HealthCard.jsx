import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API = import.meta.env.VITE_API_URL;

const HealthCard = () => {

  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);

  useEffect(() => {

    fetch(`${API}/api/patients/${id}`)
      .then(res => res.json())
      .then(data => setPatient(data));

    fetch(`${API}/api/vitals/${id}`)
      .then(res => res.json())
      .then(data => setVitals(data));

  }, [id]);

  if (!patient) return <div>Loading...</div>;

  return (

    <div className="p-8">

      <h1 className="text-2xl font-bold">
        Digital Health Card
      </h1>

      <h2 className="mt-4 text-xl">{patient.name}</h2>

      <p>Village: {patient.village}</p>
      <p>Age: {patient.age}</p>
      <p>Blood Group: {patient.bloodGroup}</p>

      <h2 className="mt-6 font-semibold">
        Vitals History
      </h2>

      {vitals.map(v => (
        <div key={v._id}>
          BP: {v.bloodPressure} | Weight: {v.weight}
        </div>
      ))}

    </div>
  );
};

export default HealthCard;