// lib/api.js
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* --------------------------- HELPER --------------------------- */
async function getError(res) {
  try {
    const errorData = await res.json();
    return new Error(errorData.error || "API request failed");
  } catch {
    return new Error("API request failed");
  }
}

/* --------------------------- PATIENT API --------------------------- */
export async function registerPatient(formData) {
  const res = await fetch(`${API}/api/patients/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function resendPatientOtp(email_address) {
  const res = await fetch(`${API}/api/patients/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address }),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function verifyPatientOtp(email_address, otp) {
  const res = await fetch(`${API}/api/patients/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address, otp }),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function loginPatient(email_address, password) {
  const res = await fetch(`${API}/api/patients/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address, password }),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function getAllPatients(token) {
  const res = await fetch(`${API}/api/patients`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function getPatientById(id, token) {
  const res = await fetch(`${API}/api/patients/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

/* --------------------------- DOCTOR API --------------------------- */
export async function registerDoctor(formData) {
  const res = await fetch(`${API}/api/doctors/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function resendDoctorOtp(email_address) {
  const res = await fetch(`${API}/api/doctors/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address }),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function verifyDoctorOtp(email_address, otp) {
  const res = await fetch(`${API}/api/doctors/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address, otp }),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function loginDoctor(email_address, password) {
  const res = await fetch(`${API}/api/doctors/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address, password }),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function getAllDoctors(token) {
  const res = await fetch(`${API}/api/doctors`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function getDoctorById(id, token) {
  const res = await fetch(`${API}/api/doctors/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

/* --------------------------- ADMIN API --------------------------- */
export async function registerAdmin(formData) {
  const res = await fetch(`${API}/api/admin/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function resendAdminOtp(email_address) {
  const res = await fetch(`${API}/api/admin/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address }),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function verifyAdminOtp(email_address, otp) {
  const res = await fetch(`${API}/api/admin/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address, otp }),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function loginAdmin(email_address, password) {
  const res = await fetch(`${API}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email_address, password }),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function getAllAdmins(token) {
  const res = await fetch(`${API}/api/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function getAdminById(id, token) {
  const res = await fetch(`${API}/api/admin/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}
