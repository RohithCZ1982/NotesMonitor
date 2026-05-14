import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS, // Gmail App Password (not your login password)
  },
});

export async function sendApprovalEmail(to: string, name: string): Promise<void> {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    logger.warn('Email not configured — skipping approval email');
    return;
  }

  const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';

  await transporter.sendMail({
    from: `"NotesMonitor" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Your NotesMonitor account has been approved!',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#0d9488;padding:32px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:12px;padding:12px 16px;margin-bottom:12px;">
                <span style="font-size:24px;">📚</span>
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">NotesMonitor</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 8px;color:#134e4a;font-size:20px;font-weight:700;">
                Account Approved! 🎉
              </h2>
              <p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">
                Hi <strong style="color:#111827;">${name}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Great news! Your NotesMonitor account has been <strong style="color:#0d9488;">approved by the admin</strong>.
                You can now log in and access all your course materials.
              </p>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 8px;color:#0f766e;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">What you can do now</p>
                    <p style="margin:0;color:#134e4a;font-size:14px;line-height:1.7;">
                      ✅ View folders assigned to your group<br/>
                      ✅ Preview images and videos<br/>
                      ✅ Download individual files or full folders as ZIP
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${appUrl}/login"
                       style="display:inline-block;background:#0d9488;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
                      Log In Now →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                This email was sent by NotesMonitor. If you did not register, please ignore this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  logger.info(`Approval email sent to ${to}`);
}

export async function sendRejectionEmail(to: string, name: string): Promise<void> {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) return;

  await transporter.sendMail({
    from: `"NotesMonitor" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Update on your NotesMonitor registration',
    html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:#0d9488;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">NotesMonitor</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px;color:#111827;font-size:20px;">Registration Update</h2>
              <p style="margin:0 0 16px;color:#6b7280;font-size:15px;line-height:1.6;">
                Hi <strong style="color:#111827;">${name}</strong>,
              </p>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                Unfortunately, your NotesMonitor registration could not be approved at this time.
                Please contact your admin for more information.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">NotesMonitor</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  logger.info(`Rejection email sent to ${to}`);
}
