import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UserService } from '@user/user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities/token.entity';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import {
  CreateAccessTokenParams,
  CreateRefreshTokenParams,
  CreateTokensParams,
  Tokens,
} from './types';
import { Response } from 'express';
import { REFRESH_TOKEN } from './constants';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Token)
    private readonly tokenService: Repository<Token>
  ) {}

  async register(dto: RegisterUserDto) {
    const user = await this.userService.getUser(dto.email);
    if (user) {
      throw new ConflictException(
        `The user with the email address '${user.email}' already exists`
      );
    }
    return this.userService.createUser(dto);
  }

  async login(dto: LoginUserDto, agent: string, res: Response) {
    const user = await this.userService.getUser(dto.email);
    if (!user || !compareSync(dto.password, user?.password)) {
      throw new BadRequestException('Invalid email or password');
    }
    const tokens = await this.createTokens({ user, agent });
    this.saveRefreshTokenToCookie(tokens.refreshToken, res);
    return tokens.accessToken;
  }

  private async createTokens({
    user,
    agent,
  }: CreateTokensParams): Promise<Tokens> {
    const accessToken = this.createAccessToken({
      id: user.id,
      email: user.email,
    });

    const refreshToken = await this.createRefreshToken({
      user,
      agent,
    });
    return { accessToken, refreshToken };
  }

  private createAccessToken({ id, email }: CreateAccessTokenParams) {
    return this.jwtService.sign({
      id,
      email,
    });
  }

  private async createRefreshToken({ user, agent }: CreateRefreshTokenParams) {
    const token = await this.tokenService.save({
      value: v4(),
      expiresAt: this.getRefreshTokenExpiresAt().toISOString(),
      userAgent: agent,
      user: user,
    });
    return token.value;
  }

  private saveRefreshTokenToCookie(refreshToken: string, res: Response) {
    res.cookie(REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      expires: this.getRefreshTokenExpiresAt(),
    });
  }

  private getRefreshTokenExpiresAt(): Date {
    return new Date(
      Date.now() + Number(this.configService.get('JWT_REFRESH_EXP'))
    );
  }
}
