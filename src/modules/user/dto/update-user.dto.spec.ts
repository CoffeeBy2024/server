import { validate } from 'class-validator';
import {
  // testNegativeDtoPropertyIsNotEmpty,
  // testNegativeDtoConfirmPasswordNotMatch,
  // testNegativeDtoPropertyIsNotEmpty,
  testNegativeDtoPropertyIsString,
} from '@auth/dto/register-user.dto.spec';
// import { ResetPasswordDto } from './reset-password.dto';
// import { mockUser } from '@user/mocks';
// import { plainToInstance } from 'class-transformer';
import { UpdateUserDto } from './update-user.dto';
import { Provider } from '@user/entities';
import {
  testNegativeDtoPropertyIsBoolean,
  testNegativeDtoPropertyIsNotEnum,
  testPositiveDtoPropertyIsOptional,
} from './create-user.dto.spec';

describe('UpdateUserDto', () => {
  let dto: UpdateUserDto;

  const mockUpdateUserDto: UpdateUserDto = {
    emailVerificationLink: 'emailVerificationLink',
    emailVerified: true,
    firstName: 'firstName',
    lastName: 'lastName',
    provider: Provider.GOOGLE,
    passwordRecoveryVerificationLink: 'passwordRecoveryVerificationLink',
  };
  beforeEach(() => {
    dto = new UpdateUserDto();
  });
  afterEach(() => {
    dto = {} as UpdateUserDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockUpdateUserDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
    describe('emailVerificationLink', () => {
      it('should succeed with optional emailVerificationLink', async () => {
        await testPositiveDtoPropertyIsOptional<'emailVerificationLink'>(
          'emailVerificationLink',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('emailVerified', () => {
      it('should succeed with optional emailVerified', async () => {
        await testPositiveDtoPropertyIsOptional<'emailVerified'>(
          'emailVerified',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('firstName', () => {
      it('should succeed with optional firstName', async () => {
        await testPositiveDtoPropertyIsOptional<'firstName'>(
          'firstName',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('lastName', () => {
      it('should succeed with optional lastName', async () => {
        await testPositiveDtoPropertyIsOptional<'lastName'>(
          'lastName',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('provider', () => {
      it('should succeed with optional provider', async () => {
        await testPositiveDtoPropertyIsOptional<'provider'>(
          'provider',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('passwordRecoveryVerificationLink', () => {
      it('should succeed with optional passwordRecoveryVerificationLink', async () => {
        await testPositiveDtoPropertyIsOptional<'passwordRecoveryVerificationLink'>(
          'passwordRecoveryVerificationLink',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
  });

  describe('negative test', () => {
    describe('emailVerificationLink', () => {
      it('should fail if emailVerificationLink is not string', async () => {
        await testNegativeDtoPropertyIsString<'emailVerificationLink'>(
          'emailVerificationLink',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('emailVerified', () => {
      it('should fail if emailVerified is is not boolean', async () => {
        await testNegativeDtoPropertyIsBoolean<'emailVerified'>(
          'emailVerified',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('firstName', () => {
      it('should fail if firstName is not string', async () => {
        await testNegativeDtoPropertyIsString<'firstName'>(
          'firstName',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('lastName', () => {
      it('should fail if lastName is not string', async () => {
        await testNegativeDtoPropertyIsString<'lastName'>(
          'lastName',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('provider', () => {
      it('should fail if provider not enum', async () => {
        await testNegativeDtoPropertyIsNotEnum<'provider'>(
          'provider',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
    describe('passwordRecoveryVerificationLink', () => {
      it('should fail if passwordRecoveryVerificationLink is not string', async () => {
        await testNegativeDtoPropertyIsString<'passwordRecoveryVerificationLink'>(
          'passwordRecoveryVerificationLink',
          () => dto,
          mockUpdateUserDto
        );
      });
    });
  });
});
