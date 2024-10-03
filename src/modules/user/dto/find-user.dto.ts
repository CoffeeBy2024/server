import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNumber } from 'class-validator';

export class FindUserDto extends PartialType(
  PickType(CreateUserDto, ['email'] as const)
) {
  @IsNumber()
  readonly id?: number;
}
