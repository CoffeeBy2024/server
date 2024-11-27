import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '@user/user.service';
import { Token } from './entities';
import {
  MockRepository,
  mockUser,
  mockUserGoogle,
  userRepositoryProvider,
} from '@user/mocks';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider } from '@user/entities';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { v4 } from 'uuid';
import { compareSync, hashSync } from 'bcrypt';
import { CreateUserDto } from '@user/dto';
import { GoogleAuthUserInfo } from './types';
import {
  configServiceProvider,
  jwtServiceProvider,
  mockAgents,
  mockLoginUserDto,
  mockProvider,
  mockRegisterUserDto,
  mockUserWithoutPassword,
  tokenRepositoryProvider,
  mockNow,
  mockAccessToken,
  mockRefreshToken,
  mockTokensResult,
  provideMockMailService,
  MockMailServiceType,
} from './mocks';
import { ConfigService } from '@nestjs/config';
import { MailService } from '@mail/mail.service';
import { RecoverPasswordDto } from './dto/recover-password.dto';

jest.mock('uuid');
jest.mock('bcrypt');

export const mockGoogleUserInfo: GoogleAuthUserInfo = {
  email: mockUserGoogle.email,
  emailVerified: mockUserGoogle.emailVerified,
  firstName: mockUserGoogle.firstName,
  lastName: mockUserGoogle.lastName as string,
};

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let tokenRepository: MockRepository<Token>;
  let configService: ConfigService;
  let mailService: MockMailServiceType;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        userRepositoryProvider(),
        configServiceProvider(),
        tokenRepositoryProvider(),
        jwtServiceProvider(),
        provideMockMailService(),
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    tokenRepository = module.get<MockRepository<Token>>(
      getRepositoryToken(Token)
    );
    configService = module.get<ConfigService>(ConfigService);
    mailService = module.get<MockMailServiceType>(MailService);

    jest.spyOn(Date, 'now').mockReturnValue(mockNow);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userService).toBeDefined();
    expect(tokenRepository).toBeDefined();
    expect(configService).toBeDefined();
    expect(mailService).toBeDefined();
  });

  describe('register', () => {
    describe('for non existing user', () => {
      let getUserByConditions: jest.SpyInstance;

      beforeEach(() => {
        getUserByConditions = jest
          .spyOn(userService, 'getUserByConditions')
          .mockResolvedValue(null);
      });

      it('should call userService.getUserByConditions method', async () => {
        await service.register(mockRegisterUserDto, mockProvider);

        expect(getUserByConditions).toHaveBeenCalledTimes(1);
        expect(getUserByConditions).toHaveBeenCalledWith({
          email: mockRegisterUserDto.email,
        });
      });

      it('should call userService.createUser method', async () => {
        const emailVerificationLink = mockUser.emailVerificationLink as string;
        const emailVerified = false;
        (v4 as jest.Mock).mockReturnValue(emailVerificationLink);

        const createUser = jest.spyOn(userService, 'createUser');

        const mockCreateUserDto = new CreateUserDto({
          ...mockRegisterUserDto,
          emailVerified,
          emailVerificationLink,
          provider: mockProvider,
        });

        await service.register(mockRegisterUserDto, mockProvider);

        expect(createUser).toHaveBeenCalledTimes(1);
        expect(createUser).toHaveBeenCalledWith(mockCreateUserDto);
      });

      it('should call mailService.verifyEmail method', async () => {
        const mockV4 = 'mock-v4';
        (v4 as jest.Mock).mockReturnValueOnce(mockV4);
        const spyMethod = jest.spyOn(mailService, 'verifyEmail');
        await service.register(mockRegisterUserDto, mockProvider);
        expect(spyMethod).toHaveBeenCalledTimes(1);
        expect(spyMethod).toHaveBeenCalledWith({
          email: mockRegisterUserDto.email,
          emailVerificationLink: mockV4,
        });
      });

      it('should return created user', async () => {
        (hashSync as jest.Mock).mockReturnValue(mockUser.password);

        const result = await service.register(
          mockRegisterUserDto,
          mockProvider
        );

        expect(result).toEqual(mockUser);
      });
    });

    describe('for existing user', () => {
      it('should throw ConflictException with clear message', async () => {
        try {
          await service.register(mockRegisterUserDto, mockProvider);
          expect(true).toBeFalsy();
        } catch (err) {
          expect(err).toBeInstanceOf(ConflictException);
          expect(err.message).toBe(
            `The user with the email address '${mockUser.email}' already exists`
          );
        }
      });
    });
  });

  describe('login', () => {
    describe('positive', () => {
      it('should call userService.getUserByConditions', async () => {
        (compareSync as jest.Mock).mockReturnValue(true);
        (v4 as jest.Mock).mockReturnValue(mockRefreshToken.value);

        const spyMethod = jest.spyOn(userService, 'getUserByConditions');

        await service.login(mockLoginUserDto, mockAgents.INSOMNIA);

        expect(spyMethod).toHaveBeenCalledTimes(1);
        expect(spyMethod).toHaveBeenCalledWith({
          email: mockLoginUserDto.email,
        });
      });

      it('should return pair of tokens', async () => {
        (compareSync as jest.Mock).mockReturnValue(true);
        (v4 as jest.Mock).mockReturnValue(mockRefreshToken.value);
        tokenRepository.findOne?.mockResolvedValue(null);

        const result = await service.login(
          mockLoginUserDto,
          mockAgents.POSTMAN
        );

        expect(result).toEqual(mockTokensResult);
      });
    });

    describe('negative', () => {
      it('for user does not exists should throw BadRequestException with clear message', async () => {
        jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);

        try {
          await service.login(mockLoginUserDto, mockProvider);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toBe('Invalid email or password');
        }
      });

      it('for user does not have password should throw BadRequestException with clear message', async () => {
        jest
          .spyOn(userService, 'getUserByConditions')
          .mockResolvedValue(mockUserWithoutPassword);

        try {
          await service.login(mockLoginUserDto, mockProvider);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toBe('Invalid email or password');
        }
      });

      it('for user provide wrong password should throw BadRequestException with clear message', async () => {
        (compareSync as jest.Mock).mockReturnValue(false);

        try {
          await service.login(mockLoginUserDto, mockProvider);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toBe('Invalid email or password');
        }
      });
    });
  });

  describe('refresh-tokens', () => {
    describe('positive', () => {
      it('should call tokenRepository.findOne method', async () => {
        await service.refreshTokens(mockRefreshToken.value, mockAgents.POSTMAN);

        expect(tokenRepository.findOne).toHaveBeenCalledTimes(2);
        expect(tokenRepository.findOne).toHaveBeenCalledWith({
          where: {
            value: mockRefreshToken.value,
          },
          relations: {
            user: true,
          },
        });
      });

      it('should return pair of tokens', async () => {
        (v4 as jest.Mock).mockReturnValue(mockRefreshToken.value);

        const result = await service.refreshTokens(
          // mockToken.value,
          mockRefreshToken.value,
          mockAgents.POSTMAN
        );
        expect(result).toEqual({
          accessToken: mockAccessToken,
          refreshToken: mockRefreshToken,
        });
      });
    });

    describe('negative', () => {
      it('for token not found should throw UnauthorizedException', async () => {
        tokenRepository.findOne?.mockResolvedValue(null);

        try {
          await service.refreshTokens(
            mockRefreshToken.value,
            mockAgents.POSTMAN
          );
        } catch (err) {
          expect(err).toBeInstanceOf(UnauthorizedException);
        }
      });

      it('for expired token should call tokenRepository.remove method and throw UnauthorizedException', async () => {
        const expiredToken: Token = {
          ...mockRefreshToken,
          expiresAt: new Date(0),
        };
        tokenRepository.findOne?.mockResolvedValue(expiredToken);

        try {
          await service.refreshTokens(
            mockRefreshToken.value,
            mockAgents.POSTMAN
          );
          expect(tokenRepository.findOne).toHaveBeenCalledTimes(1);
          expect(tokenRepository.findOne).toHaveBeenCalledWith(expiredToken);
        } catch (err) {
          expect(err).toBeInstanceOf(UnauthorizedException);
        }
      });
    });
  });

  describe('removeRefreshToken', () => {
    it('should call tokenRepository.findOneBy method', async () => {
      await service.removeRefreshToken(mockRefreshToken.value);

      expect(tokenRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(tokenRepository.findOneBy).toHaveBeenCalledWith({
        value: mockRefreshToken.value,
      });
    });

    describe('for existing refresh token', () => {
      it('should call tokenRepository.remove method', async () => {
        await service.removeRefreshToken(mockRefreshToken.value);

        expect(tokenRepository.remove).toHaveBeenCalledTimes(1);
        expect(tokenRepository.remove).toHaveBeenCalledWith(mockRefreshToken);
      });

      it('should return removed token ', async () => {
        const result = await service.removeRefreshToken(mockRefreshToken.value);
        expect(result).toEqual(mockRefreshToken);
      });
    });

    describe('for non existing token', () => {
      it('should return null value', async () => {
        tokenRepository.findOneBy?.mockResolvedValue(null);

        const result = await service.removeRefreshToken(mockRefreshToken.value);

        expect(result).toBeNull();
      });
    });
  });

  describe('providerAuth', () => {
    it('should call userService.getUserByConditions', async () => {
      const spyMethod = jest.spyOn(userService, 'getUserByConditions');

      await service.providerAuth(
        mockGoogleUserInfo,
        mockAgents.POSTMAN,
        Provider.GOOGLE
      );

      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith({
        email: mockGoogleUserInfo.email,
      });
    });

    it('for existing user should return pair of tokens', async () => {
      jest
        .spyOn(userService, 'getUserByConditions')
        .mockResolvedValue(mockUserGoogle);
      const result = await service.providerAuth(
        mockGoogleUserInfo,
        mockAgents.POSTMAN,
        Provider.GOOGLE
      );

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });

    it('for non existing user should call userService.createUser', async () => {
      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);

      const spyMethod = jest.spyOn(userService, 'createUser');
      await service.providerAuth(
        mockGoogleUserInfo,
        mockAgents.POSTMAN,
        Provider.GOOGLE
      );

      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith({
        ...mockGoogleUserInfo,
        provider: Provider.GOOGLE,
      });
    });

    it('for non existing user should return pair of tokens', async () => {
      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);

      const result = await service.providerAuth(
        mockGoogleUserInfo,
        mockAgents.POSTMAN,
        Provider.GOOGLE
      );

      expect(result).toEqual({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
      });
    });
  });

  describe('recoverPassword', () => {
    const mockRecoverPasswordDto: RecoverPasswordDto = {
      email: 'antonio-banderas',
    };
    it('should call userService.getUserByConditions method', async () => {
      const spyMethod = jest.spyOn(userService, 'getUserByConditions');
      await service.recoverPassword(mockRecoverPasswordDto);
      expect(spyMethod).toHaveBeenCalledTimes(2);
      expect(spyMethod).toHaveBeenCalledWith({
        email: mockRecoverPasswordDto.email,
      });
    });
    it('if no user found should throw NotFoundException with expected message', async () => {
      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);
      try {
        await service.recoverPassword(mockRecoverPasswordDto);
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toBe(
          `User with ${mockRecoverPasswordDto.email} email not found`
        );
      }
    });
    it('for google user should return user', async () => {
      jest
        .spyOn(userService, 'getUserByConditions')
        .mockResolvedValue(mockUserGoogle);
      const result = await service.recoverPassword(mockRecoverPasswordDto);
      expect(result).toEqual(mockUserGoogle);
    });
    it('should call userService.updateUser method', async () => {
      const mockV4 = 'mock-v4';
      (v4 as jest.Mock).mockReturnValue(mockV4);
      const spyMethod = jest.spyOn(userService, 'updateUser');
      await service.recoverPassword(mockRecoverPasswordDto);
      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(
        {
          passwordRecoveryVerificationLink: mockV4,
        },
        mockUser.id
      );
    });
    it('should call mailService.verifyPasswordRecovery method', async () => {
      const mockV4 = 'mock-v4';
      (v4 as jest.Mock).mockReturnValue(mockV4);
      const spyMethod = jest.spyOn(mailService, 'verifyPasswordRecovery');
      await service.recoverPassword(mockRecoverPasswordDto);
      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith({
        email: mockRecoverPasswordDto.email,
        passwordRecoveryVerificationLink: mockV4,
      });
    });
    it('should return user', async () => {
      const result = await service.recoverPassword(mockRecoverPasswordDto);
      expect(result).toEqual(mockUser);
    });
  });
});
