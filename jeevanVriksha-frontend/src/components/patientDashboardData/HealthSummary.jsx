import { HeartPulse, Activity, Weight, Droplet } from "lucide-react";

const HealthSummary = ({ vitals }) => {

  const cards = [
    { label: "Blood Pressure", value: vitals.bloodPressure, icon: <HeartPulse /> },
    { label: "Weight", value: vitals.weight, icon: <Weight /> },
    { label: "Heart Rate", value: vitals.heartRate, icon: <Activity /> },
    { label: "Glucose", value: vitals.glucose, icon: <Droplet /> }
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4">

      {cards.map((c, i) => (
        <div key={i} className="bg-white p-4 rounded-xl shadow">

          <div className="flex justify-between">
            {c.icon}
            <span className="text-sm text-gray-400">
              {c.label}
            </span>
          </div>

          <p className="text-xl font-bold mt-3">
            {c.value || "-"}
          </p>

        </div>
      ))}

    </div>
  );
};

export default HealthSummary;