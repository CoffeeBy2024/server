import { validate } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';
import { mockRegisterUserDto } from '@auth/mocks';
import {
  testNegativeDtoConfirmPasswordNotMatch,
  testNegativeDtoPropertyIsEmail,
  testNegativeDtoPropertyIsNotEmpty,
  testNegativeDtoPropertyIsString,
} from '@common/mocks';

describe('RegisterUserDto', () => {
  let dto: RegisterUserDto;

  beforeEach(() => {
    dto = new RegisterUserDto();
  });

  afterEach(() => {
    dto = {} as RegisterUserDto;
  });
  describe('positive tests', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockRegisterUserDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('negative tests', () => {
    describe('email', () => {
      it('should fail if email is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'email'>(
          'email',
          () => dto,
          mockRegisterUserDto
        );
        // const dto = getDto();
        // Object.assign(dto, mockDto, { email: '' });
        // const errors = await validate(dto);
        // expect(errors.length).toBeGreaterThan(0);
        // expect(errors[0].constraints?.isNotEmpty).toBeDefined();
      });
      it('should fail if email is invalid', async () => {
        await testNegativeDtoPropertyIsEmail<'email'>(
          'email',
          () => dto,
          mockRegisterUserDto
        );
        // const dto = getDto();
        // Object.assign(dto, mockDto, { email: 'invalid-email' });
        // const errors = await validate(dto);
        // expect(errors.length).toBeGreaterThan(0);
        // expect(errors[0].constraints?.isEmail).toBeDefined();
      });
    });
    describe('password', () => {
      it('should fail if password is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'password'>(
          'password',
          () => dto,
          mockRegisterUserDto
        );
      });
      it('should fail if password is not string', async () => {
        await testNegativeDtoPropertyIsString<'password'>(
          'password',
          () => dto,
          mockRegisterUserDto
        );
      });
    });
    describe('confirmPassword', () => {
      it('should fail if confirmPassword is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockRegisterUserDto
        );
      });

      it('should fail if confirmPassword is not string', async () => {
        await testNegativeDtoPropertyIsString<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockRegisterUserDto
        );
      });

      it('should fail if confirmPassword does not match password', async () => {
        await testNegativeDtoConfirmPasswordNotMatch<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockRegisterUserDto
        );
      });
    });
    describe('firstName', () => {
      it('should fail if firstName is not string', async () => {
        await testNegativeDtoPropertyIsString<'firstName'>(
          'firstName',
          () => dto,
          mockRegisterUserDto
        );
      });
      it('should fail if firstName is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'firstName'>(
          'firstName',
          () => dto,
          mockRegisterUserDto
        );
      });
    });
    describe('lastName', () => {
      it('should fail if lastName is not string', async () => {
        await testNegativeDtoPropertyIsString<'lastName'>(
          'lastName',
          () => dto,
          mockRegisterUserDto
        );
      });
      it('should fail if lastName is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'lastName'>(
          'lastName',
          () => dto,
          mockRegisterUserDto
        );
      });
    });
  });
});
