import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

export interface CancellationJobData {
  appointmentId: string;
  patientId: string;
  organizationId: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  templateId?: string;
  reason?: string;
}

export interface CancellationJobResult {
  success: boolean;
  message?: string;
  error?: string;
}

@Processor('notification:cancellation')
export class CancellationProcessor {
  private readonly logger = new Logger(CancellationProcessor.name);
  private readonly prisma = new PrismaClient();

  async process(job: Job<CancellationJobData>): Promise<CancellationJobResult> {
    const { appointmentId, patientId, organizationId, channel, templateId, reason } = job.data;

    this.logger.log(`Processing cancellation notification job ${job.id} for appointment ${appointmentId}`);

    try {
      const appointment = await this.prisma.appointment.findUnique({
        where: { id: appointmentId },
        include: {
          patient: {
            include: {
              contacts: true,
            },
          },
          professional: true,
        },
      });

      if (!appointment) {
        this.logger.error(`Appointment ${appointmentId} not found`);
        return { success: false, error: 'Appointment not found' };
      }

      const contact = channel === 'EMAIL'
        ? appointment.patient.contacts.find((c) => c.isPrimary && c.email)
        : appointment.patient.contacts.find((c) => c.isPrimary && c.phone);

      const recipient = channel === 'EMAIL' ? contact?.email : contact?.phone;

      if (!recipient) {
        this.logger.error(`No contact for patient ${patientId} on channel ${channel}`);
        throw new Error(`No contact found for channel ${channel}`);
      }

      const message = templateId
        ? await this.getTemplateMessage(templateId, appointment, reason)
        : this.getDefaultCancellationMessage(appointment, reason);

      await this.prisma.communication.create({
        data: {
          patientId,
          organizationId,
          appointmentId,
          templateId: templateId || null,
          channel,
          type: 'CANCELLATION',
          recipient,
          message,
          status: 'SENT',
          scheduledAt: new Date(),
          sentAt: new Date(),
        },
      });

      this.logger.log(`Cancellation notification sent for appointment ${appointmentId}`);
      return { success: true, message: `Cancellation notification sent to ${recipient}` };
    } catch (error) {
      this.logger.error(`Failed to process cancellation notification for appointment ${appointmentId}`, error);
      throw error;
    }
  }

  private async getTemplateMessage(templateId: string, appointment: any, reason?: string): Promise<string> {
    const template = await this.prisma.messageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return this.getDefaultCancellationMessage(appointment, reason);
    }

    return this.applyPlaceholders(template.body, appointment, reason);
  }

  private getDefaultCancellationMessage(appointment: any, reason?: string): string {
    const dateStr = new Date(appointment.dateTime).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = new Date(appointment.dateTime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    let message = `Sua consulta schedulada para ${dateStr} às ${timeStr} foi cancelada.`;
    if (reason) {
      message += ` Motivo: ${reason}.`;
    }
    message += ' Por favor, entre em contato para remarcar.';

    return message;
  }

  private applyPlaceholders(template: string, appointment: any, reason?: string): string {
    const patientName = appointment.patient.name;
    const dateStr = new Date(appointment.dateTime).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = new Date(appointment.dateTime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const professionalName = appointment.professional?.name || 'Professional';

    let message = template
      .replace(/\{\{patient_name\}\}/g, patientName)
      .replace(/\{\{appointment_date\}\}/g, dateStr)
      .replace(/\{\{appointment_time\}\}/g, timeStr)
      .replace(/\{\{professional_name\}\}/g, professionalName);

    if (reason) {
      message = message.replace(/\{\{cancellation_reason\}\}/g, reason);
    }

    return message;
  }
}