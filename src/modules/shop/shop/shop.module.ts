import { Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shop } from './entities/shop.entity';
import { WorkingHour } from '../working_hours/entities/working_hour.entity';
import { WorkingHoursService } from '../working_hours/working_hours.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shop, WorkingHour])],
  controllers: [ShopController],
  providers: [ShopService, WorkingHoursService],
})
export class ShopModule {}
