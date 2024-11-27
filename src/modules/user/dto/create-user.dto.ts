import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { RegisterUserDto } from '@auth/dto';
import { Provider } from '@user/entities';
import { IsBoolean, IsEnum, IsNotEmpty } from 'class-validator';
import {
  EmailVerificationDto,
  PasswordRecoveryVerificationDto,
} from '@mail/dto';

const RegisterUserDtoBase = OmitType(RegisterUserDto, [
  'confirmPassword',
  'password',
  'lastName',
] as const);

const PartialRegisterUserDto = PartialType(
  PickType(RegisterUserDto, ['password', 'lastName'] as const)
);

const PartialEmailVerificationDto = PartialType(
  PickType(EmailVerificationDto, ['emailVerificationLink'] as const)
);

const PartialPasswordRecoveryDto = PartialType(
  PickType(PasswordRecoveryVerificationDto, [
    'passwordRecoveryVerificationLink',
  ] as const)
);

export class CreateUserDto extends IntersectionType(
  RegisterUserDtoBase,
  IntersectionType(
    PartialRegisterUserDto,
    IntersectionType(PartialEmailVerificationDto, PartialPasswordRecoveryDto)
  )
) {
  @IsNotEmpty()
  @IsEnum(Provider)
  provider: Provider;

  @IsNotEmpty()
  @IsBoolean()
  emailVerified: boolean;

  constructor(createUserDto?: CreateUserDto) {
    super();

    if (createUserDto) {
      Object.assign(
        this,
        Object.fromEntries(
          Object.entries(createUserDto).filter(
            ([key]) => key !== 'confirmPassword'
          )
        )
      );
    }
  }
}
