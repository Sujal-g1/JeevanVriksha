const Vaccination = require("../models/Vaccination")
const { newbornSchedule } = require("./vaccineSchedule")

exports.generateNewbornVaccines = async (patientId, birthDate) => {

for (const vaccine of newbornSchedule) {

const due = new Date(birthDate)
due.setDate(due.getDate() + vaccine.days)

// check if vaccine already exists
const exists = await Vaccination.findOne({
patientId,
vaccineName: vaccine.name
})

if (!exists) {

await Vaccination.create({
patientId,
vaccineName: vaccine.name,
dueDate: due,
status: "pending"
})

}

}

}