import { validate } from 'class-validator';
import {
  testNegativeDtoPropertyIsEmail,
  testNegativeDtoPropertyIsNotEmpty,
  testNegativeDtoPropertyIsString,
} from './register-user.dto.spec';
import { LoginUserDto } from './login-user.dto';
import { mockLoginUserDto } from '@auth/mocks';

describe('LoginUserDto', () => {
  let dto: LoginUserDto;

  beforeEach(() => {
    dto = new LoginUserDto();
  });
  afterEach(() => {
    dto = {} as LoginUserDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockLoginUserDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('negative test', () => {
    describe('email', () => {
      it('should fail if email is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'email'>(
          'email',
          () => dto,
          mockLoginUserDto
        );
      });
      it('should fail if email is invalid', async () => {
        await testNegativeDtoPropertyIsEmail<'email'>(
          'email',
          () => dto,
          mockLoginUserDto
        );
      });
    });
    describe('password', () => {
      it('should fail if password is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'password'>(
          'password',
          () => dto,
          mockLoginUserDto
        );
      });
      it('should fail if password is not string', async () => {
        await testNegativeDtoPropertyIsString<'password'>(
          'password',
          () => dto,
          mockLoginUserDto
        );
      });
    });
  });
});
