import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ArePasswordsMatches } from '@common/validators';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  @ArePasswordsMatches()
  readonly confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;
}
