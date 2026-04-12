import { Injectable, Logger } from '@nestjs/common';

export interface WhatsAppSendParams {
  to: string;
  message: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class WhatsAppProvider {
  private readonly logger = new Logger(WhatsAppProvider.name);

  async sendMessage(params: WhatsAppSendParams): Promise<WhatsAppSendResult> {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken) {
      this.logger.warn('Twilio credentials not configured');
      return { success: false, error: 'Provider not configured' };
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: `whatsapp:${params.to}`,
            From: `whatsapp:${from}`,
            Body: params.message,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        this.logger.log(`WhatsApp sent to ${params.to}: ${data.sid}`);
        return { success: true, messageId: data.sid };
      }

      this.logger.error(`Failed to send WhatsApp: ${data.message}`);
      return { success: false, error: data.message };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error sending WhatsApp: ${message}`);
      return { success: false, error: message };
    }
  }
}