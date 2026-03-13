import React,{useState} from "react"
import {useNavigate} from "react-router-dom"
import AshaNavbar from "../components/AshaNavbar"
import { ArrowLeft } from "lucide-react"

const API = import.meta.env.VITE_API_URL;

import { addToQueue } from "../services/offlineQueueService";

const CreatePatient = ()=>{

const navigate = useNavigate()

const [form,setForm] = useState({
name:"",
phone:"",
password:"",
age:"",
village:"",
gender:"Male",
bloodGroup:""
})


const handleChange = (e)=>{
setForm({...form,[e.target.name]:e.target.value})
}


// const handleSubmit = async(e)=>{

// e.preventDefault()

// const user = JSON.parse(localStorage.getItem("user"))

// const res = await fetch(
// "http://localhost:5001/api/patientAsha/create",
// {
// method:"POST",
// headers:{
// "Content-Type":"application/json",
// Authorization:`Bearer ${user.token}`
// },
// body:JSON.stringify(form)
// }
// )

// const data = await res.json()

// if(res.ok){

// alert("Patient created")

// navigate("/patients")

// }else{

// alert(data.message)

// }

// }

const handleSubmit = async (e) => {

  e.preventDefault()

  const user = JSON.parse(localStorage.getItem("user"))

  // CHECK INTERNET
  if (navigator.onLine) {

    try {

      const res = await fetch(
       `${API}api/patientAsha/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify(form)
        }
      )

      const data = await res.json()

      if (res.ok) {

        alert("Patient created")
        navigate("/patients")

      } else {

        alert(data.message)

      }

    } catch (err) {

      alert("Network error")

    }

  } else {

    console.log("OFFLINE MODE: Saving patient to queue");


    // OFFLINE MODE
    await addToQueue(
      "CREATE_PATIENT",
      "/api/patientAsha/create",
      form
    )

    alert("No internet. Patient saved offline and will sync later.")

    navigate("/patients")

  }

}


return(

<div className="min-h-screen bg-[#064a8f]">

<AshaNavbar/>

<main className="pt-24 max-w-xl mx-auto px-4">
    <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-blue-200 text-xs font-bold mb-2 uppercase tracking-widest hover:text-white transition-colors"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>

<div className="bg-white p-6 rounded-3xl">

<h2 className="text-xl font-bold mb-6">
Create Patient Profile
</h2>

<form onSubmit={handleSubmit} className="space-y-4">

<input
name="name"
placeholder="Patient Name"
onChange={handleChange}
className="w-full border p-2 rounded-xl"
/>

<input
name="phone"
placeholder="Mobile Number"
onChange={handleChange}
className="w-full border p-2 rounded-xl"
/>

<input
name="password"
placeholder="Login Password"
onChange={handleChange}
className="w-full border p-2 rounded-xl"
/>

<input
name="age"
placeholder="Age"
onChange={handleChange}
className="w-full border p-2 rounded-xl"
/>

<input
name="village"
placeholder="Village"
onChange={handleChange}
className="w-full border p-2 rounded-xl"
/>

<select
name="gender"
onChange={handleChange}
className="w-full border p-2 rounded-xl"
>
<option>Male</option>
<option>Female</option>
<option>Other</option>
</select>

<input
name="bloodGroup"
placeholder="Blood Group"
onChange={handleChange}
className="w-full border p-2 rounded-xl"
/>

<button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
Create Patient
</button>

</form>

</div>

</main>

</div>

)

}

export default CreatePatient