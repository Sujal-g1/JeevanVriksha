const VisitPatient = () => {

const { id } = useParams()

const [vitals,setVitals] = useState({
bloodPressure:"",
weight:"",
glucose:"",
heartRate:""
})

const [notes,setNotes] = useState("")

const handleSubmit = async()=>{

await fetch("http://localhost:5001/api/visit/add",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
patientId:id,
vitals,
notes
})

})

}

return(

<div>

<h1>Patient Visit</h1>

<input
placeholder="Blood Pressure"
onChange={(e)=>setVitals({...vitals,bloodPressure:e.target.value})}
/>

<input
placeholder="Weight"
/>

<input
placeholder="Glucose"
/>

<textarea
placeholder="Notes"
/>

<button onClick={handleSubmit}>
Save Visit
</button>

</div>

)

}