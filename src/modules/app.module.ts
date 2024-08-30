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
import { UserModule } from '@user/user.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { SendgridModule } from '@sendgrid/sendgrid.module';
import { MailModule } from '@mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    UserModule,
    AuthModule,
    SendgridModule,
    MailModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
