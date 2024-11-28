import { Shop } from '@shop/shop/entities';
import { IsNotEmpty } from 'class-validator';
import { Category } from '@category/entities';

export class CreateShopCategoryDto {
  @IsNotEmpty()
  shop: Shop;

  @IsNotEmpty()
  category: Category;
}
