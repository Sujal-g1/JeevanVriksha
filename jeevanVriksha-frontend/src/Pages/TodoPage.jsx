import React, { useState, useEffect } from "react";
import { ClipboardList, CheckCircle, ArrowLeft } from "lucide-react";
import AshaNavbar from "../components/AshaNavbar";
import { useNavigate } from "react-router-dom";

const TodoPage = () => {

const [tasks,setTasks] = useState([])
const [patientId,setPatientId] = useState("")
const [taskType,setTaskType] = useState("")
const [note,setNote] = useState("")
const [dueDate,setDueDate] = useState("")
const [editingTaskId,setEditingTaskId] = useState(null)

const navigate = useNavigate()

// fetch tasks
const fetchTasks = async () => {

try{

const res = await fetch("http://localhost:5001/api/tasks")
const data = await res.json()

setTasks(data)

}catch(err){
console.error(err)
}

}

useEffect(()=>{
fetchTasks()
},[])


// create task
// const createTask = async () => {

// if(!taskType){
// alert("Task title required")
// return
// }

// try{

// const user = JSON.parse(localStorage.getItem("user"))

// await fetch("http://localhost:5001/api/tasks/create",{
// method:"POST",
// headers:{
// "Content-Type":"application/json",
// Authorization:`Bearer ${user.token}`
// },
// body:JSON.stringify({
// patientId: patientId || null,
// taskType,
// note,
// dueDate
// })
// })

// // reset form
// setPatientId("")
// setTaskType("")
// setNote("")
// setDueDate("")

// // reload tasks
// fetchTasks()

// }catch(err){
// console.error(err)
// }

// }

const saveTask = async () => {

if(!taskType){
alert("Task title required")
return
}

try{

const user = JSON.parse(localStorage.getItem("user"))

const url = editingTaskId
? `http://localhost:5001/api/tasks/${editingTaskId}`
: "http://localhost:5001/api/tasks/create"

const method = editingTaskId ? "PATCH" : "POST"

await fetch(url,{
method,
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${user.token}`
},
body:JSON.stringify({
patientId: patientId || null,
taskType,
note,
dueDate
})
})

setPatientId("")
setTaskType("")
setNote("")
setDueDate("")
setEditingTaskId(null)

fetchTasks()

}catch(err){
console.error(err)
}

}

// mark complete
const markComplete = async (id) => {

try{

    await fetch(`http://localhost:5001/api/tasks/${id}`,{
method:"PATCH",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
status:"completed"
})
})

fetchTasks()

}catch(err){
console.error(err)
}

}


return (

<div className="min-h-screen bg-[#064a8f] bg-gradient-to-b from-[#064a8f] to-[#1259a1]">

<AshaNavbar/>

<main className="pt-24 px-4 max-w-5xl mx-auto grid md:grid-cols-2 gap-6">

{/* Create Task Panel */}

 <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-blue-200 text-xs font-bold mb-6 uppercase tracking-widest hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back to dashboard
        </button>

<div className="bg-white rounded-2xl shadow-xl p-6">

<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
<ClipboardList size={18}/>
{editingTaskId ? "Update Task" : "Create Task"}
</h2>

<label className="text-sm font-semibold text-gray-600">
Task
</label>

<input
placeholder="Example: Visit Anganwadi"
value={taskType}
onChange={(e)=>setTaskType(e.target.value)}
className="w-full border rounded-lg px-3 py-2 mb-4 mt-1"
/>

<label className="text-sm font-semibold text-gray-600">
Patient ID (optional)
</label>

<input
placeholder="Add if task related to patient"
value={patientId}
onChange={(e)=>setPatientId(e.target.value)}
className="w-full border rounded-lg px-3 py-2 mb-4 mt-1"
/>

<label className="text-sm font-semibold text-gray-600">
Notes
</label>

<textarea
placeholder="Add notes..."
value={note}
onChange={(e)=>setNote(e.target.value)}
className="w-full border rounded-lg px-3 py-2 mb-4 mt-1"
/>

<label className="text-sm font-semibold text-gray-600">
Due Date
</label>

<input
type="date"
value={dueDate}
onChange={(e)=>setDueDate(e.target.value)}
className="w-full border rounded-lg px-3 py-2 mb-6 mt-1"
/>

<button
onClick={saveTask}
className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded-lg font-semibold"
>
Create Task
</button>

{editingTaskId && (
<button
onClick={()=>{
setEditingTaskId(null)
setPatientId("")
setTaskType("")
setNote("")
setDueDate("")
}}
className="mt-2 w-full bg-gray-200 hover:bg-gray-300 py-2 rounded-lg text-sm"
>
Cancel Editing
</button>
)}

</div>


{/* Task List */}

<div className="bg-white rounded-2xl shadow-xl p-6">

<h2 className="text-xl font-bold mb-6">
Pending Tasks
</h2>

<div className="space-y-3">

{tasks.length === 0 && (
<div className="text-gray-400 text-sm">
No tasks yet
</div>
)}

{tasks.map(task=>(
<div
key={task._id}
onClick={()=>{
setEditingTaskId(task._id)
setTaskType(task.taskType || "")
setNote(task.note || "")
setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "")
setPatientId(task.patientId?._id || "")
}}
className="border rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
>

<div>

<div className="font-semibold text-sm">
{task.taskType}
</div>

<div className="text-xs text-gray-500">
{task.patientId?.name || "Personal Task"}
</div>

</div>

<button
onClick={(e)=>{
e.stopPropagation()
markComplete(task._id)
}}
className="text-green-600 hover:text-green-700"
>
<CheckCircle size={18}/>
</button>

</div>
))}

</div>

</div>

</main>

</div>

)

}

export default TodoPage