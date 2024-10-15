import { OmitType } from '@nestjs/swagger';
import { RegisterUserDto } from '@auth/dto';
import { Provider } from '@user/entities';

export class CreateUserDto extends OmitType(RegisterUserDto, [
  'confirmPassword',
  'password',
  'lastName',
] as const) {
  lastName?: string;
  password?: string;
  provider: Provider;
  emailVerified: boolean;
  emailVerificationLink?: string;
  passwordRecoveryVerificationLink?: string;

  constructor({
    email,
    emailVerificationLink,
    emailVerified,
    firstName,
    lastName,
    password,
    provider,
    passwordRecoveryVerificationLink,
  }: Partial<
    RegisterUserDto & {
      provider: Provider;
      emailVerified: boolean;
      emailVerificationLink?: string;
      passwordRecoveryVerificationLink?: string;
    }
  >) {
    super();
    Object.assign(this, {
      email,
      emailVerificationLink,
      emailVerified,
      firstName,
      lastName,
      password,
      provider,
      passwordRecoveryVerificationLink,
    });
  }
}
