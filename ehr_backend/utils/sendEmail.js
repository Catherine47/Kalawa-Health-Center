import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// ✅ Create transporter (works with Gmail, Outlook, Yahoo, etc.)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true" || false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

/**
 * ✅ Generic Send Email Function
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - HTML email content
 */
const sendEmail = async (to, subject, html) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("Missing required email parameters (to, subject, html)");
    }

    const sender = process.env.SMTP_USER || process.env.EMAIL_USER;

    const mailOptions = {
      from: `"Kalawa Health Center" <${sender}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    if (error.response) console.error("📩 SMTP Response:", error.response);
    throw new Error("Failed to send email. Please check SMTP configuration.");
  }
};

/**
 * ✅ Specialized OTP Email Sender
 * @param {string} to - Recipient email address
 * @param {string} otp - One-Time Password
 * @param {string} userType - User type (Patient, Doctor, Admin)
 */
export const sendOTPEmail = async (to, otp, userType = "User") => {
  const subject = `${userType} Email Verification OTP`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #2E86C1;">🔐 ${userType} Email Verification</h2>
      <p>Hello ${userType},</p>
      <p>Your One-Time Password (OTP) for verification is:</p>
      <h3 style="color: #1A5276; font-size: 24px;">${otp}</h3>
      <p>This OTP will expire in <strong>5 minutes</strong>.</p>
      <p>If you did not request this, please ignore this message.</p>
      <br>
      <p>Thank you,<br><strong>Kalawa Health Center System</strong></p>
    </div>
  `;
  return sendEmail(to, subject, html);
};

/**
 * 🧪 Test SMTP Connection
 * Run this manually to verify credentials before sending real emails
 */
export const testSMTPConnection = async () => {
  console.log("🔍 Testing SMTP connection...");
  try {
    await transporter.verify();
    console.log("✅ SMTP connection successful — ready to send emails.");
  } catch (error) {
    console.error("❌ SMTP connection failed:", error.message);
    if (error.code === "EAUTH") {
      console.error("⚠️  Authentication failed. Check your EMAIL_USER and EMAIL_PASS.");
    } else if (error.code === "ENOTFOUND") {
      console.error("⚠️  SMTP host not found. Verify SMTP_HOST.");
    } else {
      console.error("⚠️  Other SMTP error:", error);
    }
  }
};

// ✅ Default export for generic emails
export default sendEmail;
