import { validate } from 'class-validator';
import { RegisterUserDto } from './register-user.dto';
import { mockRegisterUserDto } from '@auth/mocks';

export const testNegativeDtoPropertyIsString = async <
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
  Object.assign(dto, mockDto, { [propertyName]: 123 });
  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0]?.constraints?.isString).toBeDefined();
};

export const testNegativeDtoPropertyIsNotEmpty = async <
  PropertyName extends string,
  MockDto extends { [key in PropertyName]: any } = {
    [key in PropertyName]: any;
  },
>(
  propertyName: PropertyName,
  getTestDto: () => MockDto,
  mockDto: MockDto
) => {
  const dto = getTestDto();
  Object.assign(dto, mockDto, { [propertyName]: '' });
  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0]?.constraints?.isNotEmpty).toBeDefined();
};

export const testNegativeDtoPropertyIsEmail = async <
  PropertyName extends string,
  MockDto extends { [key in PropertyName]?: any } = {
    [key in PropertyName]: any;
  },
>(
  propertyName: PropertyName,
  getTestDto: () => MockDto,
  mockDto: MockDto
) => {
  const dto = getTestDto();
  Object.assign(dto, mockDto, { [propertyName]: 'invalid-email' });
  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0]?.constraints?.isEmail).toBeDefined();
};

export const testNegativeDtoConfirmPasswordNotMatch = async <
  PropertyName extends string,
  MockDto extends { [key in PropertyName]?: any } = {
    [key in PropertyName]: any;
  },
>(
  propertyName: PropertyName,
  getTestDto: () => MockDto,
  mockDto: MockDto
) => {
  const dto = getTestDto();
  Object.assign(dto, mockDto, {
    [propertyName]: 'differentPassword',
  });
  const errors = await validate(dto);
  expect(errors.length).toBeGreaterThan(0);
  expect(errors[0].constraints?.passwordsMatching).toBeDefined();
};

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
