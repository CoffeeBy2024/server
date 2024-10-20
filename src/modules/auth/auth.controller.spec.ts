import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '@user/user.service';
import { mockUser, userRepositoryProvider } from '@user/mocks';
import { HttpService } from '@nestjs/axios';
import {
  configServiceProvider,
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
  mockConfigData,
  mockTokensResult,
  mockRefreshToken,
  provideMockMailService,
} from './mocks';
import { Provider } from '@user/entities';
import { Request, Response } from 'express';
import { compareSync, hashSync } from 'bcrypt';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { v4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { COOKIES, QUERIES } from './constants';
import { RecoverPasswordDto } from './dto/recover-password.dto';

jest.mock('uuid');
jest.mock('bcrypt');

describe('AuthController', () => {
  let controller: AuthController;
  let spyService: AuthService;
  let userService: UserService;
  let httpService: Pick<HttpService, 'get'>;
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
        provideMockMailService(),
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    spyService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    httpService = module.get<Pick<HttpService, 'get'>>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
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

    it('should return clear message', async () => {
      (hashSync as jest.Mock).mockReturnValue(mockUser.password);
      (v4 as jest.Mock).mockReturnValue(mockUser.emailVerificationLink);

      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);

      const result = await controller.register(mockRegisterUserDto);

      expect(result).toEqual({
        message: 'Register successful',
      });
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

    it('should call response.cookie method twice', async () => {
      jest.spyOn(spyService, 'login').mockResolvedValue(mockTokensResult);

      await controller.login(
        mockLoginUserDto,
        mockAgents.POSTMAN,
        response as Response
      );

      const { accessToken, refreshToken } = mockTokensResult;

      expect(response.cookie).toHaveBeenCalledTimes(2);
      expect(response.cookie).toHaveBeenCalledWith(
        COOKIES.ACCESS_TOKEN,
        accessToken.value,
        {
          httpOnly: true,
          expires: accessToken.expiresAt,
        }
      );
      expect(response.cookie).toHaveBeenCalledWith(
        COOKIES.REFRESH_TOKEN,
        refreshToken.value,
        {
          httpOnly: true,
          expires: refreshToken.expiresAt,
        }
      );
    });

    it('should return clear message', async () => {
      (compareSync as jest.Mock).mockReturnValue(true);

      const result = await controller.login(
        mockLoginUserDto,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(result).toEqual({
        message: 'Login successful',
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
          await controller.logout(mockRefreshToken.value, response as Response);
        } catch (e) {
          expect(e).toBeInstanceOf(UnauthorizedException);
          expect(e.message).toBe('Invalid or expired refresh token');
        }
      });
    });

    describe('positive', () => {
      it('should call authService.removeRefreshToken method', async () => {
        const spyMethod = jest.spyOn(spyService, 'removeRefreshToken');

        await controller.logout(mockRefreshToken.value, response as Response);
        expect(spyMethod).toHaveBeenCalledTimes(1);
        expect(spyMethod).toHaveBeenCalledWith(mockRefreshToken.value);
      });

      it('when remove token from DB should call response.clearCookie method twice', async () => {
        await controller.logout(mockRefreshToken.value, response as Response);
        expect(response.clearCookie).toHaveBeenCalledTimes(2);
        expect(response.clearCookie).toHaveBeenCalledWith(COOKIES.ACCESS_TOKEN);
        expect(response.clearCookie).toHaveBeenCalledWith(
          COOKIES.REFRESH_TOKEN
        );
      });

      it('should return successful message', async () => {
        jest
          .spyOn(spyService, 'removeRefreshToken')
          .mockResolvedValue(mockRefreshToken);

        const result = await controller.logout(
          mockRefreshToken.value,
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
        mockRefreshToken.value,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(mockMethod).toHaveBeenCalledTimes(1);
      expect(mockMethod).toHaveBeenCalledWith(
        mockRefreshToken.value,
        mockAgents.POSTMAN
      );
    });

    it('should call response.cookie method twice', async () => {
      jest
        .spyOn(spyService, 'refreshTokens')
        .mockResolvedValue(mockTokensResult);

      await controller.refreshTokens(
        mockRefreshToken.value,
        mockAgents.POSTMAN,
        response as Response
      );

      const { accessToken, refreshToken } = mockTokensResult;

      expect(response.cookie).toHaveBeenCalledTimes(2);
      expect(response.cookie).toHaveBeenCalledWith(
        COOKIES.ACCESS_TOKEN,
        accessToken.value,
        {
          httpOnly: true,
          expires: accessToken.expiresAt,
        }
      );
      expect(response.cookie).toHaveBeenCalledWith(
        COOKIES.REFRESH_TOKEN,
        refreshToken.value,
        {
          httpOnly: true,
          expires: refreshToken.expiresAt,
        }
      );
    });

    it('should return clear message', async () => {
      jest.spyOn(Date, 'now').mockReturnValueOnce(mockNow);

      const result = await controller.refreshTokens(
        mockRefreshToken.value,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(result).toEqual({
        message: 'Tokens refreshed successfully',
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

  describe('recoverPassword', () => {
    const mockRecoverPasswordDto: RecoverPasswordDto = {
      email: 'antonio-banderas',
    };
    it('should call authService.recoverPassword', async () => {
      const spyMethod = jest.spyOn(controller, 'recoverPassword');
      await controller.recoverPassword(mockRecoverPasswordDto);
      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(mockRecoverPasswordDto);
    });
    it('should return user', async () => {
      const result = await controller.recoverPassword(mockRecoverPasswordDto);
      expect(result).toEqual(mockUser);
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
        `${mockConfigData.API_URL}/auth/google/profile?${QUERIES.ACCESS_TOKEN}=${mockGoogleUserValidateResponse.accessToken}`
      );
    });
  });

  describe('googleProfile', () => {
    it('should call httpService.get method on googleUserProfile endpoint', async () => {
      await controller.googleProfile(
        mockAccessTokenDto.accessToken,
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
        mockAccessTokenDto.accessToken,
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
      jest
        .spyOn(spyService, 'providerAuth')
        .mockResolvedValue(mockTokensResult);

      await controller.googleProfile(
        mockAccessTokenDto.accessToken,
        mockAgents.POSTMAN,
        response as Response
      );

      const { accessToken, refreshToken } = mockTokensResult;

      expect(response.cookie).toHaveBeenCalledTimes(2);
      expect(response.cookie).toHaveBeenCalledWith(
        COOKIES.ACCESS_TOKEN,
        accessToken.value,
        {
          httpOnly: true,
          expires: accessToken.expiresAt,
        }
      );
      expect(response.cookie).toHaveBeenCalledWith(
        COOKIES.REFRESH_TOKEN,
        refreshToken.value,
        {
          httpOnly: true,
          expires: refreshToken.expiresAt,
        }
      );
    });

    it('should redirect on expected page', async () => {
      jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);

      await controller.googleProfile(
        mockAccessTokenDto.accessToken,
        mockAgents.POSTMAN,
        response as Response
      );

      expect(response.redirect).toHaveBeenCalledTimes(1);
      expect(response.redirect).toHaveBeenCalledWith(mockConfigData.CLIENT_URL);
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
