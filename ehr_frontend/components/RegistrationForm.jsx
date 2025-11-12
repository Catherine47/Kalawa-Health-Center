import React, { useState } from "react";
import axios from "axios";

const RegistrationForm = ({ role = "patient" }) => {
  // State for form fields
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    dob: "",             // patient only
    gender: "",          // patient only
    username: "",        // admin only
    email_address: "",
    phone_number: "",    // patient & doctor
    specialization: "",  // doctor only
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Determine endpoint based on role
      let endpoint;
      if (role === "patient") endpoint = "http://localhost:5000/api/patients/register";
      if (role === "doctor") endpoint = "http://localhost:5000/api/doctors/register";
      if (role === "admin") endpoint = "http://localhost:5000/api/admin/register";

      // Prepare payload
      const payload = { ...formData };
      if (role !== "patient") delete payload.dob;
      if (role !== "patient") delete payload.gender;
      if (role !== "doctor") delete payload.specialization;
      if (role !== "admin") delete payload.username;

      // Send POST request
      const res = await axios.post(endpoint, payload);
      setMessage(res.data.message);

      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        dob: "",
        gender: "",
        username: "",
        email_address: "",
        phone_number: "",
        specialization: "",
        password: ""
      });
    } catch (err) {
      setMessage(err.response?.data?.error || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "auto", padding: "2rem", border: "1px solid #ddd", borderRadius: "8px", marginBottom: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        {role.charAt(0).toUpperCase() + role.slice(1)} Registration
      </h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }} />
        <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }} />

        {role === "patient" && (
          <>
            <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} required style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }} />
            <select name="gender" value={formData.gender} onChange={handleChange} required style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}>
              <option value="">Select Gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </>
        )}

        {role === "admin" && (
          <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }} />
        )}

        <input type="email" name="email_address" placeholder="Email" value={formData.email_address} onChange={handleChange} required style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }} />

        {(role === "patient" || role === "doctor") && (
          <input type="text" name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange} required style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }} />
        )}

        {role === "doctor" && (
          <input type="text" name="specialization" placeholder="Specialization" value={formData.specialization} onChange={handleChange} required style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }} />
        )}

        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }} />

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.5rem", background: "#4CAF50", color: "#fff", border: "none", borderRadius: "4px" }}>
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      {message && <p style={{ marginTop: "1rem", textAlign: "center", color: message.includes("successful") ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

export default RegistrationForm;
