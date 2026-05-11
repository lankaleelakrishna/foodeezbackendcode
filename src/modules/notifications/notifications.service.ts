import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SendCredentialsPayload {
  email: string;
  phone: string;
  password: string;
  restaurantName: string;
}

export interface SendPasswordResetPayload {
  email: string;
  phone: string;
  resetToken: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendRestaurantCredentials(payload: SendCredentialsPayload) {
    const subject = `Restaurant Partner Login Details`;

    const body = `
Hello,

Your restaurant "${payload.restaurantName}" has been successfully registered.

Login Email: ${payload.email}
Temporary Password: ${payload.password}

Please login and change your password immediately.

Thank you.
`;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: payload.email,
      subject,
      text: body,
    });

    this.logger.log(`Credentials email sent to ${payload.email}`);
  }

  async sendPasswordReset(payload: SendPasswordResetPayload) {
    const subject = `Password Reset Request`;

    const body = `
Hello,

A password reset request was received.

Reset Token: ${payload.resetToken}

Use this token to reset your password.

Thank you.
`;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: payload.email,
      subject,
      text: body,
    });

    this.logger.log(`Password reset email sent to ${payload.email}`);
  }
}