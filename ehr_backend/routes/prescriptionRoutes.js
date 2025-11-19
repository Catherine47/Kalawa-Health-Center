import express from "express";
import { pool } from "../db.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// ------------------------ GET ALL ACTIVE PRESCRIPTIONS ------------------------
router.get("/", authenticate, async (req, res) => {
  try {
    let result;

    if (req.user.role === "doctor") {
      // Doctor: only see their prescriptions with patient info
      result = await pool.query(
        `SELECT p.*, 
                pat.first_name as patient_first_name,
                pat.last_name as patient_last_name,
                pat.phone_number as patient_phone
         FROM prescriptions p
         JOIN patients pat ON p.patient_id = pat.patient_id
         WHERE p.doctor_id = $1 AND p.deleted_at IS NULL
         ORDER BY p.date_issued DESC`,
        [req.user.id]
      );
    } else if (req.user.role === "patient") {
      // Patient: only see their prescriptions with doctor info
      result = await pool.query(
        `SELECT p.*,
                d.first_name as doctor_first_name,
                d.last_name as doctor_last_name,
                d.specialization
         FROM prescriptions p
         JOIN doctors d ON p.doctor_id = d.doctor_id
         WHERE p.patient_id = $1 AND p.deleted_at IS NULL
         ORDER BY p.date_issued DESC`,
        [req.user.id]
      );
    } else {
      // Admin: see all with both patient and doctor info
      result = await pool.query(
        `SELECT p.*,
                pat.first_name as patient_first_name,
                pat.last_name as patient_last_name,
                d.first_name as doctor_first_name, 
                d.last_name as doctor_last_name,
                d.specialization
         FROM prescriptions p
         JOIN patients pat ON p.patient_id = pat.patient_id
         JOIN doctors d ON p.doctor_id = d.doctor_id
         WHERE p.deleted_at IS NULL
         ORDER BY p.prescription_id DESC`
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error fetching prescriptions:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ GET PRESCRIPTIONS BY PATIENT ID ------------------------
router.get("/patient/:patient_id", authenticate, async (req, res) => {
  try {
    const { patient_id } = req.params;
    
    console.log(`📋 Fetching prescriptions for patient: ${patient_id}`);

    // Validate patient_id
    if (!patient_id) {
      return res.status(400).json({
        success: false,
        error: 'Patient ID is required'
      });
    }

    // First, verify the patient exists
    const patientCheck = await pool.query(
      'SELECT patient_id FROM patients WHERE patient_id = $1',
      [patient_id]
    );

    if (patientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }

    // Access control: patients can only see their own prescriptions
    if (req.user.role === "patient" && parseInt(patient_id) !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied - you can only view your own prescriptions'
      });
    }

    // Access control: doctors can only see prescriptions for their patients
    if (req.user.role === "doctor") {
      const doctorPatientCheck = await pool.query(
        `SELECT 1 FROM appointments 
         WHERE doctor_id = $1 AND patient_id = $2 AND deleted_at IS NULL 
         LIMIT 1`,
        [req.user.id, patient_id]
      );

      if (doctorPatientCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Access denied - you can only view prescriptions for your patients'
        });
      }
    }

    // Query to get prescriptions with medication details
    const prescriptionsQuery = `
      SELECT 
        p.prescription_id,
        p.patient_id,
        p.doctor_id,
        p.diagnosis,
        p.date_issued,
        p.status,
        p.notes,
        p.created_at,
        p.updated_at,
        d.first_name as doctor_first_name,
        d.last_name as doctor_last_name,
        d.specialization as doctor_specialization,
        COALESCE(
          json_agg(
            json_build_object(
              'drug_id', pd.drug_id,
              'drug_name', pd.drug_name,
              'dosage', pd.dosage,
              'duration', pd.duration,
              'instructions', pd.instructions,
              'quantity', pd.quantity
            )
          ) FILTER (WHERE pd.drug_id IS NOT NULL),
          '[]'::json
        ) as medications
      FROM prescriptions p
      LEFT JOIN prescription_drugs pd ON p.prescription_id = pd.prescription_id
      LEFT JOIN doctors d ON p.doctor_id = d.doctor_id
      WHERE p.patient_id = $1 AND p.deleted_at IS NULL
      GROUP BY p.prescription_id, d.first_name, d.last_name, d.specialization
      ORDER BY p.date_issued DESC
    `;

    const result = await pool.query(prescriptionsQuery, [patient_id]);
    
    console.log(`✅ Found ${result.rows.length} prescriptions for patient ${patient_id}`);

    res.json({
      success: true,
      prescriptions: result.rows
    });

  } catch (err) {
    console.error('❌ Error fetching prescriptions by patient ID:', err.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while fetching prescriptions'
    });
  }
});

// ------------------------ GET A SINGLE PRESCRIPTION BY ID ------------------------
router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*,
              pat.first_name as patient_first_name,
              pat.last_name as patient_last_name,
              d.first_name as doctor_first_name,
              d.last_name as doctor_last_name,
              d.specialization
       FROM prescriptions p
       JOIN patients pat ON p.patient_id = pat.patient_id
       JOIN doctors d ON p.doctor_id = d.doctor_id
       WHERE p.prescription_id = $1 AND p.deleted_at IS NULL`,
      [id]
    );

    if (!result.rows.length)
      return res.status(404).json({ message: "Prescription not found" });

    const prescription = result.rows[0];

    // Restrict access: only the prescribing doctor, the patient, or admin
    if (
      (req.user.role === "doctor" && prescription.doctor_id !== req.user.id) ||
      (req.user.role === "patient" && prescription.patient_id !== req.user.id)
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
  const { patient_id, diagnosis, date_issued, notes, status } = req.body;

  try {
    // Only doctors can add prescriptions
    if (req.user.role !== "doctor") {
      return res.status(403).json({ error: "Only doctors can issue prescriptions" });
    }

    // More flexible patient-doctor relationship check
    const relationshipCheck = await pool.query(
      `SELECT 1 FROM appointments
       WHERE doctor_id = $1 AND patient_id = $2 AND deleted_at IS NULL
       LIMIT 1`,
      [req.user.id, patient_id]
    );

    if (relationshipCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: "You can only prescribe to patients you have appointments with" 
      });
    }

    const result = await pool.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, diagnosis, date_issued, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        patient_id, 
        req.user.id, 
        diagnosis, 
        date_issued || new Date(),
        notes || '',
        status || 'active'
      ]
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

// ------------------------ GET PRESCRIPTION DRUGS ------------------------
router.get("/:id/drugs", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // First check prescription access
    const prescriptionCheck = await pool.query(
      `SELECT * FROM prescriptions WHERE prescription_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!prescriptionCheck.rows.length) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const prescription = prescriptionCheck.rows[0];

    // Access control
    if (
      (req.user.role === "doctor" && prescription.doctor_id !== req.user.id) ||
      (req.user.role === "patient" && prescription.patient_id !== req.user.id)
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Get prescription drugs
    const drugsResult = await pool.query(
      `SELECT * FROM prescription_drugs 
       WHERE prescription_id = $1 
       ORDER BY drug_id ASC`,
      [id]
    );

    res.json(drugsResult.rows);
  } catch (err) {
    console.error("❌ Error fetching prescription drugs:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ ADD DRUG TO PRESCRIPTION ------------------------
router.post("/:id/drugs", authenticate, async (req, res) => {
  const { id } = req.params;
  const { drug_name, dosage, duration, instructions, quantity } = req.body;

  try {
    // Check prescription access and ownership
    const prescriptionCheck = await pool.query(
      `SELECT * FROM prescriptions WHERE prescription_id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (!prescriptionCheck.rows.length) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    const prescription = prescriptionCheck.rows[0];

    // Only prescribing doctor can add drugs
    if (req.user.role !== "doctor" || prescription.doctor_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const result = await pool.query(
      `INSERT INTO prescription_drugs (prescription_id, drug_name, dosage, duration, instructions, quantity)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        id, 
        drug_name, 
        dosage, 
        duration, 
        instructions || '',
        quantity || 1
      ]
    );

    res.status(201).json({
      message: "Drug added to prescription successfully",
      drug: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Error adding prescription drug:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ------------------------ UPDATE AN EXISTING PRESCRIPTION ------------------------
router.put("/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { diagnosis, date_issued, notes, status } = req.body;

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
           notes = $3,
           status = $4,
           updated_at = NOW()
       WHERE prescription_id = $5
       RETURNING *`,
      [
        diagnosis, 
        date_issued, 
        notes || '',
        status || 'active',
        id
      ]
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