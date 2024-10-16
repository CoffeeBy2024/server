import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import {
  hashedPassword,
  mockUser,
  passwordDto,
  provideMockCacheManager,
  updateUserDto,
  userArr,
  userRepositoryProvider,
} from './mocks';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto';
import { hashSync } from 'bcrypt';

jest.mock('bcrypt');

describe('UserController', () => {
  let controller: UserController;
  let spyService: UserService;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(spyService).toBeDefined();
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

  describe('getUser', () => {
    const { id } = mockUser;
    describe('for existing user', () => {
      it('should call getUser', async () => {
        jest.spyOn(spyService, 'getUserByConditions');
        await controller.getUserById(id);
        expect(spyService.getUserByConditions).toHaveBeenCalledTimes(1);
        expect(spyService.getUserByConditions).toHaveBeenCalledWith({ id });
      });
      it('should return user', async () => {
        jest.spyOn(spyService, 'getUserByConditions');
        const result = await controller.getUserById(id);
        expect(result).toEqual(mockUser);
      });
    });
    describe('for non existing user', () => {
      it('should return null', async () => {
        jest.spyOn(spyService, 'getUserByConditions').mockResolvedValue(null);
        const result = await controller.getUserById(id);
        expect(result).toBeNull();
      });
    });
  });

  describe('deleteUser', () => {
    const { id } = mockUser;
    describe('for existing user', () => {
      it('should call deleteUser', async () => {
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

  describe('updateUser', () => {
    const { id } = mockUser;
    it('should call updateUser', async () => {
      jest.spyOn(spyService, 'updateUser');
      await controller.updateUser(updateUserDto, id);
      expect(spyService.updateUser).toHaveBeenCalledTimes(1);
      expect(spyService.updateUser).toHaveBeenCalledWith(updateUserDto, id);
    });
    it('it should return user', async () => {
      const result = await controller.updateUser(updateUserDto, id);
      expect(result).toEqual(mockUser);
    });
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
