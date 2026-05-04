import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorRes = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    const errorMessage = typeof errorRes === 'object' 
      ? (errorRes as any).message || errorRes
      : errorRes;

    const result = {
      statusCode: status,
      message: errorMessage,
      error: typeof errorRes === 'object' ? (errorRes as any).error : 'Error',
      timestamp: new Date().toISOString(),
    };

    this.logger.error(
      JSON.stringify({
        level: 'error',
        message: errorMessage as string,
        timestamp: result.timestamp,
        statusCode: status,
      }),
    );

    response.status(status).json(result);
  }
}