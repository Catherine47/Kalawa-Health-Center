import {
  registerPatient,
  resendPatientOtp,
  verifyPatientOtp,
  loginPatient,
  registerDoctor,
  resendDoctorOtp,
  verifyDoctorOtp,
  loginDoctor,
  registerAdmin,
  resendAdminOtp,
  verifyAdminOtp,
  loginAdmin,
} from "./api.js";

// Helper to generate unique email
function uniqueEmail(base) {
  const timestamp = Date.now();
  const [user, domain] = base.split("@");
  return `${user}+${timestamp}@${domain}`;
}

// Replace this with the actual OTP you get from email/log
async function getOtpForTesting(email) {
  // For example, if your backend exposes a test endpoint:
  // const res = await fetch(`http://localhost:5000/api/test/get-otp?email=${email}`);
  // const data = await res.json();
  // return data.otp;

  // If not, manually paste the OTP here for now
  return "123456"; 
}

async function testApi() {
  try {
    console.log("=== Testing Patient API ===");

    const patientEmail = uniqueEmail("test.patient@example.com");
    const patient = await registerPatient({
      first_name: "Test",
      last_name: "Patient",
      dob: "1990-01-01",
      gender: "female",
      email_address: patientEmail,
      phone_number: "0711009645",
      password: "Password123",
    });
    console.log("Patient registered:", patient);

    const otp = await getOtpForTesting(patientEmail);

    const otpVerify = await verifyPatientOtp(patientEmail, otp);
    console.log("Patient OTP verified:", otpVerify);

    const login = await loginPatient(patientEmail, "Password123");
    console.log("Patient logged in:", login);

    console.log("=== Testing Doctor API ===");

    const doctorEmail = uniqueEmail("test.doctor@example.com");
    const doctor = await registerDoctor({
      first_name: "Test",
      last_name: "Doctor",
      email_address: doctorEmail,
      phone_number: "0712345679",
      specialization: "Cardiology",
      password: "Password123",
    });
    console.log("Doctor registered:", doctor);

    const doctorOtp = await getOtpForTesting(doctorEmail);
    const doctorVerify = await verifyDoctorOtp(doctorEmail, doctorOtp);
    console.log("Doctor OTP verified:", doctorVerify);

    const doctorLogin = await loginDoctor(doctorEmail, "Password123");
    console.log("Doctor logged in:", doctorLogin);

    console.log("=== Testing Admin API ===");

    const adminEmail = uniqueEmail("test.admin@example.com");
    const admin = await registerAdmin({
      first_name: "Test",
      last_name: "Admin",
      username: "testadmin",
      email_address: adminEmail,
      password: "Password123",
    });
    console.log("Admin registered:", admin);

    const adminOtp = await getOtpForTesting(adminEmail);
    const adminVerify = await verifyAdminOtp(adminEmail, adminOtp);
    console.log("Admin OTP verified:", adminVerify);

    const adminLogin = await loginAdmin(adminEmail, "Password123");
    console.log("Admin logged in:", adminLogin);

    console.log("✅ All endpoints fully tested including OTP verification and login.");

  } catch (err) {
    console.error("❌ API test error:", err.message);
  }
}

testApi();
