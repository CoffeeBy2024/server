import { validate } from 'class-validator';
import { EmailVerificationDto } from './email-verification.dto';
import { mockVerifyEmailDto } from '@mail/mocks/mail.mock';
import {
  testNegativeDtoPropertyIsEmail,
  testNegativeDtoPropertyIsNotEmpty,
  testNegativeDtoPropertyIsString,
} from '@auth/dto/register-user.dto.spec';

describe('EmailVerificationDto', () => {
  let dto: EmailVerificationDto;

  beforeEach(() => {
    dto = new EmailVerificationDto();
  });
  afterEach(() => {
    dto = {} as EmailVerificationDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockVerifyEmailDto);
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
          mockVerifyEmailDto
        );
      });
      it('should fail if email is invalid', async () => {
        await testNegativeDtoPropertyIsEmail<'email'>(
          'email',
          () => dto,
          mockVerifyEmailDto
        );
      });
    });
    describe('emailVerificationLink', () => {
      it('should fail if emailVerificationLink is missing', async () => {
        await testNegativeDtoPropertyIsNotEmpty<'emailVerificationLink'>(
          'emailVerificationLink',
          () => dto,
          mockVerifyEmailDto
        );
      });
      it('should fail if emailVerificationLink is not string', async () => {
        await testNegativeDtoPropertyIsString<'emailVerificationLink'>(
          'emailVerificationLink',
          () => dto,
          mockVerifyEmailDto
        );
      });
    });
  });
});
