import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PatientList = () => {

  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {

    fetch("http://localhost:5001/api/patients")
      .then(res => res.json())
      .then(data => setPatients(data));

  }, []);

  return (

    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Patient List
      </h1>

      <table className="w-full border">

        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Village</th>
            <th className="p-3">Age</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>

        <tbody>

          {patients.map((patient) => (

            <tr key={patient._id} className="border-t">

              <td className="p-3">{patient.name}</td>
              <td className="p-3">{patient.village}</td>
              <td className="p-3">{patient.age}</td>

              <td className="p-3">
                <button
                  onClick={() => navigate(`/patients/${patient._id}`)}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  View
                </button>
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
};

export default PatientList;