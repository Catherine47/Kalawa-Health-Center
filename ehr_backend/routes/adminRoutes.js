import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// ✅ Test route
router.get("/test", (req, res) => {
  res.send("✅ adminRoutes is working!");
});

// ✅ Get all admins
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM admins ORDER BY admin_id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admins:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get admin by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM admins WHERE admin_id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Admin not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching admin:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add a new admin
router.post("/", async (req, res) => {
  const { first_name, last_name, username, password, email_address } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO admins (first_name, last_name, username, password, email_address)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [first_name, last_name, username, password, email_address]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding admin:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update an admin
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, username, password, email_address } = req.body;

  try {
    const result = await pool.query(
      `UPDATE admins 
       SET first_name = $1, last_name = $2, username = $3, 
           password = $4, email_address = $5
       WHERE admin_id = $6
       RETURNING *`,
      [first_name, last_name, username, password, email_address, id]
    );

    if (!result.rows.length) return res.status(404).json({ message: "Admin not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating admin:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete an admin
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM admins WHERE admin_id = $1 RETURNING *", [id]);
    if (!result.rows.length) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
