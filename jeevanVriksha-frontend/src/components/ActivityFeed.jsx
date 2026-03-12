import { Clock } from "lucide-react"

const ActivityFeed = ({activity}) => {

return (

<div className="bg-white rounded-3xl p-6 border border-slate-200">

<h2 className="font-bold text-lg mb-4">
Recent Activity
</h2>

<div className="space-y-4">

{Array.isArray(activity) && activity.map((item)=>{
return(

<div
key={item._id}
className="flex gap-3 items-start text-sm"
>

<Clock size={16} className="text-slate-400"/>

<div>

<p className="font-medium">

{item.ashaId?.name} visited {item.patientId?.name}

</p>

<p className="text-slate-500 text-xs">

{new Date(item.createdAt).toLocaleString()}

</p>

</div>

</div>

)

})}

</div>

</div>

)

}

export default ActivityFeed