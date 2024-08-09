import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

export interface IsUniqueOptions {
  tableName: string;
  column: string;
}

@Injectable()
@ValidatorConstraint({ name: 'IsUnique', async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const { tableName, column }: IsUniqueOptions = args.constraints[0];

    try {
      const count = await this.entityManager
        .getRepository(tableName)
        .createQueryBuilder(tableName)
        .where(`${column} = :value`, { value })
        .getCount();

      return count === 0;
    } catch (error) {
      console.error('Error in IsUniqueConstraint:', error);
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    const { column }: IsUniqueOptions = args.constraints[0];
    return `${column} must be unique.`;
  }
}

export function IsUnique(
  options: IsUniqueOptions,
  validationOptions?: ValidationOptions
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsUnique',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueConstraint,
    });
  };
}
