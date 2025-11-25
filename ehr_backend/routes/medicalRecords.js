import express from 'express';
import { pool } from '../db.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();

// GET /api/medical-records/patient/:patientId
router.get('/patient/:patientId', authenticate, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Verify the patient is accessing their own records
    if (req.user.id !== parseInt(patientId) && req.user.role !== 'doctor') {
      return res.status(403).json({ 
        error: 'Access denied. You can only view your own medical records.' 
      });
    }

    console.log(`🔄 Fetching medical records for patient ID: ${patientId}`);
    
    // Query with correct column names for your schema
    const query = `
      SELECT 
        mr.id,
        mr.patient_id,
        mr.doctor_id,
        mr.record_date,
        mr.record_type,
        mr.diagnosis,
        mr.treatment,
        mr.notes,
        mr.follow_up_date,
        mr.created_at,
        CONCAT(d.first_name, ' ', d.last_name) as doctor_name,
        d.specialization as doctor_specialization
      FROM medical_records mr
      LEFT JOIN doctors d ON mr.doctor_id = d.doctor_id
      WHERE mr.patient_id = $1
      ORDER BY mr.record_date DESC
    `;
    
    const { rows: records } = await pool.query(query, [patientId]);
    
    console.log(`✅ Found ${records.length} medical records for patient ${patientId}`);
    
    res.json({
      success: true,
      records: records,
      count: records.length
    });
    
  } catch (error) {
    console.error('❌ Error fetching medical records:', error);
    res.status(500).json({ 
      error: 'Failed to fetch medical records',
      details: error.message 
    });
  }
});

export default router;