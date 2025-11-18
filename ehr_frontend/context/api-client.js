// lib/api.js or context/api-client.js
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

/* ✅ Helper to get token from localStorage */
function getAuthHeaders() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("authToken");
    if (token) {
      return { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      };
    }
  }
  return { "Content-Type": "application/json" };
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

export async function getAllPatients() {
  const res = await fetch(`${API}/api/patients`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function getPatientById(id) {
  const res = await fetch(`${API}/api/patients/${id}`, {
    headers: getAuthHeaders(),
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

// ✅ UPDATED: getAllDoctors with better error handling
export async function getAllDoctors() {
  console.log("🔄 Fetching all doctors...");
  
  const headers = getAuthHeaders();
  console.log("🔑 Headers for doctors request:", headers);
  
  const res = await fetch(`${API}/api/doctors`, {
    headers: headers,
  });
  
  console.log("📡 Doctors response status:", res.status);
  
  if (!res.ok) {
    const error = await getError(res);
    console.error("❌ getAllDoctors failed:", error);
    throw error;
  }
  
  const doctors = await res.json();
  console.log("✅ Doctors fetched successfully:", doctors.length, "doctors");
  return doctors;
}

// ✅ ADDED: Get available doctors (public endpoint - no auth required)
export async function getAvailableDoctors() {
  console.log("🔄 Fetching available doctors (public endpoint)...");
  
  try {
    const res = await fetch(`${API}/api/doctors/public/available`);
    
    console.log("📡 Available doctors response status:", res.status);
    
    if (!res.ok) {
      const error = await getError(res);
      console.warn("⚠️ Public doctors endpoint failed, falling back to authenticated endpoint:", error.message);
      // Fallback to authenticated endpoint
      return getAllDoctors();
    }
    
    const doctors = await res.json();
    console.log("✅ Available doctors fetched successfully:", doctors.length, "doctors");
    return doctors;
  } catch (error) {
    console.error("❌ getAvailableDoctors failed:", error);
    // Fallback to authenticated endpoint
    return getAllDoctors();
  }
}

export async function getDoctorById(id) {
  const res = await fetch(`${API}/api/doctors/${id}`, {
    headers: getAuthHeaders(),
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

export async function getAllAdmins() {
  const res = await fetch(`${API}/api/admin`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

export async function getAdminById(id) {
  const res = await fetch(`${API}/api/admin/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

/* --------------------------- APPOINTMENT API --------------------------- */
// ✅ UPDATED: bookAppointment function - only sends fields that exist in the appointments table
export async function bookAppointment(appointmentData) {
  console.log("🚀 Booking appointment with data:", appointmentData);
  
  // Only send fields that actually exist in your appointments table
  const validAppointmentData = {
    patient_id: Number(appointmentData.patient_id),
    doctor_id: Number(appointmentData.doctor_id),
    appointment_date: appointmentData.appointment_date,
    appointment_time: appointmentData.appointment_time,
    status: appointmentData.status || "scheduled"
    // Remove: reason, department, notes since they don't exist in the table
  };
  
  console.log("📋 Valid appointment data (only existing fields):", validAppointmentData);
  
  const res = await fetch(`${API}/api/appointments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(validAppointmentData),
  });
  
  console.log("📡 Booking response status:", res.status);
  
  if (!res.ok) throw await getError(res);
  const result = await res.json();
  console.log("✅ Booking response data:", result);
  return result;
}

// ✅ FIXED: getPatientAppointments - use the correct endpoint that exists
export async function getPatientAppointments(patientId) {
  if (!patientId) {
    throw new Error("Patient ID is required to fetch appointments");
  }
  
  console.log("🔄 Fetching appointments for patient:", patientId);
  
  try {
    // ✅ FIX: Use the main appointments endpoint - your backend automatically filters by user role
    const endpoint = `${API}/api/appointments`;
    console.log("🔍 Using main appointments endpoint:", endpoint);
    
    const res = await fetch(endpoint, {
      headers: getAuthHeaders(),
    });
    
    console.log("📡 Response status:", res.status);
    
    if (res.ok) {
      const allAppointments = await res.json();
      console.log("📋 All appointments from server:", allAppointments);
      
      if (Array.isArray(allAppointments)) {
        // ✅ FIX: Filter for this patient's appointments using proper comparison
        const patientAppointments = allAppointments.filter(apt => {
          // Handle different possible field names and types
          const aptPatientId = apt.patient_id || apt.patientId;
          return aptPatientId == patientId || aptPatientId === Number(patientId);
        });
        
        console.log("👤 Patient's filtered appointments:", patientAppointments);
        return patientAppointments;
      }
    }
    
    // If the main endpoint fails, try the /my endpoint for patients
    console.log("🔄 Trying /my endpoint for patient-specific appointments");
    const myRes = await fetch(`${API}/api/appointments/my`, {
      headers: getAuthHeaders(),
    });
    
    if (myRes.ok) {
      const myAppointments = await myRes.json();
      console.log("✅ Appointments from /my endpoint:", myAppointments);
      return Array.isArray(myAppointments) ? myAppointments : [];
    }
    
    console.warn("⚠️ No appointments found or empty response");
    return [];
    
  } catch (error) {
    console.error("❌ Failed to fetch appointments:", error);
    throw error;
  }
}

// ✅ FIXED: Enhanced getUpcomingAppointments with proper date format handling
export async function getUpcomingAppointments(patientId) {
  const allAppointments = await getPatientAppointments(patientId);
  
  const now = new Date();
  
  console.log("🔄 Processing appointments for upcoming filter...");
  console.log("📋 Total appointments found:", allAppointments.length);
  
  const upcoming = allAppointments.filter(apt => {
    if (!apt.appointment_date) {
      console.log("❌ Skipping - no date:", apt.id);
      return false;
    }
    
    try {
      // ✅ FIX: Handle different date formats (DD/MM/YYYY vs YYYY-MM-DD)
      let appointmentDate;
      if (apt.appointment_date.includes('/')) {
        // Handle DD/MM/YYYY format
        const [day, month, year] = apt.appointment_date.split('/');
        appointmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // Handle YYYY-MM-DD format
        appointmentDate = new Date(apt.appointment_date);
      }
      
      // ✅ FIX: Handle time (convert 24-hour to proper time object)
      let appointmentDateTime = appointmentDate;
      if (apt.appointment_time) {
        const [hours, minutes, seconds] = apt.appointment_time.split(':').map(Number);
        appointmentDateTime = new Date(
          appointmentDate.getFullYear(),
          appointmentDate.getMonth(),
          appointmentDate.getDate(),
          hours || 0,
          minutes || 0,
          seconds || 0
        );
      }
      
      const isUpcoming = appointmentDateTime >= now;
      
      // ✅ FIX: Include 'pending' status
      const isValidStatus = apt.status === "scheduled" || 
                           apt.status === "confirmed" || 
                           apt.status === "pending";
      
      console.log(`📅 Appointment ${apt.id}:`, {
        rawDate: apt.appointment_date,
        rawTime: apt.appointment_time,
        parsedDate: appointmentDateTime.toString(),
        isUpcoming: isUpcoming,
        status: apt.status,
        isValidStatus: isValidStatus
      });
      
      return isUpcoming && isValidStatus;
      
    } catch (error) {
      console.error("❌ Error parsing appointment:", apt, error);
      return false;
    }
  });
  
  console.log("🎯 FINAL - Upcoming appointments:", upcoming.length);
  return upcoming;
}

// ✅ FIXED: Get appointments with doctor names - prevents duplicate "Dr."
export async function getAppointmentsWithDoctors(patientId) {
  try {
    // Get appointments and doctors in parallel
    const [appointments, doctors] = await Promise.all([
      getPatientAppointments(patientId),
      getAvailableDoctors()
    ]);
    
    console.log("🔍 Raw doctors data:", doctors);
    console.log("🔍 Raw appointments data:", appointments);
    
    // Create a map of doctor_id -> doctor details
    const doctorsMap = {};
    doctors.forEach(doctor => {
      // ✅ FIX: Handle different ID field names
      const doctorId = doctor.doctor_id || doctor.id;
      if (doctorId) {
        doctorsMap[doctorId] = doctor;
        console.log(`👨‍⚕️ Mapped doctor ${doctorId}:`, doctor.first_name, doctor.last_name);
      }
    });
    
    console.log("🗺️ Doctors map:", doctorsMap);
    
    // Enhance appointments with doctor info
    const appointmentsWithDoctors = appointments.map(apt => {
      console.log(`🔍 Processing appointment:`, {
        appointment_id: apt.appointment_id,
        doctor_id: apt.doctor_id,
        doctor_data: doctorsMap[apt.doctor_id]
      });
      
      const doctor = doctorsMap[apt.doctor_id];
      
      // ✅ FIX: Prevent duplicate "Dr." - check if name already includes "Dr."
      let doctorName;
      if (doctor) {
        const fullName = `${doctor.first_name} ${doctor.last_name}`;
        // Check if the name already starts with "Dr." to avoid duplication
        if (doctor.first_name.startsWith('Dr.') || fullName.startsWith('Dr.')) {
          doctorName = fullName;
        } else {
          doctorName = `Dr. ${fullName}`;
        }
      } else {
        doctorName = `Doctor ${apt.doctor_id}`;
      }
      
      return {
        ...apt,
        doctor_name: doctorName,
        doctor_specialization: doctor?.specialization || "General Practitioner"
      };
    });
    
    console.log("✅ Final appointments with doctor names:", appointmentsWithDoctors);
    return appointmentsWithDoctors;
    
  } catch (error) {
    console.error("❌ Failed to get appointments with doctors:", error);
    // Fallback to regular appointments
    return await getPatientAppointments(patientId);
  }
}

// ✅ FIXED: Get upcoming appointments with doctor names
export async function getUpcomingAppointmentsWithDoctors(patientId) {
  const appointmentsWithDoctors = await getAppointmentsWithDoctors(patientId);
  
  const now = new Date();
  
  const upcoming = appointmentsWithDoctors.filter(apt => {
    if (!apt.appointment_date) return false;
    
    try {
      // Handle different date formats
      let appointmentDate;
      if (apt.appointment_date.includes('/')) {
        const [day, month, year] = apt.appointment_date.split('/');
        appointmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        appointmentDate = new Date(apt.appointment_date);
      }
      
      // Handle time
      let appointmentDateTime = appointmentDate;
      if (apt.appointment_time) {
        const [hours, minutes, seconds] = apt.appointment_time.split(':').map(Number);
        appointmentDateTime = new Date(
          appointmentDate.getFullYear(),
          appointmentDate.getMonth(),
          appointmentDate.getDate(),
          hours || 0,
          minutes || 0,
          seconds || 0
        );
      }
      
      const isUpcoming = appointmentDateTime >= now;
      const isValidStatus = apt.status === "scheduled" || 
                           apt.status === "confirmed" || 
                           apt.status === "pending";
      
      return isUpcoming && isValidStatus;
      
    } catch (error) {
      return false;
    }
  });
  
  console.log("🎯 Upcoming appointments with doctors:", upcoming);
  return upcoming;
}

export async function cancelAppointment(appointmentId) {
  const res = await fetch(`${API}/api/appointments/${appointmentId}/cancel`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

// ✅ ADDED: Get all appointments (for admin/doctors)
export async function getAllAppointments() {
  const res = await fetch(`${API}/api/appointments`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

// ✅ ADDED: Get appointment by ID
export async function getAppointmentById(appointmentId) {
  const res = await fetch(`${API}/api/appointments/${appointmentId}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

// ✅ ADDED: Update appointment
export async function updateAppointment(appointmentId, updateData) {
  const res = await fetch(`${API}/api/appointments/${appointmentId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(updateData),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}

// ✅ ADDED: Delete appointment (soft delete)
export async function deleteAppointment(appointmentId) {
  const res = await fetch(`${API}/api/appointments/${appointmentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw await getError(res);
  return res.json();
}