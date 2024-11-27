import { validate } from 'class-validator';
import { mockVerifyEmailDto } from '@mail/mocks/mail.mock';
import { testNegativeDtoPropertyIsEmail } from '@auth/dto/register-user.dto.spec';
import { FindUserDto } from './find-user.dto';
import { mockUser } from '@user/mocks';
import { testPositiveDtoPropertyIsOptional } from './create-user.dto.spec';

export const testNegativeDtoPropertyIsNumber = async <
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
  Object.assign(dto, mockDto, { [propertyName]: '123' });
  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0]?.constraints?.isNumber).toBeDefined();
};

describe('FindUserDto', () => {
  let dto: FindUserDto;

  const mockFindUserDto: FindUserDto = {
    email: mockUser.email,
    id: mockUser.id,
  };
  beforeEach(() => {
    dto = new FindUserDto();
  });
  afterEach(() => {
    dto = {} as FindUserDto;
  });

  describe('positive test', () => {
    it('should succeed with valid data', async () => {
      Object.assign(dto, mockVerifyEmailDto);
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
    describe('email', () => {
      it('should succeed with optional email', async () => {
        await testPositiveDtoPropertyIsOptional<'email'>(
          'email',
          () => dto,
          mockFindUserDto
        );
      });
    });
    describe('id', () => {
      it('should succeed with optional id', async () => {
        await testPositiveDtoPropertyIsOptional<'id'>(
          'id',
          () => dto,
          mockFindUserDto
        );
      });
    });
  });

  describe('negative test', () => {
    describe('email', () => {
      it('should fail if email is invalid', async () => {
        await testNegativeDtoPropertyIsEmail<'email', { email?: string }>(
          'email',
          () => dto,
          mockFindUserDto
        );
      });
    });
    describe('id', () => {
      it('should fail if id is not number', async () => {
        await testNegativeDtoPropertyIsNumber<'id', { id?: number }>(
          'id',
          () => dto,
          mockFindUserDto
        );
      });
    });
  });
});
