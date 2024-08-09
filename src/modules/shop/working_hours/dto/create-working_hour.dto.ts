import { IsInt, IsNotEmpty, IsString, Min, Max } from 'class-validator';
import { IsMilitaryTime } from 'src/common/validators/is-military-time.validator';
import { Shop } from '../../shop/entities/shop.entity';
import { IsUnique } from 'src/common/validators/is-unique.validator';

export class CreateWorkingHoursDto {
  @IsInt()
  @IsNotEmpty()
  @IsUnique(
    { tableName: 'WorkingHour', column: 'day_of_the_week' },
    { message: 'Worikng Hours for this Day was already defined' }
  )
  @Min(1)
  @Max(7)
  day_of_the_week: number;

  @IsString()
  @IsNotEmpty()
  @IsMilitaryTime()
  open_hour: string;

  @IsString()
  @IsNotEmpty()
  @IsMilitaryTime()
  close_hour: string;

  shop: Shop;
}
