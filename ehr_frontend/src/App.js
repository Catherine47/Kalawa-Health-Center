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
  );
}

export default App;
