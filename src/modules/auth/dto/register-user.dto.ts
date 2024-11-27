import { IsEmail, IsNotEmpty, IsString, Validate } from 'class-validator';
import { PasswordsMatchingConstraint } from '@common/decorators';

export class RegisterUserDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  @Validate(PasswordsMatchingConstraint)
  readonly confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;
}
