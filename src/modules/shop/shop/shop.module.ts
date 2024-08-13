import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShopService } from './shop.service';
import { WorkingHoursService } from '../working_hours/working_hours.service';
import { ShopCategoryService } from '../shop-category/shop-category.service';

import { Shop } from './entities/shop.entity';
import { WorkingHour } from '../working_hours/entities/working_hour.entity';
import { ShopCategory } from '../shop-category/entities/shop-category.entity';
import { CategoryService } from '../category/category.service';
import { Category } from '../category/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Shop, WorkingHour, ShopCategory, Category]),
  ],
  controllers: [ShopController],
  providers: [
    ShopService,
    WorkingHoursService,
    ShopCategoryService,
    CategoryService,
  ],
})
export class ShopModule {}
