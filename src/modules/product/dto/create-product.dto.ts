import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Category } from '../../category/entities/category.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsOptional()
  description: string;

  image: Buffer;

  @IsNotEmpty()
  category: Category;
}
