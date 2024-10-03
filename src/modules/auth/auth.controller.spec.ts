import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '@user/user.service';
import { mockUser, mockUserGoogle, userRepositoryProvider } from '@user/mocks';
import { HttpService } from '@nestjs/axios';
import {
  configServiceProvider,
  createMockToken,
  generateJwtToken,
  httpServiceProvider,
  jwtServiceProvider,
  mockAgents,
  mockGoogleUserInfo,
  mockGoogleUserValidateResponse,
  mockLoginUserDto,
  mockRegisterUserDto,
  tokenRepositoryProvider,
  mockNow,
  mockAccessTokenDto,
} from './mocks';
import { Provider } from '@user/entities';
import { Request, Response } from 'express';
import { REFRESH_TOKEN } from './constants';
import { compareSync, hashSync } from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Token } from './entities';
import { v4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

jest.mock('uuid');
jest.mock('bcrypt');

describe('AuthController', () => {
  let controller: AuthController;
  let spyService: AuthService;
  let userService: UserService;
  let httpService: Pick<HttpService, 'get'>;
  let mockToken: Token;
  let response: Partial<Response>;
  let request: Partial<Request>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        UserService,
        userRepositoryProvider(),
        tokenRepositoryProvider(),
        jwtServiceProvider(),
        httpServiceProvider(),
        configServiceProvider(),
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    spyService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    httpService = module.get<Pick<HttpService, 'get'>>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
    mockToken = createMockToken();
    response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      redirect: jest.fn(),
    };
    request = {
      user: mockGoogleUserValidateResponse,
    };
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(spyService).toBeDefined();
    expect(userService).toBeDefined();
    expect(httpService).toBeDefined();
    expect(mockToken).toBeDefined();
    expect(response).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register method', async () => {
      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);
      const spyMethod = jest.spyOn(spyService, 'register');

      await controller.register(mockRegisterUserDto);

      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(
        mockRegisterUserDto,
        Provider.PASSWORD
      );
    });

    it('should return created user', async () => {
      (hashSync as jest.Mock).mockReturnValue(mockUser.password);
      (v4 as jest.Mock).mockReturnValue(mockUser.emailVerificationLink);

      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);

      const result = await controller.register(mockRegisterUserDto);

      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should authService.login method', async () => {
      const spyMethod = jest.spyOn(spyService, 'login');
      (compareSync as jest.Mock).mockReturnValue(true);

      await controller.login(
        mockLoginUserDto,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(
        mockLoginUserDto,
        mockAgents.POSTMAN
      );
    });

    it('should call response.cookie method', async () => {
      (v4 as jest.Mock).mockReturnValue(mockToken.value);
      (compareSync as jest.Mock).mockReturnValue(true);
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockNow);

      await controller.login(
        mockLoginUserDto,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(response.cookie).toHaveBeenCalledTimes(1);
      expect(response.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN,
        mockToken.value,
        {
          httpOnly: true,
          expires: mockToken.expiresAt,
        }
      );
    });

    it('should return expected value', async () => {
      (compareSync as jest.Mock).mockReturnValue(true);

      const result = await controller.login(
        mockLoginUserDto,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(result).toStrictEqual({
        accessToken: generateJwtToken({
          id: mockUser.id,
          email: mockUser.email,
        }),
        user: result.user,
      });
    });
  });

  describe('logout', () => {
    describe('negative', () => {
      it('if no refresh token should throw UnauthorizedException with clear message', async () => {
        try {
          await controller.logout('', response as Response);
        } catch (e) {
          expect(e).toBeInstanceOf(UnauthorizedException);
          expect(e.message).toBe('Refresh token is missing');
        }
      });

      it('if no removed refresh token should throw UnauthorizedException with clear message', async () => {
        jest.spyOn(spyService, 'removeRefreshToken').mockResolvedValue(null);

        try {
          await controller.logout(mockToken.value, response as Response);
        } catch (e) {
          expect(e).toBeInstanceOf(UnauthorizedException);
          expect(e.message).toBe('Invalid or expired refresh token');
        }
      });
    });

    describe('positive', () => {
      it('should call authService.removeRefreshToken method', async () => {
        const spyMethod = jest.spyOn(spyService, 'removeRefreshToken');

        await controller.logout(mockToken.value, response as Response);

        expect(spyMethod).toHaveBeenCalledTimes(1);
        expect(spyMethod).toHaveBeenCalledWith(mockToken.value);
      });

      it('for removed from DB token should call response.clearCookie method', async () => {
        await controller.logout(mockToken.value, response as Response);

        expect(response.clearCookie).toHaveBeenCalledTimes(1);
        expect(response.clearCookie).toHaveBeenCalledWith(REFRESH_TOKEN);
      });

      it('should return successful message', async () => {
        jest
          .spyOn(spyService, 'removeRefreshToken')
          .mockResolvedValue(mockToken);

        const result = await controller.logout(
          mockToken.value,
          response as Response
        );

        expect(result).toEqual({
          message: 'Logout successful',
        });
      });
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens method', async () => {
      const mockMethod = jest.spyOn(spyService, 'refreshTokens');

      await controller.refreshTokens(
        mockToken.value,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(mockMethod).toHaveBeenCalledTimes(1);
      expect(mockMethod).toHaveBeenCalledWith(
        mockToken.value,
        mockAgents.POSTMAN
      );
    });

    it('should call response.cookie method', async () => {
      (v4 as jest.Mock).mockReturnValue(mockToken.value);
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockNow);

      await controller.refreshTokens(
        mockToken.value,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(response.cookie).toHaveBeenCalledTimes(1);
      expect(response.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN,
        mockToken.value,
        {
          httpOnly: true,
          expires: mockToken.expiresAt,
        }
      );
    });

    it('should return expected value', async () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockNow);

      const result = await controller.refreshTokens(
        mockToken.value,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(result).toStrictEqual({
        accessToken: generateJwtToken({
          id: mockUser.id,
          email: mockUser.email,
        }),
        user: result.user,
      });
    });

    it('for non existing refresh token should throw UnauthorizedException', async () => {
      try {
        await controller.refreshTokens(
          '',
          mockAgents.POSTMAN,
          response as Response
        );
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('googleAuthRedirect', () => {
    it("should call response.redirect method and pass user's access token", async () => {
      await controller.googleAuthRedirect(
        request as Request,
        response as Response
      );

      expect(response.redirect).toHaveBeenCalledTimes(1);
      expect(response.redirect).toHaveBeenCalledWith(
        `http://localhost:3000/auth/google?access-token=${mockGoogleUserValidateResponse.accessToken}`
      );
    });
  });

  describe('googleProfile', () => {
    it('should call httpService.get method on googleUserProfile endpoint', async () => {
      await controller.googleProfile(
        mockAccessTokenDto,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(httpService.get).toHaveBeenCalledWith(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
          params: {
            alt: 'json',
            access_token: mockAccessTokenDto.accessToken,
          },
        }
      );
    });

    it('should call authService.providerAuth method', async () => {
      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);
      const spyMethod = jest.spyOn(spyService, 'providerAuth');

      await controller.googleProfile(
        mockAccessTokenDto,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(
        {
          email: mockGoogleUserInfo.email,
          firstName: mockGoogleUserInfo.given_name,
          lastName: mockGoogleUserInfo.family_name,
          emailVerified: mockGoogleUserInfo.email_verified,
        },
        mockAgents.POSTMAN,
        Provider.GOOGLE
      );
    });

    it('should call response.cookies method', async () => {
      (v4 as jest.Mock).mockReturnValue(mockToken.value);
      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockNow);

      await controller.googleProfile(
        mockAccessTokenDto,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(response.cookie).toHaveBeenCalledTimes(1);
      expect(response.cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN,
        mockToken.value,
        {
          httpOnly: true,
          expires: mockToken.expiresAt,
        }
      );
    });

    it('should return expectedValue', async () => {
      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);

      const result = await controller.googleProfile(
        mockAccessTokenDto,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(result).toStrictEqual({
        accessToken: generateJwtToken({
          id: mockUserGoogle.id,
          email: mockUserGoogle.email,
        }),
        user: result.user,
      });
    });

    it('should catch errors and throw BadRequestException with clear message', async () => {
      const errMessage = 'errMessage';

      jest
        .spyOn(spyService, 'providerAuth')
        .mockRejectedValue(new Error(errMessage));
      try {
        await controller.googleAuth();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toBe(errMessage);
      }
    });
  });
});
