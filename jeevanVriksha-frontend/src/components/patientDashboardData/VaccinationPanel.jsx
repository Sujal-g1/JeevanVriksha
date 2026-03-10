const VaccinationPanel = ({ vaccines }) => {

  return (
    <div className="bg-white rounded-xl p-6 shadow">

      <h3 className="font-bold mb-4">
        Vaccination Record
      </h3>

      {vaccines.length === 0 && (
        <p className="text-gray-500 text-sm">
          No vaccines recorded
        </p>
      )}

      {vaccines.map((v, i) => (
        <div key={i} className="flex justify-between border-b py-2">

          <span>{v.vaccineName}</span>

          <span className="text-sm text-gray-500">
            {new Date(v.dueDate).toLocaleDateString()}
          </span>

        </div>
      ))}

    </div>
  );
};

export default VaccinationPanel;