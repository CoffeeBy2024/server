import { RegisterUserDto } from '@auth/dto';
import { PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EmailVerificationDto extends PickType(RegisterUserDto, [
  'email',
] as const) {
  @IsNotEmpty()
  @IsString()
  emailVerificationLink: string;
}
