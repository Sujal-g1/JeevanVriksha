const Patient = require("../models/Patient")
const Vaccination = require("../models/Vaccination")
const Visit = require("../models/Visit")
const Pregnancy = require("../models/Pregnancy")

exports.getStats = async(req,res)=>{

try{

// total patients
const patients = await Patient.countDocuments()

// pregnant women
const pregnancy = await Patient.countDocuments({
pregnancyStatus:"pregnant"
})

// newborns
const newborns = await Patient.countDocuments({
isNewborn:true
})

// vaccines due
const vaccines = await Vaccination.countDocuments({
status:"pending",
dueDate:{ $lte:new Date() }
})

// high rish
const highRisk = await Pregnancy.countDocuments({
hemoglobin:{ $lt:10 }
})

// visits today
const start = new Date()
start.setHours(0,0,0,0)

const end = new Date()
end.setHours(23,59,59,999)

const visits = await Visit.countDocuments({
createdAt:{
$gte:start,
$lte:end
}
})

res.json({
patients,
pregnancy,
newborns,
vaccines,
visits
})

}catch(err){

console.error(err)

res.status(500).json({
message:"Dashboard stats error"
})

}

}