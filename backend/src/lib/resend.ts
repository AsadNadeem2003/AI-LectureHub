import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is missing in environment variables.");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export const sendInviteEmail = async (email: string, inviteToken: string) => {
  const fromEmail = process.env.INVITE_FROM_EMAIL || "onboarding@resend.dev";
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const inviteLink = `${frontendUrl}/set-password?token=${inviteToken}`;

  try {
    const data = await resend.emails.send({
      from: `AI LectureHub <${fromEmail}>`,
      to: [email],
      subject: "You've been invited to AI LectureHub",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Welcome to AI LectureHub!</h2>
          <p>You have been invited to join the platform.</p>
          <p>Please click the button below to set up your password and activate your account:</p>
          <div style="margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Set Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 14px; word-break: break-all;">${inviteLink}</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending invite email:", error);
    return { success: false, error };
  }
};
