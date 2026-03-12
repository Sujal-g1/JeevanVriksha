const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({

patientId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Patient"
},

taskType:{
type:String
},

dueDate:{
type:Date
},

note:{
type:String
},


status:{
type:String,
default:"pending"
}

},{timestamps:true})

module.exports = mongoose.model("Task",taskSchema)