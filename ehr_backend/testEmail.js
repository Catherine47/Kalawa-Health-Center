import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Log only if you're debugging — can be commented out later
console.log("Loaded EMAIL_USER:", process.env.EMAIL_USER || "❌ Missing");
console.log("Loaded EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Loaded" : "❌ Missing");

async function sendTestEmail() {
  try {
    // Create a transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify the SMTP connection first
    await transporter.verify();
    console.log("✅ SMTP connection successful. Ready to send emails.");

    // Email details
    const mailOptions = {
      from: `"EHR Backend Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "✅ Test Email from EHR Backend",
      text: "This is a test email to confirm your Gmail app password setup is working.",
    };

    console.log("📤 Sending test email...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log("📨 Message ID:", info.messageId);
  } catch (error) {
    console.error("❌ Email sending failed:");
    console.error("Error message:", error.message);
    console.error("Full error:", error);
  }
}

// Run the test
sendTestEmail();
