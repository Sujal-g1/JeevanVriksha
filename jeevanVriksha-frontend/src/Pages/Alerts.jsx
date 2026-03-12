import React, { useEffect, useState } from "react"
import AshaNavbar from "../components/AshaNavbar"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

const Alerts = () => {

   const navigate = useNavigate();  

const [alerts,setAlerts] = useState([])

useEffect(()=>{

const fetchAlerts = async()=>{

const user = JSON.parse(localStorage.getItem("user"))

const res = await fetch("http://localhost:5001/api/alerts",{
headers:{
Authorization:`Bearer ${user.token}`
}
})

const data = await res.json()

setAlerts(data)

}

fetchAlerts()

},[])

return(

<div className="min-h-screen bg-[#064a8f] pt-20 p-6">

<AshaNavbar/>

 <button 
    onClick={() => navigate(-1)} 
     className="flex items-center gap-2 text-blue-200 text-xs font-bold mb-2 uppercase tracking-widest hover:text-white transition-colors">
    <ArrowLeft size={14} /> Back to Dashboard
    </button>

<h1 className="text-white text-xl font-bold mb-4">
Health Alerts
</h1>

<div className="space-y-3">

{alerts.map((alert,i)=>(
<div key={i} className="bg-white rounded-xl p-4 shadow">

<p className="text-sm font-semibold text-red-600">
⚠ {alert.message}
</p>

</div>
))}

</div>

</div>

)

}

export default Alerts