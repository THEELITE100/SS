const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};

// If SMTP isn't configured yet, this logs a warning instead of throwing so
// registration/login still work end-to-end during initial setup. Once
// backend/.env has real SMTP_* values, emails send for real.
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`⚠️  Email not sent (SMTP not configured yet). Would have sent "${subject}" to ${to}`);
    return { skipped: true };
  }

  const mailTransporter = getTransporter();

  return mailTransporter.sendMail({
    from: process.env.EMAIL_FROM || '"SkillSphere" <no-reply@skillsphere.dev>',
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;
