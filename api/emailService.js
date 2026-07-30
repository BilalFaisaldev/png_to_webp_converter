const nodemailer = require('nodemailer');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOTPEmail(email, otp, username) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 465;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid rgba(255, 255, 255, 0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #6366f1; margin: 0;">⚡ Image to WebP Converter</h2>
        <p style="color: #94a3b8; font-size: 13px;">Email Address Verification</p>
      </div>
      <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin-top: 0; color: #cbd5e1;">Hello <strong>${username}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 14px;">Your 6-digit email verification code is:</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #10b981; background: #020617; padding: 12px 24px; border-radius: 8px; display: inline-block; margin: 12px 0;">
          ${otp}
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">This code is valid for 10 minutes. Do not share this code with anyone.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; font-size: 11px; color: #64748b;">
        Sent securely by Bilal Faisal dev | Image to WebP SaaS
      </div>
    </div>
  `;

  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      await transporter.sendMail({
        from: `"Image to WebP Security" <${smtpUser}>`,
        to: email,
        subject: `Your Verification Code: ${otp}`,
        html: htmlContent
      });

      console.log(`✉️ Real Email OTP sent successfully to ${email}`);
      return { success: true, mode: 'smtp' };
    } catch (err) {
      console.error('❌ Nodemailer SMTP Error:', err.message);
    }
  }

  // Fallback Simulator (Console log)
  console.log(`\n==================================================`);
  console.log(`📧 [EMAIL OTP SIMULATION] Destination: ${email}`);
  console.log(`🔑 Verification OTP Code: ${otp}`);
  console.log(`==================================================\n`);

  return { success: true, mode: 'simulated', otp };
}

module.exports = {
  generateOTP,
  sendOTPEmail
};
