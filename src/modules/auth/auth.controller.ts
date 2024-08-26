import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Res,
  UnauthorizedException,
  UseInterceptors,
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
import { UserResponseDto } from '@user/dto/user-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.authService.register(dto);
    return new UserResponseDto(user);
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
  async logout(
    @Cookies(REFRESH_TOKEN) refreshTokenValue: string,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!refreshTokenValue) {
      return null;
    }
    const token = await this.authService.removeRefreshToken(refreshTokenValue);
    if (token) {
      this.removeRefreshTokenFromCookie(res);
    }
    return token;
  }

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

  private removeRefreshTokenFromCookie(res: Response) {
    res.cookie(REFRESH_TOKEN, '', {
      httpOnly: true,
      expires: new Date(),
    });
  }
}
