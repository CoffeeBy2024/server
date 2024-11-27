import { PickType } from '@nestjs/swagger';
import { RegisterUserDto } from './register-user.dto';

export class RecoverPasswordDto extends PickType(RegisterUserDto, [
  'email',
] as const) {}
