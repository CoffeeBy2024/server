import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { FindOneOptions } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider, User } from './entities';
import { BadRequestException } from '@nestjs/common';
import { compareSync } from 'bcrypt';
import {
  googleDto,
  MockRepository,
  mockUser,
  mockUserGoogle,
  passwordDto,
  updateUserDto,
  userArr,
  userRepositoryProvider,
} from './mocks';

describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, userRepositoryProvider()],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('getUserByConditions', () => {
    const { id } = mockUser;
    const options: Omit<FindOneOptions<User>, 'where'> = {
      relations: {
        tokens: true,
      },
    };
    it('should call findOne method', async () => {
      await service.getUserByConditions({ id }, options);
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id },
        ...options,
      });
    });
  });

  describe('createUser', () => {
    describe('password flow', () => {
      it('should call create and save methods', async () => {
        userRepository.create?.mockReturnValue(mockUser);
        await service.createUser(passwordDto);

        expect(userRepository.save).toHaveBeenCalledTimes(1);
        expect(userRepository.create).toHaveBeenCalledTimes(1);
        expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      });
      it('should return created user with password provider and with hashed password', async () => {
        const result = await service.createUser(passwordDto);

        const { password: hashedPassword, ...passwordUserWithoutPassword } =
          result;
        const { password, ...mockUserWithoutPassword } = mockUser;

        expect(passwordUserWithoutPassword).toEqual(mockUserWithoutPassword);
        expect(result.provider).toBe(Provider.PASSWORD);
        expect(
          compareSync(password as string, hashedPassword as string)
        ).toBeTruthy();
      });
    });
    describe('google flow', () => {
      it('should call create and save methods', async () => {
        userRepository.create?.mockReturnValue(mockUserGoogle);
        await service.createUser(googleDto);

        expect(userRepository.save).toHaveBeenCalledTimes(1);
        expect(userRepository.create).toHaveBeenCalledTimes(1);
        expect(userRepository.create).toHaveBeenCalledWith({
          ...googleDto,
          password: undefined,
        });
        expect(userRepository.save).toHaveBeenCalledWith(mockUserGoogle);
      });
      it('should return created user', async () => {
        const result = await service.createUser(googleDto);
        expect(result).toEqual(mockUserGoogle);
      });
      it('should return created user with google provider and without password', async () => {
        const result = await service.createUser(googleDto);

        expect(result).toEqual(mockUserGoogle);
        expect(result.provider).toBe(Provider.GOOGLE);
        expect(result.password).toBeNull;
      });
    });
  });

  describe('getAllUsers', () => {
    it('should call find method', async () => {
      await service.getAllUsers();
      expect(userRepository.find).toHaveBeenCalledTimes(1);
    });
    it('should return array of users', () => {
      expect(service.getAllUsers()).resolves.toEqual(userArr);
    });
  });

  describe('deleteUser', () => {
    const { id } = mockUser;
    describe('for existing user', () => {
      it('should call userRepository.remove and userService.getUserByConditions methods', async () => {
        const spyService = jest.spyOn(service, 'getUserByConditions');
        await service.deleteUser(id);

        expect(spyService).toHaveBeenCalledTimes(1);
        expect(spyService).toHaveBeenCalledWith({ id });
        expect(userRepository.remove).toHaveBeenCalledTimes(1);
        expect(userRepository.remove).toHaveBeenCalledWith(mockUser);
      });
      it('should return deleted user', () => {
        expect(service.deleteUser(id)).resolves.toEqual(mockUser);
      });
    });
    describe('for non existing user', () => {
      it('should call userService getUserByConditions method and should not call userRepository remove method', async () => {
        userRepository.findOne?.mockResolvedValue(null);
        const spyService = jest.spyOn(service, 'getUserByConditions');
        await service.deleteUser(id);

        expect(spyService).toHaveBeenCalledTimes(1);
        expect(spyService).toHaveBeenCalledWith({ id });
        expect(userRepository.remove).toHaveBeenCalledTimes(0);
      });
      it('should return null', () => {
        userRepository.findOne?.mockResolvedValue(null);
        expect(service.deleteUser(id)).resolves.toBeNull();
      });
    });
  });

  describe('updateUser', () => {
    const { id } = mockUser;
    describe('for existing user', () => {
      it('should call userService.getUserByConditions, userRepository.save methods', async () => {
        const spyService = jest.spyOn(service, 'getUserByConditions');
        await service.updateUser(updateUserDto, id);

        expect(spyService).toHaveBeenCalledTimes(1);
        expect(spyService).toHaveBeenCalledWith({ id });
        expect(userRepository.save).toHaveBeenCalledTimes(1);
      });
      it('should return updated user with hashed password ', async () => {
        const result = await service.updateUser(updateUserDto, id);

        const { password: hashedPassword, ...resultWithoutPassword } = result;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...mockUserWithoutPassword } = mockUser;

        expect(resultWithoutPassword).toEqual(mockUserWithoutPassword);
        expect(result.firstName).toBe(updateUserDto.firstName);
        expect(
          compareSync(updateUserDto.password as string, hashedPassword)
        ).toBeTruthy();
      });
    });
    describe('for non-existing user', () => {
      it('should throw BadRequestException for non-existing user', async () => {
        userRepository.findOne?.mockResolvedValue(null);

        try {
          await service.updateUser(updateUserDto, id);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toBe(`Cannot find user with '${id}' id`);
        }
      });
    });
  });

  describe('verifyEmail', () => {
    const { emailVerificationLink } = mockUser;
    if (!emailVerificationLink) {
      throw new Error('mockUser does not have emailVerificationLink');
    }

    describe('for existing user', () => {
      it('should return user with verified email', async () => {
        expect(mockUser.emailVerified).toBeFalsy();
        const result = await service.verifyEmail(emailVerificationLink);

        expect(result).toEqual(mockUser);
        expect(result.emailVerified).toBeTruthy();
      });
      it('should call userService.getUserByConditions, userRepository.save methods', async () => {
        const spyService = jest.spyOn(service, 'getUserByConditions');
        await service.verifyEmail(emailVerificationLink);

        expect(spyService).toHaveBeenCalledTimes(1);
        expect(spyService).toHaveBeenCalledWith({ emailVerificationLink });
        expect(userRepository.save).toHaveBeenCalledTimes(1);
        expect(userRepository.save).toHaveBeenCalledWith({
          ...mockUser,
          emailVerified: true,
        });
      });
    });
    describe('for non existing user', () => {
      it('should throw BadRequestException with clear message', async () => {
        userRepository.findOne?.mockResolvedValue(null);

        try {
          await service.verifyEmail(emailVerificationLink);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toBe('Email verification link is not correct');
        }
      });
    });
  });
});
