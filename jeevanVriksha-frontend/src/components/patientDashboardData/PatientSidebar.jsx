import { LayoutDashboard, Syringe, Activity, Bell, FileText } from "lucide-react";

const PatientSidebar = () => {

  const items = [
    { label: "Dashboard", icon: <LayoutDashboard size={18}/> },
    { label: "Vaccinations", icon: <Syringe size={18}/> },
    { label: "Health Records", icon: <Activity size={18}/> },
    { label: "Alerts", icon: <Bell size={18}/> },
    { label: "Health Card", icon: <FileText size={18}/> }
  ];

  return (
    <div className="w-60 bg-[#064a8f] text-white min-h-screen p-6">

      <h2 className="font-bold text-lg mb-8">
        JeevanVriksha
      </h2>

      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </div>

    </div>
  );
};

export default PatientSidebar;