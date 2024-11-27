import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Point } from 'typeorm';
import { WorkingHour } from '@shop/working_hours/entities';

export class CreateShopDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  coordinates: Point;

  @IsOptional()
  working_hours: WorkingHour[];
}
