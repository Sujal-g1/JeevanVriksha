const mongoose = require("mongoose");

const newbornSchema = new mongoose.Schema({

patientId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Patient"
},

birthWeight:Number,
temperature:Number,
breastfeeding:String,
notes:String

},{
timestamps:true
})

module.exports = mongoose.model("Newborn", newbornSchema);

