require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require("./routes/auth");
const patientRoutes = require("./routes/patientRoutes");
const patientDashboard = require("./routes/patient");
const vitalRoutes = require("./routes/vitalRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");


const app = express();

// Connect DB
connectDB();

// CORS
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server is working");
});

// Middleware
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/patient", patientDashboard);

app.use("/api/vitals", vitalRoutes);
app.use("/api/vaccinations", vaccinationRoutes);


const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});