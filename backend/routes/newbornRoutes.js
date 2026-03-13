const express = require("express");
const router = express.Router();
const Newborn = require("../models/Newborn");
const { generateNewbornVaccines } = require("../utils/generateNewbornVaccines")


router.get("/:patientId", async(req,res)=>{

const data = await Newborn.findOne({
patientId:req.params.patientId
})

res.json(data || {})

})


router.post("/update", async(req,res)=>{

const { patientId } = req.body

let record = await Newborn.findOne({patientId})

if(record){

record = await Newborn.findOneAndUpdate(
{patientId},
req.body,
{new:true}
)

}else{

record = await Newborn.create(req.body)

// generate vaccination schedule
await generateNewbornVaccines(patientId, new Date())

}

res.json(record)

})


module.exports = router