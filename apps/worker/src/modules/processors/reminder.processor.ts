import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';

export interface ReminderJobData {
  appointmentId: string;
  patientId: string;
  organizationId: string;
  channel: 'WHATSAPP' | 'EMAIL' | 'SMS';
  templateId?: string;
}

export interface ReminderJobResult {
  success: boolean;
  message?: string;
  error?: string;
}

@Processor('notification:reminder')
export class ReminderProcessor {
  private readonly logger = new Logger(ReminderProcessor.name);
  private readonly prisma = new PrismaClient();

  async process(job: Job<ReminderJobData>): Promise<ReminderJobResult> {
    const { appointmentId, patientId, organizationId, channel, templateId } = job.data;

    this.logger.log(`Processing reminder job ${job.id} for appointment ${appointmentId}`);

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

      if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
        this.logger.log(`Appointment ${appointmentId} is ${appointment.status}, skipping reminder`);
        return { success: true, message: 'Skipped - appointment already processed' };
      }

      const contact = channel === 'EMAIL'
        ? appointment.patient.contacts.find((c) => c.isPrimary && c.email)
        : appointment.patient.contacts.find((c) => c.isPrimary && c.phone);

      const recipient = channel === 'EMAIL' ? contact?.email : contact?.phone;

      if (!recipient) {
        this.logger.error(`No contact for patient ${patientId} on channel ${channel}`);
        throw new Error(`No contact found for channel ${channel}`);
      }

      let message = templateId
        ? await this.getTemplateMessage(templateId, appointment)
        : this.getDefaultReminderMessage(appointment);

      await this.prisma.communication.create({
        data: {
          patientId,
          organizationId,
          appointmentId,
          templateId: templateId || null,
          channel,
          type: 'REMINDER',
          recipient,
          message,
          status: 'SENT',
          scheduledAt: new Date(),
          sentAt: new Date(),
        },
      });

      this.logger.log(`Reminder sent for appointment ${appointmentId}`);
      return { success: true, message: `Reminder sent to ${recipient}` };
    } catch (error) {
      this.logger.error(`Failed to process reminder for appointment ${appointmentId}`, error);
      throw error;
    }
  }

  private async getTemplateMessage(templateId: string, appointment: any): Promise<string> {
    const template = await this.prisma.messageTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return this.getDefaultReminderMessage(appointment);
    }

    return this.applyPlaceholders(template.body, appointment);
  }

  private getDefaultReminderMessage(appointment: any): string {
    const dateStr = new Date(appointment.dateTime).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = new Date(appointment.dateTime).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `Lembrete: Você tem agendamento em ${dateStr} às ${timeStr}. Por favor, compareça 10 minutos antes.`;
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