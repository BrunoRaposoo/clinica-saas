import { MessageChannel, CommunicationStatus, SendParams, SendResult } from '@clinica-saas/contracts';

export interface IMessageProvider {
  channel: MessageChannel;
  send(params: SendParams): Promise<SendResult>;
  getStatus(messageId: string): Promise<CommunicationStatus>;
}

export class WhatsAppMockProvider implements IMessageProvider {
  channel: MessageChannel = 'whatsapp';

  async send(params: SendParams): Promise<SendResult> {
    console.log(`[WhatsAppMock] Sending to ${params.to}:`, params.body);
    
    await new Promise((resolve) => setTimeout(resolve, 100));

    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        providerMessageId: `wa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    }
    
    return {
      success: false,
      error: 'Mock WhatsApp failure - simulating error',
    };
  }

  async getStatus(messageId: string): Promise<CommunicationStatus> {
    const delivered = Math.random() > 0.5;
    return delivered ? 'delivered' : 'sent';
  }
}

export class EmailMockProvider implements IMessageProvider {
  channel: MessageChannel = 'email';

  async send(params: SendParams): Promise<SendResult> {
    console.log(`[EmailMock] Sending to ${params.to}:`, params.subject);
    
    await new Promise((resolve) => setTimeout(resolve, 100));

    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        providerMessageId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    }
    
    return {
      success: false,
      error: 'Mock Email failure - simulating error',
    };
  }

  async getStatus(messageId: string): Promise<CommunicationStatus> {
    return 'sent';
  }
}

export class SmsMockProvider implements IMessageProvider {
  channel: MessageChannel = 'sms';

  async send(params: SendParams): Promise<SendResult> {
    console.log(`[SmsMock] Sending to ${params.to}:`, params.body);
    
    await new Promise((resolve) => setTimeout(resolve, 100));

    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        providerMessageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    }
    
    return {
      success: false,
      error: 'Mock SMS failure - simulating error',
    };
  }

  async getStatus(messageId: string): Promise<CommunicationStatus> {
    return 'sent';
  }
}

export function getProvider(channel: MessageChannel): IMessageProvider {
  switch (channel) {
    case 'whatsapp':
      return new WhatsAppMockProvider();
    case 'email':
      return new EmailMockProvider();
    case 'sms':
      return new SmsMockProvider();
    default:
      return new WhatsAppMockProvider();
  }
}