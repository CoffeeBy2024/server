import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto, LoginUserDto } from './dto';
import { AuthService } from './auth.service';
import { UserAgent, Cookies, Public, NoCache } from '@common/decorators';
import { Response, Request, CookieOptions } from 'express';
import { COOKIES, QUERIES } from './constants';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, mergeMap, tap } from 'rxjs';
import { GoogleUserInfo, GoogleUserValidateResponse } from './types';
import { Provider } from '@user/entities';
import { ConfigService } from '@nestjs/config';

@NoCache()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    await this.authService.register(dto, Provider.PASSWORD);
    return {
      message: 'Register successful',
    };
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginUserDto,
    @UserAgent() agent: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.login(
      dto,
      agent
    );
    this.saveTokenToCookie(res, COOKIES.REFRESH_TOKEN, refreshToken);
    this.saveTokenToCookie(res, COOKIES.ACCESS_TOKEN, accessToken);
    return {
      message: 'Login successful',
    };
  }

  @Get('logout')
  async logout(
    @Cookies(COOKIES.REFRESH_TOKEN) refreshTokenValue: string,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!refreshTokenValue) {
      throw new UnauthorizedException('Refresh token is missing');
    }

    const token = await this.authService.removeRefreshToken(refreshTokenValue);
    if (!token) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    this.removeValueFromCookies(res, COOKIES.REFRESH_TOKEN);
    this.removeValueFromCookies(res, COOKIES.ACCESS_TOKEN);

    return {
      message: 'Logout successful',
    };
  }

  @Public()
  @Get('refresh-tokens')
  async refreshTokens(
    @Cookies(COOKIES.REFRESH_TOKEN) cookieRefreshToken: string,
    @UserAgent() agent: string,
    @Res({ passthrough: true }) res: Response
  ) {
    if (!cookieRefreshToken) {
      throw new UnauthorizedException();
    }
    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      cookieRefreshToken,
      agent
    );
    this.saveTokenToCookie(res, COOKIES.REFRESH_TOKEN, refreshToken);
    this.saveTokenToCookie(res, COOKIES.ACCESS_TOKEN, accessToken);

    return {
      message: 'Tokens refreshed successfully',
    };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/redirect')
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req.user as GoogleUserValidateResponse;
    const redirectURI = `${this.configService.getOrThrow<string>('API_URL')}/auth/google/profile?${QUERIES.ACCESS_TOKEN}=${user.accessToken}`;
    res.redirect(redirectURI);
  }

  @Public()
  @Get('google/profile')
  async googleProfile(
    @Query(`${QUERIES.ACCESS_TOKEN}`) accessToken: string,
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
          tap(({ accessToken, refreshToken }) => {
            this.saveTokenToCookie(res, COOKIES.REFRESH_TOKEN, refreshToken);
            this.saveTokenToCookie(res, COOKIES.ACCESS_TOKEN, accessToken);
            res.redirect(this.configService.getOrThrow<string>('CLIENT_URL'));
          }),
          catchError((err) => {
            throw new BadRequestException(err.message);
          })
        )
    );
  }

  private saveTokenToCookie<T extends { value: string; expiresAt: Date }>(
    res: Response,
    key: string,
    { value, expiresAt }: T,
    options?: Omit<CookieOptions, 'httpOnly' | 'expires'>
  ) {
    this.saveValueToCookie(res, key, value, {
      httpOnly: true,
      expires: expiresAt,
      ...options,
    });
  }

  private saveValueToCookie(
    res: Response,
    key: string,
    value: string,
    options: CookieOptions
  ) {
    res.cookie(key, value, options);
  }

  private removeValueFromCookies(res: Response, key: string) {
    res.clearCookie(key);
  }
}
