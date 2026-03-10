const mongoose = require("mongoose")

const visitSchema = new mongoose.Schema({

patientId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

ashaId:{
type:mongoose.Schema.Types.ObjectId,
ref:"User",
required:true
},

type:{
type:String,
enum:["general","pregnancy","vaccination"],
default:"general"
},

notes:{
type:String
},

vitals:{
bloodPressure:String,
weight:Number,
glucose:Number,
heartRate:Number
}

},{timestamps:true})

module.exports = mongoose.model("Visit",visitSchema)