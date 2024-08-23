import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UserAgent } from 'src/common/decorators/user-agent.decorator';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(
    @Body() dto: LoginUserDto,
    @UserAgent() agent: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return this.authService.login(dto, agent, res);
  }

  @Get('logout')
  logout() {}

  @Get('refresh-token')
  refreshToken() {}
}
