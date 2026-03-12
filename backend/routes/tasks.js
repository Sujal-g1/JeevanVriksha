const express = require("express")
const router = express.Router()

const Task = require("../models/Task")

// GET today's tasks
router.get("/today", async(req,res)=>{

try{

const today = new Date()
today.setHours(0,0,0,0)

const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate()+1)

const tasks = await Task.find({
status:"pending",
dueDate:{
$gte: today,
$lt: tomorrow
}
})
.populate("patientId","name village")

res.json(tasks)

}catch(err){
console.error(err)
res.status(500).json({message:"Server error"})
}

})


// mark complete
router.patch("/:id", async (req,res)=>{

try{

const updates = req.body

const task = await Task.findByIdAndUpdate(
  req.params.id,
  updates,
  { new:true }
)

res.json(task)

}catch(err){
console.error(err)
res.status(500).json({message:"Server error"})
}

})

// Create new task
router.post("/create", async (req,res) => {

try {

const { patientId, taskType, note, dueDate } = req.body

// only taskType should be required
if(!taskType){
return res.status(400).json({message:"taskType required"})
}

const task = new Task({
patientId: patientId || null,
taskType,
note,
dueDate: dueDate || new Date()
})

await task.save()

res.json({
message:"Task created successfully",
task
})

} catch(err){

console.error(err)
res.status(500).json({message:"Server error"})

}

})

// get only pending tasks
router.get("/", async(req,res)=>{

try{

const tasks = await Task.find({
status: "pending"
})
.populate("patientId","name village")
.sort({dueDate:1})

res.json(tasks)

}catch(err){
console.error(err)
res.status(500).json({message:"Server error"})
}

})



module.exports = router