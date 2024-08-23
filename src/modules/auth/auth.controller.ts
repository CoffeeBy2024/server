import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UserAgent } from 'src/common/decorators/user-agent.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginUserDto, @UserAgent() agent: string) {
    return this.authService.login(dto, agent);
  }

  @Get('logout')
  logout() {}

  @Get('refresh-token')
  refreshToken() {}
}
