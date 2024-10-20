import { Provider } from '@user/entities';
import { UserResponseDto } from './user-response.dto';
import { plainToInstance } from 'class-transformer';

describe('UserResponseDto', () => {
  let dto: UserResponseDto;

  const mockUpdateUserDto: Partial<UserResponseDto> = {
    id: 1,
    emailVerificationLink: 'emailVerificationLink',
    emailVerified: true,
    firstName: 'firstName',
    lastName: 'lastName',
    provider: Provider.GOOGLE,
    password: 'abc',
    confirmPassword: 'abc',
    passwordRecoveryVerificationLink: 'passwordRecoveryVerificationLink',
  };
  beforeEach(() => {
    dto = new UserResponseDto(mockUpdateUserDto);
  });
  afterEach(() => {
    dto = {} as UserResponseDto;
  });
  it('should exclude password and confirmPassword when converting to plain object', () => {
    const plainUser = plainToInstance(UserResponseDto, dto);

    expect(plainUser.password).toBeUndefined();
    expect(plainUser.confirmPassword).toBeUndefined();
    expect(plainUser.id).toBe(mockUpdateUserDto.id);
    expect(plainUser.firstName).toBe(mockUpdateUserDto.firstName);
    expect(plainUser.lastName).toBe(mockUpdateUserDto.lastName);
  });

  it('should correctly assign properties from partial User', () => {
    const userResponseDto = new UserResponseDto(dto);

    expect(userResponseDto).toEqual(mockUpdateUserDto);
  });

  it('should handle partial User input with missing fields', () => {
    const partialUser = {
      id: dto.id,
      firstName: dto.firstName,
    };

    const userResponseDto = new UserResponseDto(partialUser);

    expect(userResponseDto.id).toBe(dto.id);
    expect(userResponseDto.firstName).toBe(dto.firstName);
    expect(userResponseDto.lastName).toBeUndefined();
  });
});
