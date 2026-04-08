import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IRateLimiter {
  check(key: string, limit: number, windowMs: number): Promise<boolean>;
  increment(key: string): Promise<void>;
  reset(key: string): Promise<void>;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class InMemoryRateLimiter implements IRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();

  async check(key: string, limit: number, windowMs: number): Promise<boolean> {
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || now > entry.resetAt) {
      return true;
    }

    return entry.count < limit;
  }

  async increment(key: string): Promise<void> {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      const configService = new ConfigService();
      const windowMs = configService.get('RATE_LIMIT_WINDOW_MS') || 900000;
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    entry.count++;
    this.store.set(key, entry);
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }
}