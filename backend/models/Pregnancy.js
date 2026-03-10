const mongoose = require("mongoose");

const pregnancySchema = new mongoose.Schema({

  patientId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Patient",
    required:true
  },

  trimester:String,
  dueDate:Date,

  hemoglobin:Number,
  bp:String,
  weight:Number,

  ironTablets:Number,

  notes:String

},{
  timestamps:true
});

module.exports = mongoose.model("Pregnancy", pregnancySchema);