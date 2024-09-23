import { IsEnum, IsNotEmpty } from 'class-validator';
import { CATEGORY } from '../../../common/enums/category.enum';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsEnum(CATEGORY)
  name: CATEGORY;
}
