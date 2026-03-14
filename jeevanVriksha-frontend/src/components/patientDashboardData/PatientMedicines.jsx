import { Pill } from "lucide-react";

const PatientMedicines = ({ medicines }) => {

return (

<div className="bg-white rounded-3xl p-6 shadow-xl">

<h3 className="flex items-center gap-2 font-bold mb-4">
<Pill size={18}/> Medicines Given
</h3>

{medicines.length === 0 && (
<p className="text-sm text-gray-400">
No medicines distributed
</p>
)}

<div className="space-y-2">

{medicines.map(m => (

<div
key={m._id}
className="flex justify-between border p-2 rounded-lg"
>

<div>

<p className="font-semibold text-sm">
{m.medicineId?.name}
</p>

<p className="text-xs text-gray-400">
{new Date(m.givenDate).toLocaleDateString()}
</p>

</div>

<span className="text-sm font-bold">
{m.quantity}
</span>

</div>

))}

</div>

</div>

);

};

export default PatientMedicines;