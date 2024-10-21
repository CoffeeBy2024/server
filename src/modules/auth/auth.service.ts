import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { MailService } from '@mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    private readonly mailService: MailService
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
    this.mailService.verifyEmail({ email: dto.email, emailVerificationLink });
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
    const accessToken = this.createAccessToken(user.id);

    const refreshToken = await this.createRefreshToken(user, agent);
    return { accessToken, refreshToken };
  }

  private createAccessToken(id: number) {
    return {
      value: this.jwtService.sign({
        sub: id,
      }),
      expiresAt: this.getTokenExpiresAt(
        this.configService.getOrThrow('JWT_ACCESS_EXP')
      ),
    };
  }

  private async createRefreshToken(user: User, agent: string) {
    const token = await this.tokenRepository.findOne({
      where: {
        user: user,
        userAgent: agent,
      },
    });
    if (token) {
      token.value = v4();
      token.expiresAt = this.getTokenExpiresAt(
        this.configService.getOrThrow('JWT_REFRESH_EXP')
      );
      await this.tokenRepository.save(token);
      return token;
    }
    const newToken = await this.tokenRepository.save(
      this.tokenRepository.create({
        value: v4(),
        expiresAt: this.getTokenExpiresAt(
          this.configService.getOrThrow('JWT_REFRESH_EXP')
        ),
        userAgent: agent,
        user: user,
      })
    );

    return newToken;
  }

  async recoverPassword(dto: RecoverPasswordDto) {
    const { email } = dto;

    const user = await this.userService.getUserByConditions({ email });

    if (!user) {
      throw new NotFoundException(`User with ${email} email not found`);
    }

    if (user.provider === Provider.GOOGLE) {
      return user;
    }

    const passwordRecoveryVerificationLink = v4();

    await this.userService.updateUser(
      {
        passwordRecoveryVerificationLink,
      },
      user.id
    );

    this.mailService.verifyPasswordRecovery({
      email,
      passwordRecoveryVerificationLink,
    });
    return user;
  }

  private getTokenExpiresAt(timeToAlive: string) {
    return new Date(Date.now() + Number(timeToAlive));
  }
}
