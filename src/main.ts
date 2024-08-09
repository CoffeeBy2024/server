import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
