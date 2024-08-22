import { OmitType } from '@nestjs/swagger';
import { RegisterUserDto } from 'src/modules/auth/dto/register-user.dto';

export class CreateUserDto extends OmitType(RegisterUserDto, [
  'confirmPassword',
] as const) {}
