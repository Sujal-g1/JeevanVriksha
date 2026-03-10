const express = require("express")
const router = express.Router()

const Visit = require("../models/Visit")
const User = require("../models/User")

router.get("/", async (req,res)=>{

try{

const visits = await Visit.find()
.populate("patientId","name")
.populate("ashaId","name")
.sort({createdAt:-1})
.limit(5)

res.json(visits)

}catch(err){

res.status(500).json({message:"Server error"})

}

})

module.exports = router