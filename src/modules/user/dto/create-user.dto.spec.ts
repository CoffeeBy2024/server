import { passwordDto } from '@user/mocks';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import {
  testNegativeDtoPropertyIsEmail,
  testNegativeDtoPropertyIsNotEmpty,
  testNegativeDtoPropertyIsString,
} from '@auth/dto/register-user.dto.spec';

export const testNegativeDtoPropertyIsBoolean = async <
  PropertyName extends string,
  MockDto extends { [key in PropertyName]?: any } = {
    [key in PropertyName]?: any;
  },
>(
  propertyName: PropertyName,
  getTestDto: () => MockDto,
  mockDto: MockDto
) => {
  const dto = getTestDto();
  Object.assign(dto, mockDto, { [propertyName]: 123 });
  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0]?.constraints?.isBoolean).toBeDefined();
};

export const testNegativeDtoPropertyIsNotEnum = async <
  PropertyName extends string,
  MockDto extends { [key in PropertyName]?: any } = {
    [key in PropertyName]?: any;
  },
>(
  propertyName: PropertyName,
  getTestDto: () => MockDto,
  mockDto: MockDto
) => {
  const dto = getTestDto();
  Object.assign(dto, mockDto, { [propertyName]: 123 });
  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0]?.constraints?.isEnum).toBeDefined();
};

export const testPositiveDtoPropertyIsOptional = async <
  PropertyName extends string,
  MockDto extends { [key in PropertyName]?: any } = {
    [key in PropertyName]?: any;
  },
>(
  propertyName: PropertyName,
  getTestDto: () => MockDto,
  mockDto: MockDto
) => {
  const dto = getTestDto();
  Object.assign(dto, mockDto, { [propertyName]: undefined });
  const errors = await validate(dto);
  expect(errors.length).toBe(0);
};

describe('CreateUserDto', () => {
  let dto: CreateUserDto;

  beforeEach(() => {
    dto = new CreateUserDto();
  });
  afterEach(() => {
    dto = {} as CreateUserDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, passwordDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
    describe('lastName', () => {
      it('should succeed with optional lastName', async () => {
        await testPositiveDtoPropertyIsOptional<'lastName'>(
          'lastName',
          () => dto,
          passwordDto
        );
      });
    });
    describe('password', () => {
      it('should succeed with optional password', async () => {
        await testPositiveDtoPropertyIsOptional<'password'>(
          'password',
          () => dto,
          passwordDto
        );
      });
    });
    describe('emailVerificationLink', () => {
      it('should succeed with optional emailVerificationLink', async () => {
        await testPositiveDtoPropertyIsOptional<'emailVerificationLink'>(
          'emailVerificationLink',
          () => dto,
          passwordDto
        );
      });
    });
    describe('passwordRecoveryVerificationLink', () => {
      it('should succeed with optional passwordRecoveryVerificationLink', async () => {
        await testPositiveDtoPropertyIsOptional<'passwordRecoveryVerificationLink'>(
          'passwordRecoveryVerificationLink',
          () => dto,
          passwordDto
        );
      });
    });
  });

  describe('negative test', () => {
    describe('email', () => {
      it('should fail if email is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'email'>(
          'email',
          () => dto,
          passwordDto
        );
      });
      it('should fail if email is invalid', async () => {
        await testNegativeDtoPropertyIsEmail<'email'>(
          'email',
          () => dto,
          passwordDto
        );
      });
    });
    describe('emailVerificationLink', () => {
      it('should fail if emailVerificationLink is not string', async () => {
        await testNegativeDtoPropertyIsString<
          'emailVerificationLink',
          { emailVerificationLink?: string }
        >('emailVerificationLink', () => dto, passwordDto);
      });
    });
    describe('emailVerified', () => {
      it('should fail if emailVerified is empty', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'emailVerified'>(
          'emailVerified',
          () => dto,
          passwordDto
        );
      });
      it('should fail if emailVerified in not boolean', async () => {
        await testNegativeDtoPropertyIsBoolean<'emailVerified'>(
          'emailVerified',
          () => dto,
          passwordDto
        );
      });
    });
    describe('firstName', () => {
      it('should fail if firstName is not string', async () => {
        await testNegativeDtoPropertyIsString<
          'firstName',
          { firstName?: string }
        >('firstName', () => dto, passwordDto);
      });
      // testNegativeRegisterUserDtoFirstName(() => dto, passwordDto);
    });
    describe('lastName', () => {
      it('should fail if lastName is not string', async () => {
        await testNegativeDtoPropertyIsString<
          'lastName',
          { lastName?: string }
        >('lastName', () => dto, passwordDto);
      });
    });
    describe('password', () => {
      it('should fail if password is not string', async () => {
        await testNegativeDtoPropertyIsString<
          'password',
          { password?: string }
        >('password', () => dto, passwordDto);
      });
    });
    describe('passwordRecoveryVerificationLink', () => {
      it('should fail if passwordRecoveryVerificationLink is not string', async () => {
        await testNegativeDtoPropertyIsString<
          'passwordRecoveryVerificationLink',
          { passwordRecoveryVerificationLink?: string }
        >('passwordRecoveryVerificationLink', () => dto, passwordDto);
      });
    });
    describe('provider', () => {
      it('should fail if provider is empty', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'provider'>(
          'provider',
          () => dto,
          passwordDto
        );
      });
      it('should fail if provider not enum', async () => {
        await testNegativeDtoPropertyIsNotEnum<'provider'>(
          'provider',
          () => dto,
          passwordDto
        );
      });
    });
  });
});
