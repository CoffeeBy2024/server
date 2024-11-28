import { validate } from 'class-validator';
import { PasswordDto } from './dto';
import { mockCorrectConfirmPasswordValue, mockPasswordValue } from './mocks';
import { testNegativeDtoConfirmPasswordNotMatch } from '@common/mocks';

describe('ArePasswordsMatches', () => {
  let dto: PasswordDto;

  beforeEach(() => {
    dto = new PasswordDto();
  });

  describe('Positive Tests', () => {
    it('should succeed matched passwords', async () => {
      Object.assign(dto, {
        password: mockPasswordValue,
        confirmPassword: mockCorrectConfirmPasswordValue,
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail if confirmPassword does not match password', async () => {
      await testNegativeDtoConfirmPasswordNotMatch<'confirmPassword'>(
        'confirmPassword',
        () => dto,
        dto
      );
    });
  });

  afterEach(() => {
    dto = {} as PasswordDto;
  });
});
