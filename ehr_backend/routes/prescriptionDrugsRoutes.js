import express from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// ------------------------ TEST ROUTE ------------------------
router.get("/test", (req, res) => {
  res.send("✅ prescriptionDrugsRoutes is working!");
});

// ------------------------ GET ALL ACTIVE PRESCRIPTION DRUGS ------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    let result;

    if (req.user.role === "doctor") {
      // Doctor sees drugs related to prescriptions they issued
      result = await pool.query(
        `SELECT pd.*, p.patient_id, p.doctor_id
         FROM prescription_drugs pd
         JOIN prescriptions p ON pd.prescription_id = p.prescription_id
         WHERE p.doctor_id = $1 AND pd.deleted_at IS NULL
         ORDER BY pd.drug_id ASC`,
        [req.user.id]
      );
    } else if (req.user.role === "patient") {
      // Patient sees drugs for their own prescriptions
      result = await pool.query(
        `SELECT pd.*, p.patient_id, p.doctor_id
         FROM prescription_drugs pd
         JOIN prescriptions p ON pd.prescription_id = p.prescription_id
         WHERE p.patient_id = $1 AND pd.deleted_at IS NULL
         ORDER BY pd.drug_id ASC`,
        [req.user.id]
      );
    } else {
      // Admin can view all prescription drugs
      result = await pool.query(
        `SELECT pd.*, p.patient_id, p.doctor_id
         FROM prescription_drugs pd
         JOIN prescriptions p ON pd.prescription_id = p.prescription_id
         WHERE pd.deleted_at IS NULL
         ORDER BY pd.drug_id ASC`
      );
    }

    res.json({
      success: true,
      prescription_drugs: result.rows,
    });
  } catch (err) {
    console.error("❌ Error fetching prescription_drugs:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET A SINGLE PRESCRIPTION DRUG BY ID ------------------------
router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT pd.*, p.patient_id, p.doctor_id
       FROM prescription_drugs pd
       JOIN prescriptions p ON pd.prescription_id = p.prescription_id
       WHERE pd.drug_id = $1 AND pd.deleted_at IS NULL`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription drug not found" });

    const drug = result.rows[0];

    // Access control: Only admin, prescribing doctor, or patient can view
    if (
      (req.user.role === "doctor" && drug.doctor_id !== req.user.id) ||
      (req.user.role === "patient" && drug.patient_id !== req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json({
      success: true,
      prescription_drug: drug,
    });
  } catch (err) {
    console.error("❌ Error fetching prescription_drug:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ ADD A NEW PRESCRIPTION DRUG ------------------------
router.post("/", authenticate, async (req, res) => {
  const { prescription_id, drug_name, dosage, duration, instructions } = req.body;

  try {
    // Only doctors can add drugs to prescriptions
    if (req.user.role !== "doctor") {
      return res
        .status(403)
        .json({ error: "Only doctors can add prescription drugs" });
    }

    // Ensure prescription belongs to this doctor
    const prescription = await pool.query(
      `SELECT * FROM prescriptions WHERE prescription_id = $1 AND deleted_at IS NULL`,
      [prescription_id]
    );

    if (!prescription.rows.length)
      return res.status(404).json({ error: "Prescription not found" });

    if (prescription.rows[0].doctor_id !== req.user.id)
      return res
        .status(403)
        .json({ error: "Cannot add drug to another doctor's prescription" });

    const result = await pool.query(
      `INSERT INTO prescription_drugs (prescription_id, drug_name, dosage, duration, instructions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [prescription_id, drug_name, dosage, duration, instructions]
    );

    res.status(201).json({
      success: true,
      message: "Prescription drug added successfully",
      prescription_drug: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error inserting prescription_drug:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ UPDATE PRESCRIPTION DRUG ------------------------
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { drug_name, dosage, duration, instructions } = req.body;

  try {
    // Verify prescription drug exists
    const existing = await pool.query(
      `SELECT pd.*, p.doctor_id
       FROM prescription_drugs pd
       JOIN prescriptions p ON pd.prescription_id = p.prescription_id
       WHERE pd.drug_id = $1 AND pd.deleted_at IS NULL`,
      [id]
    );

    if (!existing.rows.length)
      return res.status(404).json({ message: "Prescription drug not found" });

    const drug = existing.rows[0];

    // Only prescribing doctor or admin can update
    if (req.user.role === "doctor" && drug.doctor_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    const result = await pool.query(
      `UPDATE prescription_drugs
       SET drug_name = $1, dosage = $2, duration = $3, instructions = $4, updated_at = NOW()
       WHERE drug_id = $5
       RETURNING *`,
      [drug_name, dosage, duration, instructions, id]
    );

    res.json({
      success: true,
      message: "Prescription drug updated successfully",
      prescription_drug: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error updating prescription_drug:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ SOFT DELETE PRESCRIPTION DRUG ------------------------
router.delete("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query(
      `SELECT pd.*, p.doctor_id
       FROM prescription_drugs pd
       JOIN prescriptions p ON pd.prescription_id = p.prescription_id
       WHERE pd.drug_id = $1 AND pd.deleted_at IS NULL`,
      [id]
    );

    if (!existing.rows.length)
      return res.status(404).json({ message: "Prescription drug not found" });

    const drug = existing.rows[0];

    // Only prescribing doctor or admin can delete
    if (req.user.role === "doctor" && drug.doctor_id !== req.user.id)
      return res.status(403).json({ error: "Access denied" });

    await pool.query(
      `UPDATE prescription_drugs
       SET deleted_at = NOW()
       WHERE drug_id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: "Prescription drug soft-deleted successfully",
    });
  } catch (err) {
    console.error("❌ Error deleting prescription_drug:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ RESTORE A SOFT-DELETED PRESCRIPTION DRUG ------------------------
router.put("/restore/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE prescription_drugs
       SET deleted_at = NULL, updated_at = NOW()
       WHERE drug_id = $1 AND deleted_at IS NOT NULL
       RETURNING *`,
      [id]
    );

    if (!result.rows.length)
      return res
        .status(404)
        .json({ message: "Prescription drug not found or not deleted" });

    res.json({
      success: true,
      message: "Prescription drug restored successfully",
      prescription_drug: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error restoring prescription_drug:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;