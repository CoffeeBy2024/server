import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  hashedPassword,
  MockCacheManagerType,
  mockGetUserCacheKey,
  mockUser,
  passwordDto,
  provideMockCacheManager,
  updateUserDto,
  userArr,
  userRepositoryProvider,
} from './mocks';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto, UserResponseDto } from './dto';
import { compareSync, hashSync } from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { invalidateCache } from '@common/utils';
import { mockPasswordRecoveryVerificationDto } from '@mail/mocks/mail.mock';
import { Response } from 'express';
import { configServiceProvider, mockConfigData } from '@auth/mocks';
import { ConfigService } from '@nestjs/config';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordByTokenDto } from './dto/reset-password-by-token.dto';

const commonTTLValue = 111;
jest.mock('bcrypt');
jest.mock('@common/utils');
jest.mock('src/utils/constants/cache', () => {
  return {
    TTLVariables: {
      common: 111,
    },
  };
});

describe('UserController', () => {
  let controller: UserController;
  let spyService: UserService;
  let cacheManager: MockCacheManagerType;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        userRepositoryProvider(),
        provideMockCacheManager(),
        configServiceProvider(),
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    spyService = module.get<UserService>(UserService);
    cacheManager = module.get<MockCacheManagerType>(CACHE_MANAGER);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(spyService).toBeDefined();
    expect(cacheManager).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('createUser', () => {
    it('should call createUser methods', async () => {
      jest.spyOn(spyService, 'createUser');
      await controller.createUser(passwordDto);
      expect(spyService.createUser).toHaveBeenCalledTimes(1);
      expect(spyService.createUser).toHaveBeenCalledWith(passwordDto);
    });
    it('should return  user', async () => {
      (hashSync as jest.Mock).mockReturnValue(hashedPassword);
      const result = await controller.createUser(passwordDto);

      expect(result).toEqual(mockUser);
    });
  });

  describe('getAllUsers', () => {
    it('should call getAllUsers', async () => {
      jest.spyOn(spyService, 'getAllUsers');
      await controller.getAllUsers();
      expect(spyService.getAllUsers).toHaveBeenCalledTimes(1);
    });
    it('should return serialized array of users', async () => {
      const result = await controller.getAllUsers();
      const expectedResult = plainToInstance(UserResponseDto, userArr);
      expect(result).toEqual(expectedResult);
    });
  });

  const testGetUser = (methodToCall: () => any, id: number) => {
    const mockUserCacheKey = mockGetUserCacheKey(id);
    describe('for cached user', () => {
      it('should return cached user', async () => {
        const result = await methodToCall();
        expect(cacheManager.get).toHaveBeenCalledTimes(1);
        expect(cacheManager.get).toHaveBeenCalledWith(mockUserCacheKey);
        expect(result).toEqual(mockUser);
      });
    });
    describe('for uncached user', () => {
      beforeEach(() => {
        cacheManager.get.mockReturnValue(null);
      });
      describe('for existing user', () => {
        it('should call UserService.getUserByConditions method', async () => {
          jest.spyOn(spyService, 'getUserByConditions');
          await methodToCall();
          expect(spyService.getUserByConditions).toHaveBeenCalledTimes(1);
          expect(spyService.getUserByConditions).toHaveBeenCalledWith({ id });
        });
        it('should return user', async () => {
          jest.spyOn(spyService, 'getUserByConditions');
          const result = await methodToCall();
          expect(result).toEqual(mockUser);
        });
        it('should set user to cache', async () => {
          await methodToCall();
          expect(cacheManager.set).toHaveBeenCalledTimes(1);
          expect(cacheManager.set).toHaveBeenCalledWith(
            mockUserCacheKey,
            mockUser,
            commonTTLValue
          );
        });
      });
      describe('for non existing user', () => {
        it('should return null', async () => {
          jest.spyOn(spyService, 'getUserByConditions').mockResolvedValue(null);
          const result = await methodToCall();
          expect(result).toBeNull();
        });
      });
    });
  };

  describe('getUserByToken', () => {
    testGetUser(() => controller.getUserByToken(mockUser), mockUser.id);
  });

  describe('getUserById', () => {
    const { id } = mockUser;
    testGetUser(() => controller.getUserById(id), id);
  });

  describe('deleteUser', () => {
    const { id } = mockUser;
    const mockUserCacheKey = mockGetUserCacheKey(id);
    describe('for existing user', () => {
      it("should invalidate user's cache", async () => {
        invalidateCache as jest.Mock;
        await controller.deleteUser(id);
        expect(invalidateCache).toHaveBeenCalledTimes(1);
        expect(invalidateCache).toHaveBeenCalledWith(
          cacheManager,
          mockUserCacheKey
        );
      });
      it('should call UserService.deleteUser', async () => {
        jest.spyOn(spyService, 'deleteUser');
        await controller.deleteUser(id);
        expect(spyService.deleteUser).toHaveBeenCalledTimes(1);
        expect(spyService.deleteUser).toHaveBeenCalledWith(id);
      });
      it('should return user', async () => {
        const result = await controller.deleteUser(id);
        expect(result).toEqual(mockUser);
      });
    });
    describe('for non existing user', () => {
      it('should return null', async () => {
        jest.spyOn(spyService, 'deleteUser').mockResolvedValue(null);
        const result = await controller.deleteUser(id);
        expect(result).toBeNull();
      });
    });
  });

  const testUpdateUser = (
    methodToCall: () => any,
    updateUserDto: UpdateUserDto,
    id: number
  ) => {
    const mockUserCacheKey = mockGetUserCacheKey(id);

    it("should invalidate user's cache", async () => {
      invalidateCache as jest.Mock;
      await methodToCall();
      expect(invalidateCache).toHaveBeenCalledTimes(1);
      expect(invalidateCache).toHaveBeenCalledWith(
        cacheManager,
        mockUserCacheKey
      );
    });
    it('should call UserService.updateUser', async () => {
      jest.spyOn(spyService, 'updateUser');
      await methodToCall();
      expect(spyService.updateUser).toHaveBeenCalledTimes(1);
      expect(spyService.updateUser).toHaveBeenCalledWith(updateUserDto, id);
    });
    it('it should return user', async () => {
      const result = await methodToCall();
      expect(result).toEqual(mockUser);
    });
  };

  describe('updateUserByToken', () => {
    const { id } = mockUser;
    testUpdateUser(
      () => controller.updateUserByToken(mockUser, updateUserDto),
      updateUserDto,
      id
    );
  });

  describe('updateUserById', () => {
    const { id } = mockUser;
    testUpdateUser(
      () => controller.updateUserById(updateUserDto, id),
      updateUserDto,
      id
    );
  });

  describe('verifyEmail', () => {
    const mockResponse: Partial<Response> = {
      redirect: jest.fn(),
    };
    const { emailVerificationLink } = mockUser;
    if (!emailVerificationLink) {
      throw new Error('mockUser does not have emailVerificationLink');
    }

    it('should call verifyEmail', async () => {
      jest.spyOn(spyService, 'verifyEmail');
      await controller.verifyEmail(
        emailVerificationLink,
        mockResponse as Response
      );
      expect(spyService.verifyEmail).toHaveBeenCalledTimes(1);
      expect(spyService.verifyEmail).toHaveBeenCalledWith(
        emailVerificationLink
      );
    });
    it('should invalidate cache', async () => {
      invalidateCache as jest.Mock;
      await controller.verifyEmail(
        emailVerificationLink,
        mockResponse as Response
      );
      const mockId = mockGetUserCacheKey(mockUser.id);
      expect(invalidateCache).toHaveBeenCalledTimes(1);
      expect(invalidateCache).toHaveBeenCalledWith(cacheManager, mockId);
    });
    it('should redirect on expected url', async () => {
      const mockRedirectUrl = `${mockConfigData.CLIENT_URL}/profile`;
      await controller.verifyEmail(
        emailVerificationLink,
        mockResponse as Response
      );
      expect(mockResponse.redirect).toHaveBeenCalledTimes(1);
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockRedirectUrl);
    });
    it('for invalid emailVerificationLink should redirect on expected url', async () => {
      const mockRedirectUrl = `${mockConfigData.CLIENT_URL}`;
      jest.spyOn(spyService, 'verifyEmail').mockRejectedValue(123);
      await controller.verifyEmail(
        null as unknown as string,
        mockResponse as Response
      );
      expect(mockResponse.redirect).toHaveBeenCalledTimes(1);
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockRedirectUrl);
    });
  });

  describe('recoverPassword', () => {
    const mockResponse: Partial<Response> = {
      redirect: jest.fn(),
    };
    const {
      passwordRecoveryVerificationLink: mockPasswordRecoveryVerificationLink,
    } = mockPasswordRecoveryVerificationDto;
    it('should call userService.confirmPasswordRecoveryVerificationLink', async () => {
      const spyMethod = jest.spyOn(
        spyService,
        'confirmPasswordRecoveryVerificationLink'
      );
      await controller.recoverPassword(
        mockPasswordRecoveryVerificationLink,
        mockResponse as Response
      );
      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(
        mockPasswordRecoveryVerificationLink
      );
    });
    it('should invalidate cache', async () => {
      invalidateCache as jest.Mock;
      await controller.recoverPassword(
        mockPasswordRecoveryVerificationLink,
        mockResponse as Response
      );
      const mockId = mockGetUserCacheKey(mockUser.id);
      expect(invalidateCache).toHaveBeenCalledTimes(1);
      expect(invalidateCache).toHaveBeenCalledWith(cacheManager, mockId);
    });
    it('should call configService.getOrThrow method', async () => {
      await controller.recoverPassword(
        mockPasswordRecoveryVerificationLink,
        mockResponse as Response
      );
      expect(configService.getOrThrow).toHaveBeenCalledTimes(1);
      expect(configService.getOrThrow).toHaveBeenCalledWith('CLIENT_URL');
    });
    it('should redirect on expected url', async () => {
      const mockRedirectUrl = `${mockConfigData.CLIENT_URL}/reset-password?passwordRecoveryVerificationLink=${mockPasswordRecoveryVerificationLink}&id=${mockUser.id}`;
      await controller.recoverPassword(
        mockPasswordRecoveryVerificationLink,
        mockResponse as Response
      );
      expect(mockResponse.redirect).toHaveBeenCalledTimes(1);
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockRedirectUrl);
    });
    it('for invalid confirmPasswordRecoveryVerificationLink should redirect on expected url', async () => {
      const mockRedirectUrl = `${mockConfigData.CLIENT_URL}`;
      jest
        .spyOn(spyService, 'confirmPasswordRecoveryVerificationLink')
        .mockRejectedValue(123);
      await controller.recoverPassword(
        null as unknown as string,
        mockResponse as Response
      );
      expect(mockResponse.redirect).toHaveBeenCalledTimes(1);
      expect(mockResponse.redirect).toHaveBeenCalledWith(mockRedirectUrl);
    });
  });
  describe('resetPassword', () => {
    const mockResetPasswordDto: ResetPasswordDto = {
      id: 1,
      passwordRecoveryVerificationLink: '123',
      confirmPassword: '123123123',
      password: '123123123',
    };
    it('should call userService.resetPassword method', async () => {
      const spyMethod = jest.spyOn(spyService, 'resetPassword');
      await controller.resetPassword(mockResetPasswordDto);
      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(mockResetPasswordDto);
    });
    it('should invalidate cache', async () => {
      invalidateCache as jest.Mock;
      await controller.resetPassword(mockResetPasswordDto);
      const userCacheKey = mockGetUserCacheKey(mockUser.id);
      expect(invalidateCache).toHaveBeenCalledTimes(1);
      expect(invalidateCache).toHaveBeenCalledWith(cacheManager, userCacheKey);
    });
    it('should return expected message', async () => {
      const result = await controller.resetPassword(mockResetPasswordDto);
      expect(result).toEqual({
        message: 'Password reset success',
      });
    });
  });
  describe('resetPasswordByToken', () => {
    const mockResetPasswordByTokenDto: ResetPasswordByTokenDto = {
      password: '123',
      confirmPassword: '123',
      currentPassword: '1233',
    };
    it('should call userService.resetPasswordByToken method', async () => {
      const spyMethod = jest.spyOn(spyService, 'resetPasswordByToken');
      (compareSync as jest.Mock).mockReturnValue(true);
      await controller.resetPasswordByToken(
        mockUser,
        mockResetPasswordByTokenDto
      );
      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(
        mockUser,
        mockResetPasswordByTokenDto
      );
    });
    it('should invalidate cache', async () => {
      invalidateCache as jest.Mock;
      await controller.resetPasswordByToken(
        mockUser,
        mockResetPasswordByTokenDto
      );
      const userCacheKey = mockGetUserCacheKey(mockUser.id);
      expect(invalidateCache).toHaveBeenCalledTimes(1);
      expect(invalidateCache).toHaveBeenCalledWith(cacheManager, userCacheKey);
    });
    it('should return expected message', async () => {
      (compareSync as jest.Mock).mockReturnValue(true);
      const result = await controller.resetPasswordByToken(
        mockUser,
        mockResetPasswordByTokenDto
      );
      expect(result).toEqual({
        message: 'Password reset success',
      });
    });
  });
});
