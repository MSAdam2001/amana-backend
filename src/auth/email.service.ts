import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const apiKey = this.configService.get<string>('BREVO_API_KEY');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL_FOR_EMAILS');
    const fromEmail = this.configService.get<string>('BREVO_FROM_EMAIL');

    if (!apiKey || !frontendUrl || !fromEmail) {
      throw new Error('Missing required email config (BREVO_API_KEY, FRONTEND_URL_FOR_EMAILS, or BREVO_FROM_EMAIL)');
    }

    const verifyUrl = `${frontendUrl}/verify-email?token=${token}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #0F4C45;">Welcome to Amana</h2>
        <p>Click the button below to verify your email address and activate your account.</p>
        <a href="${verifyUrl}" style="display:inline-block; background:#C85A3F; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; margin-top:16px;">
          Verify my email
        </a>
        <p style="margin-top: 24px; color: #666; font-size: 13px;">
          If the button doesn't work, copy this link into your browser:<br/>
          ${verifyUrl}
        </p>
      </div>
    `;

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          sender: { email: fromEmail, name: 'Amana' },
          to: [{ email: to }],
          subject: 'Verify your Amana account',
          htmlContent,
          textContent: `Welcome to Amana. Verify your email: ${verifyUrl}`,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo API responded with ${response.status}: ${errorBody}`);
      }

      this.logger.log(`Verification email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Failed to send verification email to ${to}`, err instanceof Error ? err.stack : err);
      throw new InternalServerErrorException('Failed to send verification email');
    }
  }
}