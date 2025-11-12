import React, { useState } from "react";
import PatientRegister from "./pages/PatientRegister";
import DoctorRegister from "./pages/DoctorRegister";
import AdminRegister from "./pages/AdminRegister";
import "./App.css";

function App() {
  const [role, setRole] = useState("patient");

  return (
    <div className="App">
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => setRole("patient")}>Patient</button>
        <button onClick={() => setRole("doctor")}>Doctor</button>
        <button onClick={() => setRole("admin")}>Admin</button>
      </div>

      {role === "patient" && <PatientRegister />}
      {role === "doctor" && <DoctorRegister />}
      {role === "admin" && <AdminRegister />}
    </div>
  );import React, { useState } from "react";
import PatientRegister from "./pages/PatientRegister";
import DoctorRegister from "./pages/DoctorRegister";
import AdminRegister from "./pages/AdminRegister";
import "./App.css";

function App() {
  const [role, setRole] = useState("patient");

  return (
    <div className="App" style={{ padding: "2rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Kalawa Health Registration</h1>

      {/* Role switcher buttons */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        {["patient", "doctor", "admin"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            style={{
              marginRight: "0.5rem",
              backgroundColor: role === r ? "#4CAF50" : "#e0e0e0",
              color: role === r ? "white" : "black",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {r.charAt(0).toUpperCase() + r.slice(1)}
          </button>
        ))}
      </div>

      {/* Render registration page based on role */}
      <div className="registration-container">
        {role === "patient" && <PatientRegister />}
        {role === "doctor" && <DoctorRegister />}
        {role === "admin" && <AdminRegister />}
      </div>
    </div>
  );
}

export default App;

}

export default App;
