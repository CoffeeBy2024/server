import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { UserAgent } from 'src/common/decorators/user-agent.decorator';
import { Response, Request } from 'express';
import { Cookies } from 'src/common/decorators/cookies.decorator';
import { REFRESH_TOKEN } from './constants';
import { Token } from './entities/token.entity';
import { Public } from 'src/common/decorators/public.decorator';
import { UserResponseDto } from '@user/dto/user-response.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map, mergeMap, tap } from 'rxjs';
import { GoogleUserInfo, GoogleUserValidateResponse } from './types';
import { Provider } from '@user/entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.authService.register(dto, Provider.PASSWORD);
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

  @Public()
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

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as GoogleUserValidateResponse;
    res.redirect(
      `http://localhost:3001/auth/google/profile?access-token=${user.accessToken}`
    );
  }

  @Public()
  @Get('google/profile')
  googleProfile(
    @Query('access-token') accessToken: string,
    @UserAgent() agent: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return lastValueFrom(
      this.httpService
        .get<GoogleUserInfo>(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          params: {
            alt: 'json',
            access_token: accessToken,
          },
        })
        .pipe(
          mergeMap(
            ({ data: { email, given_name, family_name, email_verified } }) =>
              this.authService.providerAuth(
                {
                  email,
                  firstName: given_name,
                  lastName: family_name,
                  emailVerified: email_verified,
                },
                agent,
                Provider.GOOGLE
              )
          ),
          tap(({ refreshToken }) =>
            this.saveRefreshTokenToCookie(refreshToken, res)
          ),
          map(({ accessToken }) => accessToken),
          catchError((err) => {
            throw new BadRequestException(err.message);
          })
        )
    );
  }

  private saveRefreshTokenToCookie(refreshToken: Token, res: Response) {
    res.cookie(REFRESH_TOKEN, refreshToken.value, {
      httpOnly: true,
      expires: new Date(refreshToken.expiresAt),
    });
  }

  private removeRefreshTokenFromCookie(res: Response) {
    res.clearCookie(REFRESH_TOKEN);
  }
}
