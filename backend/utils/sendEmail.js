const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-w-xl mx-auto; background-color: #f9fafb; padding: 40px; border-radius: 16px; border: 1px solid #e5e7eb;">
        <h2 style="color: #111827; font-weight: 900; letter-spacing: -0.5px;">SkillSphere</h2>
        <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">${options.message}</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
          Secure Automated Message • Do not reply directly to this email.
        </p>
      </div>
    `,
  };

  const info = await transporter.sendMail(message);
  console.log(`Email sent: ${info.messageId}`);
};

module.exports = sendEmail;