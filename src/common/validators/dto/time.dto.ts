import { IsMilitaryTime } from '../is-military-time.validator'; // Adjust the import path as necessary
import { IsNotEmpty } from 'class-validator';

export class TimeDto {
  @IsNotEmpty()
  @IsMilitaryTime()
  time: string;
}
