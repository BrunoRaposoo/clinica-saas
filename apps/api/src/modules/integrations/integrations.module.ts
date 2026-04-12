import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { EmailProvider } from './providers/email.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';

@Module({
  controllers: [IntegrationsController],
  providers: [IntegrationsService, EmailProvider, WhatsAppProvider],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}