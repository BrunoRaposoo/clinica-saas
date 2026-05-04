import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface Metrics {
  totalRequests: number;
  averageLatencyMs: number;
  errorCount: number;
  uptimeSeconds: number;
  lastRequest: number;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private logger = new Logger('Metrics');
  private metrics: Metrics = {
    totalRequests: 0,
    averageLatencyMs: 0,
    errorCount: 0,
    uptimeSeconds: 0,
    lastRequest: Date.now(),
  };
  private startTime = Date.now();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap({
        next: () => {
          this.metrics.totalRequests++;
          this.metrics.lastRequest = Date.now();
        },
        error: () => {
          this.metrics.errorCount++;
        },
      }),
    );
  }

  getMetrics(): Metrics {
    return {
      ...this.metrics,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}