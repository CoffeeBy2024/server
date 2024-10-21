import { validate } from 'class-validator';
import {
  testNegativeDtoConfirmPasswordNotMatch,
  testNegativeDtoPropertyIsNotEmpty,
  testNegativeDtoPropertyIsString,
} from '@auth/dto/register-user.dto.spec';
import { ResetPasswordByRecoverLinkDto } from './reset-password-by-recover-link.dto';
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

describe('ResetPasswordByRecoverLinkDto', () => {
  let dto: ResetPasswordByRecoverLinkDto;

  const mockResetPasswordByRecoverLinkDto: ResetPasswordByRecoverLinkDto = {
    id: mockUser.id,
    password: 'password',
    confirmPassword: 'password',
    passwordRecoveryVerificationLink: 'passwordRecoveryVerificationLink',
  };
  beforeEach(() => {
    dto = new ResetPasswordByRecoverLinkDto();
  });
  afterEach(() => {
    dto = {} as ResetPasswordByRecoverLinkDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockResetPasswordByRecoverLinkDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
    it('should transform id from string to number', async () => {
      const dto = plainToInstance(ResetPasswordByRecoverLinkDto, {
        ...mockResetPasswordByRecoverLinkDto,
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
          mockResetPasswordByRecoverLinkDto
        );
      });
      it('should fail if id is not valid number', async () => {
        await testNegativeDtoPropertyIsNumber<'id'>(
          'id',
          () => dto,
          mockResetPasswordByRecoverLinkDto
        );
      });
    });
    describe('passwordRecoveryVerificationLink', () => {
      it('should fail if passwordRecoveryVerificationLink is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'passwordRecoveryVerificationLink'>(
          'passwordRecoveryVerificationLink',
          () => dto,
          mockResetPasswordByRecoverLinkDto
        );
      });
      it('should fail if passwordRecoveryVerificationLink is not string', async () => {
        await testNegativeDtoPropertyIsString<'passwordRecoveryVerificationLink'>(
          'passwordRecoveryVerificationLink',
          () => dto,
          mockResetPasswordByRecoverLinkDto
        );
      });
    });
    describe('password', () => {
      it('should fail if password is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'password'>(
          'password',
          () => dto,
          mockResetPasswordByRecoverLinkDto
        );
      });
      it('should fail if password is not string', async () => {
        await testNegativeDtoPropertyIsString<'password'>(
          'password',
          () => dto,
          mockResetPasswordByRecoverLinkDto
        );
      });
    });
    describe('confirmPassword', () => {
      it('should fail if confirmPassword is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockResetPasswordByRecoverLinkDto
        );
      });
      it('should fail if confirmPassword does not match password', async () => {
        await testNegativeDtoConfirmPasswordNotMatch<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockResetPasswordByRecoverLinkDto
        );
      });
      it('should fail if confirmPassword is not string', async () => {
        await testNegativeDtoPropertyIsString<'confirmPassword'>(
          'confirmPassword',
          () => dto,
          mockResetPasswordByRecoverLinkDto
        );
      });
    });
  });
});
