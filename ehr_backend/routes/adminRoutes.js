import express from "express";
import { pool } from "../db.js";
import bcrypt from "bcrypt";

const router = express.Router();

// ✅ Test route
router.get("/test", (req, res) => {
  res.send("✅ adminRoutes is working securely!");
});

// ✅ Get all active admins (exclude soft-deleted ones)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT admin_id, first_name, last_name, username, email_address, created_at FROM admins WHERE deleted_at IS NULL ORDER BY admin_id ASC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admins:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Get single admin by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT admin_id, first_name, last_name, username, email_address, created_at FROM admins WHERE admin_id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Admin not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching admin:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Add new admin (with password hashing)
router.post("/", async (req, res) => {
  const { first_name, last_name, username, password, email_address } = req.body;

  if (!first_name || !last_name || !username || !password || !email_address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admins (first_name, last_name, username, password, email_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING admin_id, first_name, last_name, username, email_address, created_at`,
      [first_name, last_name, username, hashedPassword, email_address]
    );

    res.status(201).json({
      message: "Admin created successfully",
      admin: result.rows[0],
    });
  } catch (err) {
    console.error("Error adding admin:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Update admin (and hash password if changed)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, username, password, email_address } = req.body;

  try {
    // Check if admin exists and not deleted
    const existing = await pool.query(
      "SELECT * FROM admins WHERE admin_id = $1 AND deleted_at IS NULL",
      [id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ message: "Admin not found" });

    // Hash new password if provided
    let hashedPassword = existing.rows[0].password;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await pool.query(
      `UPDATE admins 
       SET first_name = $1, last_name = $2, username = $3, 
           password = $4, email_address = $5, updated_at = NOW()
       WHERE admin_id = $6
       RETURNING admin_id, first_name, last_name, username, email_address, updated_at`,
      [first_name, last_name, username, hashedPassword, email_address, id]
    );

    res.json({
      message: "Admin updated successfully",
      admin: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating admin:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Soft delete admin (instead of hard delete)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "UPDATE admins SET deleted_at = NOW() WHERE admin_id = $1 AND deleted_at IS NULL RETURNING admin_id",
      [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Admin not found or already deleted" });

    res.json({ message: "Admin soft-deleted successfully" });
  } catch (err) {
    console.error("Error deleting admin:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
