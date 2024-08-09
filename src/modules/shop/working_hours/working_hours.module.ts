import { Module } from '@nestjs/common';
import { WorkingHoursService } from './working_hours.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkingHour } from './entities/working_hour.entity';
import { Shop } from '../shop/entities/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkingHour, Shop])],
  providers: [WorkingHoursService],
})
export class WorkingHoursModule {}
