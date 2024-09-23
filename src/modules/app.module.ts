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
import postgresDataSource from 'src/config/databases/postgres/postgres.source';
import mongodbDataSource from 'src/config/databases/mongodb/mongodb.source';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    TypeOrmModule.forRoot(postgresDataSource.options),
    TypeOrmModule.forRoot(mongodbDataSource.options),
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
