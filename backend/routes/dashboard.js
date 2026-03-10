const express = require("express")
const router = express.Router()

const User = require("../models/User")
const Visit = require("../models/Visit")

router.get("/stats", async (req,res)=>{

try{

const patients = await User.countDocuments({ role:"patient" })

const visits = await Visit.countDocuments({
createdAt:{
$gte:new Date().setHours(0,0,0,0)
}
})

const pregnancy = await Visit.countDocuments({
type:"pregnancy"
})

const vaccines = await Visit.countDocuments({
type:"vaccination"
})

res.json({
patients,
pregnancy,
vaccines,
visits
})

}catch(err){
res.status(500).json({message:"Server error"})
}

})

module.exports = router