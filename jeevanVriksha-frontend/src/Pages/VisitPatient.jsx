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
onChange={(e)=>setVitals({...vitals,weight:e.target.value})}
/>

<input
placeholder="Glucose"
onChange={(e)=>setVitals({...vitals,glucose:e.target.value})}
/>

<input
placeholder="Heart Rate"
onChange={(e)=>setVitals({...vitals,heartRate:e.target.value})}
/>
<button onClick={handleSubmit}>
Save Visit
</button>

</div>

)

}