// server.js
import express from "express";
import cors from "cors";

// Import routes
import adminRoutes from "./routes/adminRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import prescriptionDrugsRoutes from "./routes/prescriptionDrugsRoutes.js";

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // Allow your React frontend to access backend
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow these HTTP methods
    allowedHeaders: ["Content-Type"], // Allow these headers
  })
);

app.use(express.json()); // Parse JSON data

// ✅ Test route
app.get("/test", (req, res) => {
  res.send("✅ Server is running and connected to frontend!");
});

// ✅ Register routes
app.use("/admins", adminRoutes);
app.use("/doctors", doctorRoutes);
app.use("/patients", patientRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/prescription_drugs", prescriptionDrugsRoutes);

// ✅ Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
