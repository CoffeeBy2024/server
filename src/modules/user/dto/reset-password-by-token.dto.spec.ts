import { validate } from 'class-validator';
import { ResetPasswordByTokenDto } from './reset-password-by-token.dto';
import {
  testNegativeDtoConfirmPasswordNotMatch,
  testNegativeDtoPropertyIsNotEmpty,
  testNegativeDtoPropertyIsString,
} from '@auth/dto/register-user.dto.spec';

describe('ResetPasswordByTokenDto', () => {
  let dto: ResetPasswordByTokenDto;

  const mockResetPasswordByTokenDto: ResetPasswordByTokenDto = {
    confirmPassword: '123',
    currentPassword: '132',
    password: '123',
  };
  beforeEach(() => {
    dto = new ResetPasswordByTokenDto();
  });
  afterEach(() => {
    dto = {} as ResetPasswordByTokenDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockResetPasswordByTokenDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('negative test', () => {
    describe('currentPassword', () => {
      it('should fail if currentPassword is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'currentPassword'>(
          'currentPassword',
          () => dto,
          mockResetPasswordByTokenDto
        );
      });
      it('should fail if currentPassword is not string', async () => {
        await testNegativeDtoPropertyIsString<'currentPassword'>(
          'currentPassword',
          () => dto,
          mockResetPasswordByTokenDto
        );
      });
    });
    describe('password', () => {
      it('should fail if password is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'password'>(
          'password',
          () => dto,
          mockResetPasswordByTokenDto
        );
      });
      it('should fail if password is not string', async () => {
        await testNegativeDtoPropertyIsString<'password'>(
          'password',
          () => dto,
          mockResetPasswordByTokenDto
        );
      });
    });
    describe('confirmPassword', () => {
      it('should fail if confirmPassword is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockResetPasswordByTokenDto
        );
      });
      it('should fail if confirmPassword does not match password', async () => {
        await testNegativeDtoConfirmPasswordNotMatch<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockResetPasswordByTokenDto
        );
        // Object.assign(dto, mockRegisterUserDto, {
        //   confirmPassword: 'differentPassword',
        // });
        // const errors = await validate(dto);
        // expect(errors.length).toBeGreaterThan(0);
        // expect(errors[0].constraints?.passwordsMatching).toBeDefined();
      });
      it('should fail if confirmPassword is not string', async () => {
        await testNegativeDtoPropertyIsString<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockResetPasswordByTokenDto
        );
      });
    });
  });
});
