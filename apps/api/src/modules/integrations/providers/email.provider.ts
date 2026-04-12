import { Injectable, Logger } from '@nestjs/common';

export interface EmailSendParams {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);

  async sendEmail(params: EmailSendParams): Promise<EmailSendResult> {
    const apiKey = process.env.EMAIL_API_KEY;
    const from = params.from || process.env.EMAIL_FROM;

    if (!apiKey) {
      this.logger.warn('EMAIL_API_KEY not configured');
      return { success: false, error: 'Provider not configured' };
    }

    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: params.to }] }],
          from: { email: from },
          subject: params.subject,
          content: [{ type: 'text/plain', value: params.body }],
        }),
      });

      if (response.ok) {
        const messageId = response.headers.get('x-message-id') || undefined;
        this.logger.log(`Email sent to ${params.to}: ${messageId}`);
        return { success: true, messageId };
      }

      const error = await response.text();
      this.logger.error(`Failed to send email: ${error}`);
      return { success: false, error };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending email: ${message}`);
      return { success: false, error: message };
    }
  }
}