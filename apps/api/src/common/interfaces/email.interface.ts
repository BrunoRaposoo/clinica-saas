import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IEmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

@Injectable()
export class MockEmailService implements IEmailService {
  constructor(private readonly configService: ConfigService) {}

  async send(to: string, subject: string, body: string): Promise<void> {
    const logPath = this.configService.get('EMAIL_LOG_PATH') || './logs/emails';
    const fs = await import('fs');
    const path = await import('path');
    
    const logDir = path.dirname(logPath);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] To: ${to}\nSubject: ${subject}\n\n${body}\n\n---\n`;
    
    fs.appendFileSync(logPath, logEntry);
    console.log(`[EMAIL MOCK] Sent to: ${to}, Subject: ${subject}`);
  }
}