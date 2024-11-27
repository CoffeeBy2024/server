import { mockUser } from '@user/mocks';
import { RecoverPasswordDto } from './recover-password.dto';
import { validate } from 'class-validator';
import {
  testNegativeDtoPropertyIsEmail,
  testNegativeDtoPropertyIsNotEmpty,
} from './register-user.dto.spec';

describe('RecoverPasswordDto', () => {
  let dto: RecoverPasswordDto;

  const mockRecoverPasswordDto: RecoverPasswordDto = {
    email: mockUser.email,
  };
  beforeEach(() => {
    dto = new RecoverPasswordDto();
  });
  afterEach(() => {
    dto = {} as RecoverPasswordDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockRecoverPasswordDto);
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
          mockRecoverPasswordDto
        );
      });
      it('should fail if email is invalid', async () => {
        await testNegativeDtoPropertyIsEmail<'email'>(
          'email',
          () => dto,
          mockRecoverPasswordDto
        );
      });
    });
  });
});
