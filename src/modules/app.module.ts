import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { WorkingHoursModule } from './shop/working_hours/working_hours.module';
import { ShopModule } from './shop/shop/shop.module';
import { ShopCategoryModule } from './shop/shop-category/shop-category.module';
import { ProductModule } from './product/product.module';
import { CategoryModule } from './category/category.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TTLVariables } from 'src/utils/constants/cache';

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
    WorkingHoursModule,
    ShopModule,
    ShopCategoryModule,
    ProductModule,
    CategoryModule,
    CacheModule.register({
      max: 100,
      ttl: TTLVariables.common,
      isGlobal: true,
    }),
  ],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
  ],
  controllers: [AppController],
})
export class AppModule {}
