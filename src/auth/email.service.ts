import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${process.env.FRONTEND_URL_FOR_EMAILS}/verify-email?token=${token}`;

    await this.transporter.sendMail({
      from: `"Amana" <${process.env.GMAIL_USER}>`,
      to,
      subject: 'Verify your Amana account',
      html: `
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
      `,
    });
  }
}