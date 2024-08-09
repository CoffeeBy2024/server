import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsMilitaryTime(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isMilitaryTime',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          // Regular expression for (HH:MM) time representation
          const militaryTimeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
          return typeof value === 'string' && militaryTimeRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid military time format (HH:mm)`;
        },
      },
    });
  };
}
