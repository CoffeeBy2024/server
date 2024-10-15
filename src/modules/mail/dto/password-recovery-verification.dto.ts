import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class PasswordRecoveryVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  passwordRecoveryVerificationLink: string;
}
