import { Shop } from 'src/modules/shop/shop/entities/shop.entity';
import { IsNotEmpty } from 'class-validator';
import { Category } from '../../category/entities/category.entity';

export class CreateShopCategoryDto {
  @IsNotEmpty()
  shop: Shop;

  @IsNotEmpty()
  category: Category;
}
