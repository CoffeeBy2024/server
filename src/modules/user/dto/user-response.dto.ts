import { Provider, User } from '@user/entities/user.entity';
import { Exclude } from 'class-transformer';
import { RegisterUserDto } from 'src/modules/auth/dto/register-user.dto';
import { Token } from 'src/modules/auth/entities/token.entity';

type UserResponseDtoType = User & RegisterUserDto;

export class UserResponseDto implements UserResponseDtoType {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  provider: Provider;
  emailVerified: boolean;
  emailVerificationLink: string;

  @Exclude()
  password: string;

  @Exclude()
  confirmPassword: string;

  location: string;
  tokens: Token[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
