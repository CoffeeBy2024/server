import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ShopCategory } from '../shop/shop-category/entities/shop-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, ShopCategory])],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}