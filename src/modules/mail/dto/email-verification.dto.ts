import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class EmailVerificationDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  emailVerificationLink: string;
}
