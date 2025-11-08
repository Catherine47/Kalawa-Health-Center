import express from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// ------------------------ GET ALL ACTIVE PRESCRIPTIONS ------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    let result;

    if (req.user.role === "doctor") {
      // Doctor: only see their prescriptions
      result = await pool.query(
        `SELECT * FROM prescriptions
         WHERE doctor_id = $1 AND deleted_at IS NULL
         ORDER BY date_issued DESC`,
        [req.user.id]
      );
    } else if (req.user.role === "patient") {
      // Patient: only see their prescriptions
      result = await pool.query(
        `SELECT * FROM prescriptions
         WHERE patient_id = $1 AND deleted_at IS NULL
         ORDER BY date_issued DESC`,
        [req.user.id]
      );
    } else {
      // Admin: see all
      result = await pool.query(
        `SELECT * FROM prescriptions
         WHERE deleted_at IS NULL
         ORDER BY prescription_id ASC`
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching prescriptions:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET A SINGLE PRESCRIPTION BY ID ------------------------
router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM prescriptions WHERE prescription_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription not found" });

    const prescription = result.rows[0];

    // Restrict access: only the prescribing doctor, the patient, or admin
    if (
      req.user.role === "doctor" && prescription.doctor_id !== req.user.id ||
      req.user.role === "patient" && prescription.patient_id !== req.user.id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(prescription);
  } catch (err) {
    console.error("❌ Error fetching prescription:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ ADD A NEW PRESCRIPTION ------------------------
router.post("/", authenticate, async (req, res) => {
  const { patient_id, diagnosis, date_issued } = req.body;

  try {
    // Only doctors can add prescriptions
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Only doctors can issue prescriptions" });
    }

    // Validate patient-doctor relationship (doctor must have appointment with patient)
    const appointmentCheck = await pool.query(
      `SELECT * FROM appointments
       WHERE doctor_id = $1 AND patient_id = $2 AND deleted_at IS NULL AND status = 'approved'`,
      [req.user.id, patient_id]
    );

    if (appointmentCheck.rows.length === 0)
      return res.status(403).json({ error: "Doctor has no approved appointment with this patient" });

    const result = await pool.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, diagnosis, date_issued)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [patient_id, req.user.id, diagnosis, date_issued]
    );

    res.status(201).json({
      message: "Prescription created successfully",
      prescription: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error adding prescription:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ UPDATE AN EXISTING PRESCRIPTION ------------------------
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { diagnosis, date_issued } = req.body;

  try {
    const existing = await pool.query(
      `SELECT * FROM prescriptions WHERE prescription_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!existing.rows.length)
      return res.status(404).json({ message: "Prescription not found" });

    const prescription = existing.rows[0];

    // Only the prescribing doctor or admin can update
    if (req.user.role === "doctor" && prescription.doctor_id !== req.user.id)
      return res.status(403).json({ error: "You cannot edit another doctor's prescription" });

    const result = await pool.query(
      `UPDATE prescriptions
       SET diagnosis = $1,
           date_issued = $2,
           updated_at = NOW()
       WHERE prescription_id = $3
       RETURNING *`,
      [diagnosis, date_issued, id]
    );

    res.json({
      message: "Prescription updated successfully",
      prescription: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating prescription:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ SOFT DELETE PRESCRIPTION ------------------------
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query(
      `SELECT * FROM prescriptions WHERE prescription_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!existing.rows.length)
      return res.status(404).json({ message: "Prescription not found" });

    const prescription = existing.rows[0];

    // Only admin or prescribing doctor can delete
    if (req.user.role === "doctor" && prescription.doctor_id !== req.user.id)
      return res.status(403).json({ error: "You cannot delete another doctor's prescription" });

    await pool.query(
      `UPDATE prescriptions SET deleted_at = NOW() WHERE prescription_id = $1`,
      [id]
    );

    res.json({ message: "Prescription soft-deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting prescription:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ RESTORE A SOFT-DELETED PRESCRIPTION ------------------------
router.put("/restore/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE prescriptions
       SET deleted_at = NULL, updated_at = NOW()
       WHERE prescription_id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription not found or not deleted" });

    res.json({ message: "Prescription restored successfully", prescription: result.rows[0] });
  } catch (err) {
    console.error("❌ Error restoring prescription:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
