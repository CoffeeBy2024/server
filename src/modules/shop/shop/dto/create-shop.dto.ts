import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Point } from 'typeorm';
import { WorkingHour } from '../../working_hours/entities/working_hour.entity';

export class CreateShopDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsNotEmpty()
  coordinates: Point;

  @IsOptional()
  working_hours: WorkingHour[];
}
