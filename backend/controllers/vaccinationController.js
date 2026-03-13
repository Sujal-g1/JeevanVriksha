const Vaccination = require("../models/Vaccination");

// add vaccine
exports.addVaccination = async (req, res) => {

  try {

    const { patientId, vaccineName, dueDate, status } = req.body;

    const vaccine = new Vaccination({
      patientId,
      vaccineName,
      dueDate,
      status
    });

    await vaccine.save();

    res.json({
      message: "Vaccination added",
      vaccine
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};


// get vaccines for patient
exports.getVaccinations = async (req, res) => {

  try {

    const vaccines = await Vaccination.find({
      patientId: req.params.patientId
    });

    res.json(vaccines);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};

// ASHA to Mark Vaccine Completed
exports.completeVaccination = async (req,res)=>{

try{

const vaccine = await Vaccination.findByIdAndUpdate(

req.params.id,

{
status:"completed",
dateGiven:new Date()
},

{ new:true }

)

res.json({
message:"Vaccination completed",
vaccine
})

}catch(err){

res.status(500).json({
message:"Server error"
})

}

}