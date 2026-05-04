import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  correlationId: string;
  request: {
    method: string;
    path: string;
    ip: string;
  };
  response?: {
    statusCode: number;
    latencyMs: number;
  };
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip } = request;
    const correlationId = uuidv4();
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const latencyMs = Date.now() - now;
          const logEntry: LogEntry = {
            level: 'info',
            message: 'Request processed',
            timestamp: new Date().toISOString(),
            correlationId,
            request: { method, path: url, ip },
            response: { statusCode: 200, latencyMs },
          };
          this.logger.log(JSON.stringify(logEntry));
        },
        error: (error) => {
          const latencyMs = Date.now() - now;
          const logEntry: LogEntry = {
            level: 'error',
            message: error.message || 'Request failed',
            timestamp: new Date().toISOString(),
            correlationId,
            request: { method, path: url, ip },
            response: { statusCode: 500, latencyMs },
          };
          this.logger.error(JSON.stringify(logEntry));
        },
      }),
    );
  }
}