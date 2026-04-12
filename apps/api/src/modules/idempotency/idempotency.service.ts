import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async check(key: string): Promise<{ exists: boolean; result?: unknown }> {
    const existing = await this.prisma.idempotencyKey.findUnique({
      where: { key },
    });

    if (!existing) {
      return { exists: false };
    }

    if (existing.expiresAt && existing.expiresAt < new Date()) {
      await this.prisma.idempotencyKey.delete({ where: { key } });
      return { exists: false };
    }

    return { exists: true, result: existing.result };
  }

  async save(key: string, result: unknown, expiresInMs: number = 86400000) {
    await this.prisma.idempotencyKey.upsert({
      where: { key },
      create: {
        key,
        result: result as any,
        expiresAt: new Date(Date.now() + expiresInMs),
      },
      update: {
        result: result as any,
        expiresAt: new Date(Date.now() + expiresInMs),
      },
    });
  }

  async delete(key: string) {
    await this.prisma.idempotencyKey.delete({ where: { key } }).catch(() => {});
  }

  async cleanupExpired() {
    const result = await this.prisma.idempotencyKey.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });

    return { deleted: result.count };
  }
}