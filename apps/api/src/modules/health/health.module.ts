import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { MetricsInterceptor } from '../../common/interceptors/metrics.interceptor';

@Module({
  controllers: [HealthController],
  providers: [MetricsInterceptor],
})
export class HealthModule {}