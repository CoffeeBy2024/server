import { PartialType } from '@nestjs/mapped-types';
import { CreateShopCategoryDto } from './create-shop-category.dto';

export class UpdateShopCategoryDto extends PartialType(CreateShopCategoryDto) {}
