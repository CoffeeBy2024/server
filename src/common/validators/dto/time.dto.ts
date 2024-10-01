import { IsMilitaryTime } from '../is-military-time.validator';
import { IsNotEmpty } from 'class-validator';

export class TimeDto {
  @IsNotEmpty()
  @IsMilitaryTime()
  time: string;
}
