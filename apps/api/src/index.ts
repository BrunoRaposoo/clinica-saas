import { NestFactory } from '@nestjs/core';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {}
}

export * from './main';
export * from './app.module';