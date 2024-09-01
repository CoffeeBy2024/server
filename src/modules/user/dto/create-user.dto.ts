import { OmitType } from '@nestjs/swagger';
import { RegisterUserDto } from '@auth/dto';

export class CreateUserDto extends OmitType(RegisterUserDto, [
  'confirmPassword',
] as const) {}
