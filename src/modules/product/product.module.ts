import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ShopCategory } from '@shop/shop-category/entities';
import { ShopService } from '@shop/shop/shop.service';
import { ShopCategoryService } from '@shop/shop-category/shop-category.service';
import { Shop } from '@shop/shop/entities';
import { Category } from '@category/entities/category.entity';
import { CategoryService } from '@category/category.service';
import { PhotoModule } from '@photo/photo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ShopCategory, Shop, Category]),
    PhotoModule,
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ShopService,
    ShopCategoryService,
    CategoryService,
  ],
})
export class ProductModule {}
