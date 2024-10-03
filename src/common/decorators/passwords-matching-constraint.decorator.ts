import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { RegisterUserDto } from 'src/modules/auth/dto/register-user.dto';

@ValidatorConstraint({ name: 'passwordsMatching', async: false })
export class PasswordsMatchingConstraint
  implements ValidatorConstraintInterface
{
  validate(
    confirmPassword: string,
    validationArguments?: ValidationArguments
  ): Promise<boolean> | boolean {
    const obj = validationArguments?.object as RegisterUserDto;
    return confirmPassword === obj.password;
  }

  defaultMessage(): string {
    return "Passwords don't match";
  }
}
