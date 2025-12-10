// ✅ server.js — Updated Production-Ready Version
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import { pool } from "./db.js";

// ✅ Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration (fixed)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // allow cookies or credentials
  })
);

// ✅ Middleware setup
app.use(express.json());
app.use(morgan("dev"));

// ✅ Import route files
import adminRoutes from "./routes/adminRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import prescriptionDrugsRoutes from "./routes/prescriptionDrugsRoutes.js";
import medicalRecordsRoutes from './routes/medicalRecords.js';
import authRoutes from "./routes/authroutes.js"; // ✅ OTP/auth route

// ✅ Root route
app.get("/", (req, res) => {
  res.send("✅ Kalawa Health EHR Backend API is running successfully!");
});

// ✅ Health check route
app.get("/test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "OK",
      message: "✅ Server and Database are live and connected!",
      db_time: result.rows[0].now,
    });
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

// ✅ Register routes (ensure all exist)
app.use("/api/admin", adminRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/prescription_drugs", prescriptionDrugsRoutes);
app.use('/api/medical_records', medicalRecordsRoutes);
app.use("/api/auth", authRoutes);

// ✅ Catch-all route (for debugging 404s)
app.use((req, res, next) => {
  console.warn(`⚠️ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: "❌ Route not found",
    route: req.originalUrl,
    method: req.method,
  });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// ✅ Start server only after verifying DB connection
(async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("✅ PostgreSQL Database connected successfully.");

    app.listen(PORT, () => {
      console.log(`🚀 Server running at: http://localhost:${PORT}`);
      console.log(
        `🌐 Allowed frontend: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
      );
    });
  } catch (err) {
    console.error("❌ Database connection failed. Server not started:", err.message);
    process.exit(1);
  }
})();
