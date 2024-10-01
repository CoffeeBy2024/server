import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterUserDto, LoginUserDto } from './dto';
import { AuthService } from './auth.service';
import { UserAgent, Cookies, Public } from '@common/decorators';
import { Response, Request } from 'express';
import { REFRESH_TOKEN } from './constants';
import { Token } from './entities';
import { UserResponseDto } from '@user/dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map, mergeMap, tap } from 'rxjs';
import { GoogleUserInfo, GoogleUserValidateResponse } from './types';
import { Provider } from '@user/entities';

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
    return {
      accessToken: tokens.accessToken,
      user: tokens.refreshToken.user,
    };
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
    return {
      refreshToken: token,
    };
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
    return {
      accessToken: tokens.accessToken,
      user: tokens.refreshToken.user,
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
    const redirectURI = `http://localhost:3000/auth/google?access-token=${user.accessToken}`;
    res.redirect(redirectURI);
    return redirectURI;
  }

  @Public()
  @Post('google/profile')
  async googleProfile(
    @Body() dto: { accessToken: string },
    @UserAgent() agent: string,
    @Res({ passthrough: true }) res: Response
  ) {
    return lastValueFrom(
      this.httpService
        .get<GoogleUserInfo>(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          params: {
            alt: 'json',
            access_token: dto.accessToken,
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
          map(({ accessToken, refreshToken }) => ({
            accessToken: accessToken,
            user: refreshToken.user,
          })),
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
