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
import { hashSync } from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { invalidateCache } from '@common/utils';

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        userRepositoryProvider(),
        provideMockCacheManager(),
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    spyService = module.get<UserService>(UserService);
    cacheManager = module.get<MockCacheManagerType>(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(spyService).toBeDefined();
    expect(cacheManager).toBeDefined();
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
    const { emailVerificationLink } = mockUser;
    if (!emailVerificationLink) {
      throw new Error('mockUser does not have emailVerificationLink');
    }

    it('should call verifyEmail', async () => {
      jest.spyOn(spyService, 'verifyEmail');
      await controller.verifyEmail(emailVerificationLink);
      expect(spyService.verifyEmail).toHaveBeenCalledTimes(1);
      expect(spyService.verifyEmail).toHaveBeenCalledWith(
        emailVerificationLink
      );
    });
    it('should return user', async () => {
      const result = await controller.verifyEmail(emailVerificationLink);
      expect(result).toEqual(mockUser);
    });
  });
});
