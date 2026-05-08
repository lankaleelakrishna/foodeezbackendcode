import { Injectable, Logger } from '@nestjs/common';
import * as AWS from 'aws-sdk';

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
  private readonly ses: AWS.SES;
  private readonly fromAddress: string;

  constructor() {
    const region = process.env.AWS_REGION || 'us-east-1';
    this.fromAddress = process.env.SES_FROM_ADDRESS || `no-reply@${process.env.EMAIL_DOMAIN || 'example.com'}`;
    this.ses = new AWS.SES({ region });
  }

  async sendRestaurantCredentials(payload: SendCredentialsPayload) {
    await this.sendEmail(payload.email, payload.restaurantName, payload.password);
    await this.sendWhatsApp(payload.phone, payload.restaurantName, payload.password);
  }

  async sendPasswordReset(payload: SendPasswordResetPayload) {
    await this.sendPasswordResetEmail(payload.email, payload.resetToken);
    await this.sendWhatsAppPasswordReset(payload.phone, payload.resetToken);
  }

  private async sendEmail(email: string, restaurantName: string, password: string) {
    const enabled = process.env.SES_ENABLED === 'true';
    const subject = `Your ${restaurantName} partner login details`;
    const body = `Hello,

Your restaurant has been successfully registered.

Login email: ${email}
Temporary password: ${password}

Please use this password to log in and change it immediately.

Thank you.`;

    if (!enabled) {
      this.logger.log(`Email disabled; credentials for ${email}: ${body}`);
      return;
    }

    await this.ses
      .sendEmail({
        Source: this.fromAddress,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Text: { Data: body, Charset: 'UTF-8' },
          },
        },
      })
      .promise();

    this.logger.log(`Sent credentials email to ${email}`);
  }

  private async sendWhatsApp(phone: string, restaurantName: string, password: string) {
    const enabled = process.env.WHATSAPP_ENABLED === 'true';
    const message = `Hello from ${restaurantName}! Your partner login details are:\nTemporary password: ${password}`;
    if (!enabled) {
      this.logger.log(`WhatsApp disabled; message for ${phone}: ${message}`);
      return;
    }

    this.logger.log(`WhatsApp sending is enabled but not configured in this stub. Phone: ${phone}, message: ${message}`);
  }

  private async sendPasswordResetEmail(email: string, resetToken: string) {
    const enabled = process.env.SES_ENABLED === 'true';
    const subject = `Password reset for your restaurant partner account`;
    const body = `Hello,

A password reset request has been received for your partner account.

Reset token: ${resetToken}

If you did not request this, please contact support immediately.

Thank you.`;

    if (!enabled) {
      this.logger.log(`Email disabled; password reset for ${email}: ${body}`);
      return;
    }

    await this.ses
      .sendEmail({
        Source: this.fromAddress,
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Text: { Data: body, Charset: 'UTF-8' },
          },
        },
      })
      .promise();

    this.logger.log(`Sent password reset email to ${email}`);
  }

  private async sendWhatsAppPasswordReset(phone: string, resetToken: string) {
    const enabled = process.env.WHATSAPP_ENABLED === 'true';
    const message = `Password reset token: ${resetToken}`;
    if (!enabled) {
      this.logger.log(`WhatsApp disabled; reset message for ${phone}: ${message}`);
      return;
    }

    this.logger.log(`WhatsApp reset sending is enabled but not configured in this stub. Phone: ${phone}, message: ${message}`);
  }
}