import nodemailer from "nodemailer";
import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is missing in environment variables.");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

// Create Nodemailer Transporter using Gmail SMTP
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = parseInt(process.env.SMTP_PORT || "465", 10);
const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;

const transporter = (smtpUser && smtpPass)
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
  : null;

export const sendInviteEmail = async (email: string, inviteToken: string) => {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const inviteLink = `${frontendUrl}/set-password?token=${inviteToken}`;
  const subject = "You've been invited to AI LectureHub";
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
      <h2 style="color: #0f172a; margin-top: 0;">Welcome to AI LectureHub!</h2>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">You have been invited to join the platform as a student or faculty member.</p>
      <p style="color: #334155; font-size: 15px; line-height: 1.6;">Please click the button below to set up your secure password and activate your account:</p>
      <div style="margin: 32px 0;">
        <a href="${inviteLink}" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
          Set Password & Activate
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px;">If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="color: #4f46e5; font-size: 12px; word-break: break-all; font-family: monospace; background-color: #f1f5f9; padding: 8px; border-radius: 6px;">${inviteLink}</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="color: #94a3b8; font-size: 11px; margin-bottom: 0;">This invitation link will expire in 24 hours. If you did not expect this invitation, you can safely ignore this email.</p>
    </div>
  `;

  // 1. Primary: Send via Gmail SMTP (Nodemailer) for real unrestricted inbox delivery
  if (transporter) {
    try {
      const fromName = process.env.SMTP_FROM_NAME || "AI LectureHub";
      const fromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
      const info = await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject,
        html: htmlContent,
      });

      console.log(`📧 [Gmail SMTP] Invitation email delivered successfully to ${email} (MessageId: ${info.messageId})`);
      return { success: true, data: info };
    } catch (smtpErr: any) {
      console.warn(`⚠️ [Gmail SMTP Error]: ${smtpErr.message || smtpErr}. Falling back to Resend...`);
    }
  }

  // 2. Fallback: Send via Resend API
  try {
    const fromEmail = process.env.INVITE_FROM_EMAIL || "onboarding@resend.dev";
    const data = await resend.emails.send({
      from: `AI LectureHub <${fromEmail}>`,
      to: [email],
      subject,
      html: htmlContent,
    });
    console.log(`📧 [Resend] Invitation email dispatched to ${email}`);
    return { success: true, data };
  } catch (resendErr: any) {
    console.error("❌ [Resend Error]:", resendErr);
    return { success: false, error: resendErr };
  }
};
