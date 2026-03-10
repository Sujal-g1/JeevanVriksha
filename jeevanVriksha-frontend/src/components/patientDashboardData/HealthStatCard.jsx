const HealthStatCard = ({ label, value, icon }) => {

  return (

    <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">

      <div className="bg-blue-100 p-2 rounded-lg">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-lg">{value || "-"}</p>
      </div>

    </div>

  );

};

export default HealthStatCard;