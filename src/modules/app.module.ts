import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { Test } from './test/entities/test.entity';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Test],
      migrations: ['migrations/**/*.ts'],
      synchronize: true,
    }),
    TestModule,
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
