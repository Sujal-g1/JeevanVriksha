import { User, MapPin, Droplets } from "lucide-react";

const PatientOverviewCard = ({ patient }) => {

return (

<div className="bg-white rounded-3xl p-6 shadow-xl">

<div className="flex items-center gap-4 mb-6">

<div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
<User className="text-blue-600"/>
</div>

<div>
<h2 className="text-xl font-bold text-slate-800">
{patient?.name}
</h2>

<p className="text-xs text-slate-400">
Patient ID: {patient?._id?.slice(-6)}
</p>

</div>

</div>

<div className="space-y-3">

<div className="flex items-center gap-2 text-sm">
<MapPin size={16}/>
<span>{patient?.village}</span>
</div>

<div className="flex items-center gap-2 text-sm">
<span>Age: {patient?.age}</span>
</div>

<div className="flex items-center gap-2 text-sm">
<Droplets size={16}/>
<span>{patient?.bloodGroup}</span>
</div>

</div>

</div>

);

};

export default PatientOverviewCard;