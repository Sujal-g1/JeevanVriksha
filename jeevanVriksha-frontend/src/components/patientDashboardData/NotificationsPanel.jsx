const NotificationsPanel = ({patient})=>{

const alerts = []

if(patient.isPregnant){

alerts.push("ANC visit due")
alerts.push("Take iron tablets daily")

}

if(patient.isNewborn){

alerts.push("Next vaccination due")
alerts.push("Exclusive breastfeeding recommended")

}

return(

<div className="bg-yellow-50 p-4 rounded-xl">

<h3 className="font-bold mb-2">Health Alerts</h3>

{alerts.map((a,i)=>(
<p key={i}>⚠ {a}</p>
))}

</div>

)

}

export default NotificationsPanel