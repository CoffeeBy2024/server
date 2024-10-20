import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNumber, IsOptional } from 'class-validator';

export class FindUserDto extends PartialType(
  PickType(CreateUserDto, ['email'] as const)
) {
  @IsOptional()
  @IsNumber()
  readonly id?: number;
}
