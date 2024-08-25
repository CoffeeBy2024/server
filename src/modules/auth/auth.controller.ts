import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UserAgent } from 'src/common/decorators/user-agent.decorator';
import { Response } from 'express';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { REFRESH_TOKEN } from './constants';
import { Token } from './entities/token.entity';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @UserAgent() agent: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const tokens = await this.authService.login(dto, agent);
    this.saveRefreshTokenToCookie(tokens.refreshToken, res);
    return tokens.accessToken;
  }

  @Get('logout')
  logout() {}

  @Get('refresh-tokens')
  async refreshTokens(
    @Cookies(REFRESH_TOKEN) refreshToken: string,
    @UserAgent() agent: string,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    this.saveRefreshTokenToCookie(tokens.refreshToken, res);
    return tokens.accessToken;
  }

  private saveRefreshTokenToCookie(refreshToken: Token, res: Response) {
    res.cookie(REFRESH_TOKEN, refreshToken.value, {
      httpOnly: true,
      expires: new Date(refreshToken.expiresAt),
    });
  }
}
