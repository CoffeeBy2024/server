import { Module } from '@nestjs/common';
import { ShopCategoryService } from './shop-category.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ShopCategory } from './entities';
import { Product } from '@product/entities';
import { Shop } from '@shop/shop/entities';
import { Category } from '@category/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ShopCategory, Product, Shop, Category])],
  providers: [ShopCategoryService],
})
export class ShopCategoryModule {}
