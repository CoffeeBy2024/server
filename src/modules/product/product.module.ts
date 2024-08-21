import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ShopCategory } from '../shop/shop-category/entities/shop-category.entity';
import { ShopService } from '../shop/shop/shop.service';
import { ShopCategoryService } from '../shop/shop-category/shop-category.service';
import { Shop } from '../shop/shop/entities/shop.entity';
import { Category } from '../category/entities/category.entity';
import { CategoryService } from '../category/category.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ShopCategory, Shop, Category])],
  controllers: [ProductController],
  providers: [
    ProductService,
    ShopService,
    ShopCategoryService,
    CategoryService,
  ],
})
export class ProductModule {}
