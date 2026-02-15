import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
const emailFrom = process.env.EMAIL_FROM ?? 'Pomodoro Forest <noreply@pomodoroforest.com>';

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  try {
    await getResend().emails.send({
      from: emailFrom,
      to: email,
      subject: 'Verifica tu cuenta — Pomodoro Forest',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #2E8B57, #1B5E20); display: inline-flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px;">🌲</span>
            </div>
            <h1 style="font-size: 24px; color: #111827; margin: 16px 0 8px;">Pomodoro Forest</h1>
          </div>
          <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
            Tu código de verificación es:
          </p>
          <div style="background: #F3F4F6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2E8B57;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #6B7280;">
            Este código expira en 15 minutos. Si no solicitaste esta verificación, ignora este correo.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error enviando email de verificación:', error);
    return false;
  }
}

export async function sendResetPasswordEmail(email: string, code: string): Promise<boolean> {
  try {
    await getResend().emails.send({
      from: emailFrom,
      to: email,
      subject: 'Restablecer contraseña — Pomodoro Forest',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #2E8B57, #1B5E20); display: inline-flex; align-items: center; justify-content: center;">
              <span style="font-size: 28px;">🌲</span>
            </div>
            <h1 style="font-size: 24px; color: #111827; margin: 16px 0 8px;">Pomodoro Forest</h1>
          </div>
          <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
            Tu código para restablecer la contraseña es:
          </p>
          <div style="background: #F3F4F6; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #2E8B57;">${code}</span>
          </div>
          <p style="font-size: 14px; color: #6B7280;">
            Este código expira en 15 minutos. Si no solicitaste restablecer tu contraseña, ignora este correo.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error('Error enviando email de reset:', error);
    return false;
  }
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
