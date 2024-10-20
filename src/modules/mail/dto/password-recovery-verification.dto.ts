import { RegisterUserDto } from '@auth/dto';
import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PasswordRecoveryVerificationDto extends PickType(RegisterUserDto, [
  'email',
] as const) {
  @IsNotEmpty()
  @IsString()
  passwordRecoveryVerificationLink: string;
}
