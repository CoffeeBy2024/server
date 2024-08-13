import { Module } from '@nestjs/common';
import { ShopCategoryService } from './shop-category.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShopCategory } from './entities/shop-category.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Shop } from '../shop/entities/shop.entity';
import { Category } from '../category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShopCategory, Product, Shop, Category])],
  providers: [ShopCategoryService],
})
export class ShopCategoryModule {}
