import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '@user/user.service';
import { RegisterUserDto, LoginUserDto } from './dto';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from './entities';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { Provider, User } from '@user/entities';
import { GoogleAuthUserInfo } from './types';
import { CreateUserDto } from '@user/dto';

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
    const user = await this.userService.getUserByConditions({
      email: dto.email,
    });
    if (user) {
      throw new ConflictException(
        `The user with the email address '${user.email}' already exists`
      );
    }
    const emailVerificationLink = v4();
    const emailVerified = false;
    const createUserDto = new CreateUserDto({
      ...dto,
      provider,
      emailVerified,
      emailVerificationLink,
    });
    return this.userService.createUser(createUserDto);
  }

  async login(dto: LoginUserDto, agent: string) {
    const user = await this.userService.getUserByConditions({
      email: dto.email,
    });
    if (!user || !user.password || !compareSync(dto.password, user?.password)) {
      throw new BadRequestException('Invalid email or password');
    }
    return this.createTokens(user, agent);
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
    return this.createTokens(user, agent);
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
    userInfo: GoogleAuthUserInfo,
    agent: string,
    provider: Provider
  ) {
    const user = await this.userService.getUserByConditions({
      email: userInfo.email,
    });
    if (user) {
      return this.createTokens(user, agent);
    }
    const newUser = await this.userService.createUser({
      ...userInfo,
      provider,
    });
    return this.createTokens(newUser, agent);
  }

  private async createTokens(user: User, agent: string) {
    const accessToken = this.createAccessToken(user.id, user.email);

    const refreshToken = await this.createRefreshToken(user, agent);
    return { accessToken, refreshToken };
  }

  private createAccessToken(id: number, email: string) {
    return this.jwtService.sign({
      id,
      email,
    });
  }

  private async createRefreshToken(user: User, agent: string) {
    const token = await this.tokenRepository.findOne({
      where: {
        user: user,
        userAgent: agent,
      },
      relations: {
        user: true,
      },
    });
    if (token) {
      token.value = v4();
      token.expiresAt = this.getRefreshTokenExpiresAt();
      await this.tokenRepository.save(token);
      return token;
    }
    const newToken = await this.tokenRepository.save(
      this.tokenRepository.create({
        value: v4(),
        expiresAt: this.getRefreshTokenExpiresAt(),
        userAgent: agent,
        user: user,
      })
    );

    return newToken;
  }

  private getRefreshTokenExpiresAt() {
    return new Date(
      Date.now() + Number(this.configService.get('JWT_REFRESH_EXP'))
    );
  }
}
