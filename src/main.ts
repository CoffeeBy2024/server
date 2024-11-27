import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import * as cookieParser from 'cookie-parser';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
    })
  );

  const options = new DocumentBuilder()
    .setTitle('CoffeeBy')
    .setDescription('Coffee application')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);

  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: configService.getOrThrow<string>('CLIENT_URL'),
    credentials: true,
  });

  await app.listen(configService.getOrThrow<string>('API_PORT'));
}
bootstrap();
