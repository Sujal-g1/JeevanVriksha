const mongoose = require("mongoose");

const ashaStockSchema = new mongoose.Schema({

  ashaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true
  },

  quantity: {
    type: Number,
    required: true
  },

  receivedDate: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model("AshaStock", ashaStockSchema);