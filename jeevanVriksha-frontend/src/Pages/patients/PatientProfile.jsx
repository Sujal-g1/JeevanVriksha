import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import { QRCodeCanvas } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const PatientProfile = () => {

  const { id } = useParams();

  const [patient, setPatient] = useState(null);
  const [vitals, setVitals] = useState([]);
  const [formData, setFormData] = useState({
  bloodPressure: "",
  weight: "",
  glucose: "",
  heartRate: "",
  notes: ""
});
const [vaccines, setVaccines] = useState([]);
const [showQR, setShowQR] = useState(false);

const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

// vaccine 
useEffect(() => {
fetch(`http://localhost:5001/api/vaccinations/${id}`)
  .then(res => res.json())
  .then(data => setVaccines(data));

}, [id]);

const downloadCard = async () => {

const card = document.getElementById("healthCard");

const canvas = await html2canvas(card);

const imgData = canvas.toDataURL("image/png");

const pdf = new jsPDF();

pdf.addImage(imgData, "PNG", 10, 10, 180, 100);

pdf.save(`${patient.name}_HealthCard.pdf`);

};

// ------- chart -------
const chartData = vitals.map(v => ({
  date: new Date(v.createdAt).toLocaleDateString(),
  weight: v.weight,
  glucose: v.glucose
}));


// ------------ Submit Vitals Function ---------
const handleAddVital = async (e) => {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem("user"));

  const response = await fetch("http://localhost:5001/api/vitals/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      patientId: id,
      ...formData,
      recordedBy: user.id
    })
  });

  const data = await response.json();

  if (response.ok) {

    alert("Vitals added successfully");

    // refresh vitals list
    fetch(`http://localhost:5001/api/vitals/${id}`)
      .then(res => res.json())
      .then(data => setVitals(data));

    // reset form
    setFormData({
      bloodPressure: "",
      weight: "",
      glucose: "",
      heartRate: "",
      notes: ""
    });
  }
};

  useEffect(() => {

    fetch(`http://localhost:5001/api/patients/${id}`)
      .then(res => res.json())
      .then(data => setPatient(data));

    fetch(`http://localhost:5001/api/vitals/${id}`)
      .then(res => res.json())
      .then(data => setVitals(data));

  }, [id]);

  if (!patient) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Patient Profile
      </h1>

      <div className="mb-8 bg-white p-6 rounded shadow">

        <h2 className="text-xl font-semibold">{patient.name}</h2>

        <p>Village: {patient.village}</p>
        <p>Age: {patient.age}</p>
        <p>Blood Group: {patient.bloodGroup}</p>

      </div>

        <button
        onClick={() => setShowQR(!showQR)}
         className="bg-green-600 text-white px-4 py-2 rounded mt-4"
>
Generate Health Card QR
</button>

{showQR && (

<div className="mt-6 bg-white p-6 rounded shadow">

<h2 className="text-lg font-semibold mb-4">
Patient QR Health Card
</h2>

<QRCodeCanvas
  value={`http://localhost:5173/health-card/${patient._id}`}
  size={200}
/>

</div>

)}

<div
  id="healthCard"
  className="bg-white p-6 rounded shadow mt-6 w-[350px]"
>

<h2 className="text-lg font-bold text-green-700 mb-2">
JeevanVriksha Health Card
</h2>

<p><b>Name:</b> {patient.name}</p>
<p><b>Village:</b> {patient.village}</p>
<p><b>Age:</b> {patient.age}</p>
<p><b>Blood Group:</b> {patient.bloodGroup}</p>

<div className="flex justify-center mt-4">

<QRCodeCanvas
value={`http://localhost:5173/health-card/${patient._id}`}
size={160}
/>

</div>

<p className="text-xs text-center mt-3">
Scan for full medical record
</p>

</div>

<button
onClick={downloadCard}
className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
>
Download Health Card
</button>

      <h2 className="text-xl font-semibold mb-4">
        Vitals History
      </h2>

        <div className="bg-white p-6 rounded shadow mb-8">

        <h2 className="text-xl font-semibold mb-4">
        Add Vitals
        </h2>

        <form onSubmit={handleAddVital} className="grid grid-cols-2 gap-4">

        <input
        name="bloodPressure"
        placeholder="Blood Pressure (120/80)"
        value={formData.bloodPressure}
        onChange={handleChange}
        className="border p-2 rounded"
        />

        <input
        name="weight"
placeholder="Weight (kg)"
value={formData.weight}
onChange={handleChange}
className="border p-2 rounded"
/>

<input
name="glucose"
placeholder="Glucose"
value={formData.glucose}
onChange={handleChange}
className="border p-2 rounded"
/>

<input
name="heartRate"
placeholder="Heart Rate"
value={formData.heartRate}
onChange={handleChange}
className="border p-2 rounded"
/>

<input
name="notes"
placeholder="Notes"
value={formData.notes}
onChange={handleChange}
className="border p-2 rounded col-span-2"
/>

<button
type="submit"
className="bg-green-600 text-white py-2 rounded col-span-2"
>
Add Vitals
</button>

        </form>

        </div>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">BP</th>
            <th className="p-3">Weight</th>
            <th className="p-3">Glucose</th>
            <th className="p-3">Heart Rate</th>
          </tr>
        </thead>

        <tbody>

          {vitals.map(v => (
            <tr key={v._id} className="border-t">

              <td className="p-3">{v.bloodPressure}</td>
              <td className="p-3">{v.weight}</td>
              <td className="p-3">{v.glucose}</td>
              <td className="p-3">{v.heartRate}</td>

            </tr>
          ))}

        </tbody>

      </table>

          <h2 className="text-xl font-semibold mt-10 mb-4">
Vitals Trend
</h2>

<LineChart width={600} height={300} data={chartData}>

<CartesianGrid strokeDasharray="3 3" />

<XAxis dataKey="date" />

<YAxis />

<Tooltip />

<Line type="monotone" dataKey="weight" stroke="#16a34a" />

<Line type="monotone" dataKey="glucose" stroke="#2563eb" />

</LineChart>

          <h2 className="text-xl font-semibold mt-10 mb-4">
Vaccinations
</h2>

<table className="w-full border">

<thead className="bg-gray-100">
<tr>
<th className="p-3">Vaccine</th>
<th className="p-3">Due Date</th>
<th className="p-3">Status</th>
</tr>
</thead>

<tbody>

{vaccines.map(v => (

<tr key={v._id} className="border-t">

<td className="p-3">{v.vaccineName}</td>
<td className="p-3">{v.dueDate}</td>
<td className="p-3">{v.status}</td>

</tr>

))}

</tbody>

</table>


    </div>
  );
};

export default PatientProfile;