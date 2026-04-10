import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  await app.init();
  console.log('Worker started successfully');
}

bootstrap();