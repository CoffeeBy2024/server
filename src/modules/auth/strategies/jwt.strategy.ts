import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JWTPayload } from '@auth/types';
import { UserService } from '@user/user.service';
import { Request } from 'express';
import { COOKIES } from '@auth/constants';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) =>
          this.extractValueFromCookies(req, COOKIES.ACCESS_TOKEN),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
    });
  }

  async validate({ sub: id }: JWTPayload) {
    const user = await this.userService.getUserByConditions({ id });
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  private extractValueFromCookies = (req: Request, key: string) => {
    return req?.cookies?.[key] || null;
  };
}
