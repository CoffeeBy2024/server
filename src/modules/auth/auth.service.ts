import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
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
import { ConfigService } from '@nestjs/config';
import { GoogleAuthUserDto } from './dto/google-auth-user.dto';
import { Provider } from '@user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>
  ) {}

  async register(dto: RegisterUserDto, provider: Provider) {
    const user = await this.userService.getUser(dto.email);
    if (user) {
      throw new ConflictException(
        `The user with the email address '${user.email}' already exists`
      );
    }
    return this.userService.createUser({ ...dto, provider });
  }

  async login(dto: LoginUserDto, agent: string) {
    const user = await this.userService.getUser(dto.email);
    if (!user || !compareSync(dto.password, user?.password)) {
      throw new BadRequestException('Invalid email or password');
    }
    return this.createTokens({ user, agent });
  }

  async refreshTokens(refreshToken: string, agent: string) {
    const token = await this.tokenRepository.findOne({
      where: {
        value: refreshToken,
      },
      relations: {
        user: true,
      },
    });

    if (!token) {
      throw new UnauthorizedException();
    }
    if (new Date(token?.expiresAt) < new Date()) {
      await this.tokenRepository.remove(token);
      throw new UnauthorizedException();
    }
    const { user } = token;
    return this.createTokens({ agent, user });
  }

  async removeRefreshToken(refreshTokenValue: string) {
    const token = await this.tokenRepository.findOneBy({
      value: refreshTokenValue,
    });
    if (token) {
      return this.tokenRepository.remove(token);
    }
    return null;
  }

  async providerAuth(
    dto: GoogleAuthUserDto,
    agent: string,
    provider: Provider
  ) {
    const user = await this.userService.getUser(dto.email);
    if (user) {
      return this.createTokens({ user, agent });
    }
    const newUser = await this.userService.createUser({ ...dto, provider });
    return this.createTokens({ user: newUser, agent });
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
    const token = await this.tokenRepository.findOne({
      where: {
        user: user,
        userAgent: agent,
      },
    });
    if (token) {
      token.value = v4();
      token.expiresAt = this.getRefreshTokenExpiresAt();
      await this.tokenRepository.save(token);
      return token;
    }
    const newToken = await this.tokenRepository.save({
      value: v4(),
      expiresAt: this.getRefreshTokenExpiresAt().toISOString(),
      userAgent: agent,
      user: user,
    });

    return newToken;
  }

  private getRefreshTokenExpiresAt(): Date {
    return new Date(
      Date.now() + Number(this.configService.get('JWT_REFRESH_EXP'))
    );
  }
}
