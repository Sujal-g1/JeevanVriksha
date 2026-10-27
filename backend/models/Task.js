
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },
    taskType: {
      type: String,
      required: true,
      trim: true,
    },
    dueDate: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    proofImage: {
      type: String,
      default: null,
    },
    isPriority: {
  type: Boolean,
  default: false,
},
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
