import { RegisterUserDto } from '@auth/dto';
import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordByTokenDto extends PickType(RegisterUserDto, [
  'password',
  'confirmPassword',
] as const) {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}
