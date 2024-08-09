import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Point } from 'typeorm';
import { WorkingHour } from '../../working_hours/entities/working_hour.entity';

export class CreateShopDto {
  @IsOptional()
  @IsNotEmpty()
  coordinates: Point;

  @IsArray()
  @ValidateNested({ each: true })
  working_hours: WorkingHour[];
}
