import { RegisterUserDto } from '@auth/dto';
import { PickType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ResetPasswordDto extends PickType(RegisterUserDto, [
  'password',
  'confirmPassword',
] as const) {
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  id: number;

  @IsNotEmpty()
  @IsString()
  passwordRecoveryVerificationLink: string;
}
