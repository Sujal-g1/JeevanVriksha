require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require("./routes/auth");

const patientRoutes = require("./routes/patientRoutes");

const patientAashaDashboard = require("./routes/patientAsha");
const vitalRoutes = require("./routes/vitalRoutes");
const vaccinationRoutes = require("./routes/vaccinationRoutes");
const dashboardRoutes = require("./routes/dashboard")
const activityRoutes = require("./routes/activity")
const pregnancyRoutes = require("./routes/pregnancyRoutes");
const newbornRoutes = require("./routes/newbornRoutes");

const medicineRoutes = require("./routes/medicineRoutes");

const aiRoutes = require("./routes/aiRoutes")

const taskRoutes = require("./routes/tasks")



const app = express();

// Connect DB
connectDB();

// CORS
// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: true
// }));
// app.use(cors());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://jeevanvriksha.vercel.app/"
  ],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Server is working");
});

// Middleware
app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
// app.use("/api/patient", patientDashboard);
app.use("/api/patientAsha", patientAashaDashboard);

app.use("/api/vitals", vitalRoutes);
app.use("/api/vaccinations", vaccinationRoutes);
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/activity", activityRoutes)

app.use("/api/pregnancy", pregnancyRoutes);
app.use("/api/newborn", newbornRoutes);

app.use("/api/medicine", medicineRoutes);

app.use("/api/alerts", require("./routes/alerts"))

app.use("/api/ai", aiRoutes)

app.use("/api/tasks", taskRoutes)

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});