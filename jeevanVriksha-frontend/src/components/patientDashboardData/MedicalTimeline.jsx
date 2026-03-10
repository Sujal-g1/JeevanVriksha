const MedicalTimeline = ({ events }) => {

  return (
    <div className="bg-white rounded-xl p-6 shadow">

      <h3 className="font-bold mb-4">
        Medical Timeline
      </h3>

      {events.map((e, i) => (

        <div key={i} className="border-l-2 border-blue-500 pl-4 mb-4">

          <p className="font-medium">
            {e.label}
          </p>

          <p className="text-xs text-gray-500">
            {new Date(e.date).toLocaleDateString()}
          </p>

        </div>

      ))}

    </div>
  );
};

export default MedicalTimeline;