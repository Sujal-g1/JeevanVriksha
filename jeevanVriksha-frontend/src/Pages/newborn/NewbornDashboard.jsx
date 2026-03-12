import React, { useEffect, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import AshaNavbar from "../../components/AshaNavbar";
import { ArrowLeft, Baby } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const NewbornDashboard = () => {

const { id } = useParams();
const navigate = useNavigate();

const [patient,setPatient] = useState(null)

const [newborn,setNewborn] = useState({
birthWeight:"",
temperature:"",
breastfeeding:"",
notes:""
})

useEffect(()=>{

fetch(`${API}/api/patients/${id}`)
.then(res=>res.json())
.then(setPatient)

fetch(`${API}/api/newborn/${id}`)
.then(res=>res.json())
.then(data=>{
if(data) setNewborn(data)
})

},[id])


const handleChange=(e)=>{
setNewborn({...newborn,[e.target.name]:e.target.value})
}


const saveData = async()=>{

await fetch(`${API}/api/newborn/update`,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
patientId:id,
...newborn
})
})

alert("Newborn data saved")

}


if(!patient) return null


return (

<div className="min-h-screen bg-[#064a8f] bg-gradient-to-b from-[#064a8f] to-[#1259a1]">

<AshaNavbar/>

<main className="pt-20 px-4 max-w-6xl mx-auto">

<button
onClick={()=>navigate(-1)}
className="flex items-center gap-2 text-blue-200 text-xs font-bold mb-6"
>
<ArrowLeft size={14}/> Back
</button>


<div className="bg-white rounded-3xl p-6 shadow-xl">

<h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
<Baby/> Newborn Monitoring
</h2>

<p className="text-sm text-slate-500 mb-6">
Baby: <b>{patient.name}</b>
</p>

<div className="grid grid-cols-2 gap-4">

<input
name="birthWeight"
placeholder="Birth Weight"
value={newborn.birthWeight}
onChange={handleChange}
className="border rounded-xl p-2"
/>

<input
name="temperature"
placeholder="Temperature"
value={newborn.temperature}
onChange={handleChange}
className="border rounded-xl p-2"
/>

<select
name="breastfeeding"
value={newborn.breastfeeding}
onChange={handleChange}
className="border rounded-xl p-2"
>
<option>Yes</option>
<option>No</option>
</select>

</div>

<textarea
name="notes"
placeholder="Health notes"
value={newborn.notes}
onChange={handleChange}
className="w-full border rounded-xl p-3 mt-4"
/>

<button
onClick={saveData}
className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-xl font-bold"
>
Save Newborn Record
</button>

</div>

</main>

</div>

)

}

export default NewbornDashboard