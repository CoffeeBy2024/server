import { validate } from 'class-validator';
import {
  testNegativeDtoConfirmPasswordNotMatch,
  testNegativeDtoPropertyIsNotEmpty,
  testNegativeDtoPropertyIsString,
} from '@auth/dto/register-user.dto.spec';
import { ResetPasswordDto } from './reset-password.dto';
import { mockUser } from '@user/mocks';
import { plainToInstance } from 'class-transformer';
import { testNegativeDtoPropertyIsNumber } from './find-user.dto.spec';

export const testNegativeDtoPropertyTransformToNumber = async <
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
  Object.assign(dto, mockDto, { [propertyName]: 'abc' });
  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0]?.constraints?.isNumber).toBeDefined();
};

describe('ResetPasswordDto', () => {
  let dto: ResetPasswordDto;

  const mockResetPasswordDto: ResetPasswordDto = {
    id: mockUser.id,
    password: 'password',
    confirmPassword: 'password',
    passwordRecoveryVerificationLink: 'passwordRecoveryVerificationLink',
  };
  beforeEach(() => {
    dto = new ResetPasswordDto();
  });
  afterEach(() => {
    dto = {} as ResetPasswordDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockResetPasswordDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
    it('should transform id from string to number', async () => {
      const dto = plainToInstance(ResetPasswordDto, {
        ...mockResetPasswordDto,
        id: `${mockUser.id}`,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(typeof dto.id).toBe('number');
    });
  });

  describe('negative test', () => {
    describe('id', () => {
      it('should fail if id is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'id'>(
          'id',
          () => dto,
          mockResetPasswordDto
        );
      });
      it('should fail if id is not valid number', async () => {
        await testNegativeDtoPropertyIsNumber<'id'>(
          'id',
          () => dto,
          mockResetPasswordDto
        );
      });
    });
    describe('passwordRecoveryVerificationLink', () => {
      it('should fail if passwordRecoveryVerificationLink is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'passwordRecoveryVerificationLink'>(
          'passwordRecoveryVerificationLink',
          () => dto,
          mockResetPasswordDto
        );
      });
      it('should fail if passwordRecoveryVerificationLink is not string', async () => {
        await testNegativeDtoPropertyIsString<'passwordRecoveryVerificationLink'>(
          'passwordRecoveryVerificationLink',
          () => dto,
          mockResetPasswordDto
        );
      });
    });
    describe('password', () => {
      it('should fail if password is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'password'>(
          'password',
          () => dto,
          mockResetPasswordDto
        );
      });
      it('should fail if password is not string', async () => {
        await testNegativeDtoPropertyIsString<'password'>(
          'password',
          () => dto,
          mockResetPasswordDto
        );
      });
    });
    describe('confirmPassword', () => {
      it('should fail if confirmPassword is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockResetPasswordDto
        );
      });
      it('should fail if confirmPassword does not match password', async () => {
        await testNegativeDtoConfirmPasswordNotMatch<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockResetPasswordDto
        );
      });
      it('should fail if confirmPassword is not string', async () => {
        await testNegativeDtoPropertyIsString<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockResetPasswordDto
        );
      });
    });
  });
});
