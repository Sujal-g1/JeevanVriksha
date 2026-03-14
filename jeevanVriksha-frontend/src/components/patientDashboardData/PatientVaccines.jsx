import { Syringe } from "lucide-react";

const PatientVaccines = ({ vaccines }) => {

return (

<div className="bg-white rounded-3xl p-6 shadow-xl">

<h3 className="flex items-center gap-2 font-bold mb-4">
<Syringe size={18}/> Vaccination Record
</h3>

{vaccines.length === 0 && (
<p className="text-sm text-gray-400">
No vaccine records
</p>
)}

<div className="space-y-2">

{vaccines.map(v => (

<div
key={v._id}
className="flex justify-between border p-2 rounded-lg"
>

<div>
<p className="font-semibold text-sm">
{v.vaccineName}
</p>

<p className="text-xs text-gray-400">
{new Date(v.dueDate).toLocaleDateString()}
</p>

</div>

<span className="text-xs font-bold text-green-600">
{v.status}
</span>

</div>

))}

</div>

</div>

);

};

export default PatientVaccines;