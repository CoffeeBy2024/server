import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';
import { IsMilitaryTime } from '@common/validators';
import { Shop } from '@shop/shop/entities';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorkingHoursDto {
  @ApiProperty({ description: 'day ot the week' })
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(7)
  day_of_the_week: number;

  @ApiProperty({ description: 'opening hour' })
  @IsString()
  @IsNotEmpty()
  @IsMilitaryTime()
  open_hour: string;

  @ApiProperty({ description: 'closing hour' })
  @IsString()
  @IsNotEmpty()
  @IsMilitaryTime()
  close_hour: string;

  @ApiProperty({ description: 'Describes shop working hours' })
  shop: Shop;
}
