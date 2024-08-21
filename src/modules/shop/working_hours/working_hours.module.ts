import { Module } from '@nestjs/common';
import { WorkingHoursService } from './working_hours.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingHour } from './entities/working_hour.entity';
import { Shop } from '../shop/entities/shop.entity';
import { WorkingHoursController } from './working_hours.controller';
import { ShopService } from '../shop/shop.service';

@Module({
  imports: [TypeOrmModule.forFeature([WorkingHour, Shop])],
  controllers: [WorkingHoursController],
  providers: [WorkingHoursService, ShopService],
})
export class WorkingHoursModule {}
