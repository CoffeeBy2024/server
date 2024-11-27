import { Module } from '@nestjs/common';
import { WorkingHoursService } from './working_hours.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingHour } from './entities';
import { Shop } from '@shop/shop/entities';
import { WorkingHoursController } from './working_hours.controller';
import { ShopService } from '@shop/shop/shop.service';
import { PhotoModule } from '@photo/photo.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorkingHour, Shop]), PhotoModule],
  controllers: [WorkingHoursController],
  providers: [WorkingHoursService, ShopService],
})
export class WorkingHoursModule {}
