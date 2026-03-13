const Visit = require("../models/Visit")

// record a visit
exports.addVisit = async (req,res)=>{

try{

const { patientId, type, notes, vitals } = req.body

const visit = await Visit.create({

patientId,
ashaId:req.user.id,
type:type || "general",
notes,
vitals

})

res.json({
message:"Visit recorded successfully",
visit
})

}catch(err){

console.error("VISIT ERROR:",err)

res.status(500).json({
message:"Server error"
})

}

}


// get today's visits
exports.getTodayVisits = async (req,res)=>{

try{

const start = new Date()
start.setHours(0,0,0,0)

const end = new Date()
end.setHours(23,59,59,999)

const visits = await Visit.find({

createdAt:{
$gte:start,
$lte:end
}

})
.populate("patientId","name")

res.json(visits)

}catch(err){

res.status(500).json({
message:"Server error"
})

}

}