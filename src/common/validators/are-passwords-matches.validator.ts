import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { RegisterUserDto } from '@auth/dto/register-user.dto';

export function ArePasswordsMatches(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'arePasswordsMatches',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(
          confirmPassword: string,
          validationArguments?: ValidationArguments
        ): Promise<boolean> | boolean {
          const obj = validationArguments?.object as RegisterUserDto;
          return confirmPassword === obj.password;
        },
        defaultMessage(): string {
          return "Passwords don't match";
        },
      },
    });
  };
}
