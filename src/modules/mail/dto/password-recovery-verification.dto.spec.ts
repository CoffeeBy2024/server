import { validate } from 'class-validator';
import { mockPasswordRecoveryVerificationDto } from '@mail/mocks/mail.mock';
import {
  testNegativeDtoPropertyIsEmail,
  testNegativeDtoPropertyIsNotEmpty,
  testNegativeDtoPropertyIsString,
} from '@auth/dto/register-user.dto.spec';
import { PasswordRecoveryVerificationDto } from './password-recovery-verification.dto';

describe('PasswordRecoveryVerificationDto', () => {
  let dto: PasswordRecoveryVerificationDto;

  beforeEach(() => {
    dto = new PasswordRecoveryVerificationDto();
  });
  afterEach(() => {
    dto = {} as PasswordRecoveryVerificationDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockPasswordRecoveryVerificationDto);
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
          mockPasswordRecoveryVerificationDto
        );
      });
      it('should fail if email is invalid', async () => {
        await testNegativeDtoPropertyIsEmail<'email'>(
          'email',
          () => dto,
          mockPasswordRecoveryVerificationDto
        );
      });
    });
    describe('passwordRecoveryVerificationLink', () => {
      it('should fail if passwordRecoveryVerificationLink is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'passwordRecoveryVerificationLink'>(
          'passwordRecoveryVerificationLink',
          () => dto,
          mockPasswordRecoveryVerificationDto
        );
      });
      it('should fail if passwordRecoveryVerificationLink not string', async () => {
        await testNegativeDtoPropertyIsString<'passwordRecoveryVerificationLink'>(
          'passwordRecoveryVerificationLink',
          () => dto,
          mockPasswordRecoveryVerificationDto
        );
      });
    });
  });
});
