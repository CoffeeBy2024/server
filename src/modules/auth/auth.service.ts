import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(dto: RegisterUserDto) {
    const user = await this.userService.getUser(dto.email);
    if (user) {
      throw new ConflictException(
        `The user with the email address '${user.email}' already exists`
      );
    }
    return this.userService.createUser(dto);
  }
}
