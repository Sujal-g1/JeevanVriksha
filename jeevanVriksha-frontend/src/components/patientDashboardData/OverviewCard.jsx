const OverviewCard = ({ profile }) => {

  return (
    <div className="bg-indigo-900 text-white p-6 rounded-3xl">

      <h3 className="text-sm opacity-80 mb-2">
        Patient Overview
      </h3>

      <div className="grid md:grid-cols-4 gap-4">

        <div>
          <p className="text-xs opacity-70">Name</p>
          <p className="font-bold">{profile.name}</p>
        </div>

        <div>
          <p className="text-xs opacity-70">Village</p>
          <p className="font-bold">{profile.village}</p>
        </div>

        <div>
          <p className="text-xs opacity-70">Blood Group</p>
          <p className="font-bold">{profile.bloodGroup}</p>
        </div>

        <div>
          <p className="text-xs opacity-70">Age</p>
          <p className="font-bold">{profile.age}</p>
        </div>

      </div>
    </div>
  );
};

export default OverviewCard;