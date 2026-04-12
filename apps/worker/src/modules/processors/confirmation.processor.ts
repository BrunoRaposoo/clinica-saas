import { Processor } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

export interface ConfirmationJobData {
  appointmentId: string;
  patientId: string;
  organizationId: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  templateId?: string;
}

export interface ConfirmationJobResult {
  success: boolean;
  message?: string;
  error?: string;
}

@Processor('notification:confirmation')
export class ConfirmationProcessor {
  private readonly logger = new Logger(ConfirmationProcessor.name);
  private readonly prisma = new PrismaClient();

  async process(job: Job<ConfirmationJobData>): Promise<ConfirmationJobResult> {
    const { appointmentId, patientId, organizationId, channel, templateId } = job.data;

    this.logger.log(`Processing confirmation job ${job.id} for appointment ${appointmentId}`);

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

      if (appointment.status === 'CANCELLED') {
        this.logger.log(`Appointment ${appointmentId} was cancelled, skipping confirmation`);
        return { success: true, message: 'Skipped - appointment cancelled' };
      }

      const contact = channel === 'EMAIL'
        ? appointment.patient.contacts.find((c: any) => c.isPrimary && c.email)
        : appointment.patient.contacts.find((c: any) => c.isPrimary && c.phone);

      const recipient = channel === 'EMAIL' ? contact?.email : contact?.phone;

      if (!recipient) {
        this.logger.error(`No contact for patient ${patientId} on channel ${channel}`);
        throw new Error(`No contact found for channel ${channel}`);
      }

      let message = templateId
        ? await this.getTemplateMessage(templateId, appointment)
        : this.getDefaultConfirmationMessage(appointment);

      await this.prisma.communication.create({
        data: {
          patientId,
          organizationId,
          appointmentId,
          templateId: templateId || null,
          channel,
          type: 'CONFIRMATION',
          recipient,
          message,
          status: 'SENT',
          scheduledAt: new Date(),
          sentAt: new Date(),
        },
      });

      this.logger.log(`Confirmation sent for appointment ${appointmentId}`);
      return { success: true, message: `Confirmation sent to ${recipient}` };
    } catch (error) {
      this.logger.error(`Failed to process confirmation for appointment ${appointmentId}`, error);
      throw error;
    }
  }

  private async getTemplateMessage(templateId: string, appointment: any): Promise<string> {
    const template = await this.prisma.messageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return this.getDefaultConfirmationMessage(appointment);
    }

    return this.applyPlaceholders(template.body, appointment);
  }

  private getDefaultConfirmationMessage(appointment: any): string {
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

    return `Sua consulta com ${professionalName} foi confirmada para ${dateStr} às ${timeStr}. Estamos te aguardando!`;
  }

  private applyPlaceholders(template: string, appointment: any): string {
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
    const serviceName = appointment.type;

    return template
      .replace(/\{\{patient_name\}\}/g, patientName)
      .replace(/\{\{appointment_date\}\}/g, dateStr)
      .replace(/\{\{appointment_time\}\}/g, timeStr)
      .replace(/\{\{professional_name\}\}/g, professionalName)
      .replace(/\{\{service_name\}\}/g, serviceName);
  }
}