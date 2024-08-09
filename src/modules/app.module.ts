import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { TestModule } from './test/test.module';
import { WorkingHoursModule } from './shop/working_hours/working_hours.module';
import { ShopModule } from './shop/shop/shop.module';
import { IsUniqueConstraint } from 'src/common/validators/is-unique.validator';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: ['dist/**/*.entity{.ts,.js}'],
      migrations: ['migrations/**/*.ts'],
      autoLoadEntities: true,
      synchronize: true,
    }),
    TestModule,
    WorkingHoursModule,
    ShopModule,
  ],
  providers: [AppService, IsUniqueConstraint],
  controllers: [AppController],
})
export class AppModule {}
