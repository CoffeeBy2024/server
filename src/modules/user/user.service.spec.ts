import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { FindOneOptions } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Provider, User } from './entities';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import {
  googleDto,
  hashedPassword,
  MockRepository,
  mockUser,
  mockUserGoogle,
  passwordDto,
  updateUserDto,
  userArr,
  userRepositoryProvider,
} from './mocks';
import { ResetPasswordByTokenDto } from './dto/reset-password-by-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

jest.mock('bcrypt');

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
        (hashSync as jest.Mock).mockReturnValue(hashedPassword);
        await service.createUser(passwordDto);

        expect(userRepository.save).toHaveBeenCalledTimes(1);
        expect(userRepository.create).toHaveBeenCalledTimes(1);
        expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      });
      it('should return created user with password provider and with hashed password', async () => {
        (hashSync as jest.Mock).mockReturnValue(hashedPassword);
        const result = await service.createUser(passwordDto);

        expect(result).toEqual(mockUser);
        expect(result.provider).toBe(Provider.PASSWORD);
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
          password: null,
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
      it('should return updated user', async () => {
        const result = await service.updateUser(updateUserDto, id);

        expect(result).toEqual(mockUser);
        expect(result.firstName).toBe(updateUserDto.firstName);
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

  describe('confirmPasswordRecoveryVerificationLink', () => {
    const mockPasswordRecoveryVerificationLink = 'mock-psw-rec-verif-link';
    describe('for valid passwordRecoveryVerificationLink', () => {
      it('should call service.getUserByConditions method', async () => {
        const getUserByConditions = jest.spyOn(service, 'getUserByConditions');
        await service.confirmPasswordRecoveryVerificationLink(
          mockPasswordRecoveryVerificationLink
        );

        expect(getUserByConditions).toHaveBeenCalledTimes(1);
        expect(getUserByConditions).toHaveBeenCalledWith({
          passwordRecoveryVerificationLink:
            mockPasswordRecoveryVerificationLink,
        });
      });
      it('should return user', async () => {
        const result = await service.confirmPasswordRecoveryVerificationLink(
          mockPasswordRecoveryVerificationLink
        );
        expect(result).toEqual({
          ...mockUser,
          passwordRecoveryVerificationLink: null,
        });
      });
    });
    describe('for invalid passwordRecoveryVerificationLink', () => {
      beforeEach(() => {
        userRepository.findOne?.mockResolvedValue(null);
      });
      it('should throw BadRequestException exception with clear message', async () => {
        try {
          await service.confirmPasswordRecoveryVerificationLink(
            mockPasswordRecoveryVerificationLink
          );
          expect(true).toBeFalsy();
        } catch (e) {
          expect(e).toBeInstanceOf(BadRequestException);
          expect(e.message).toBe('Email verification link is not correct');
        }
      });
    });
  });

  describe('resetPassword', () => {
    const mockResetPasswordDto: ResetPasswordDto = {
      id: 1,
      passwordRecoveryVerificationLink: '123',
      confirmPassword: '123123123',
      password: '123123123',
    };
    it('should call service.getUserByConditions method', async () => {
      const getUserByConditions = jest.spyOn(service, 'getUserByConditions');
      await service.resetPassword(mockResetPasswordDto);

      expect(getUserByConditions).toHaveBeenCalledTimes(1);
      expect(getUserByConditions).toHaveBeenCalledWith({
        id: mockResetPasswordDto.id,
        passwordRecoveryVerificationLink:
          mockResetPasswordDto.passwordRecoveryVerificationLink,
      });
    });
    it('for invalid id or passwordRecoveryVerificationLink should throw not found error with clear message', async () => {
      jest.spyOn(service, 'getUserByConditions').mockResolvedValue(null);
      try {
        await service.resetPassword(mockResetPasswordDto);
        expect(true).toBeFalsy();
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe('User not found');
      }
    });
    it('should call repository.save method', async () => {
      const myMockUser = { ...mockUser };
      const hashedPasswordTwo = 'hashed-password-resetPassword';
      (hashSync as jest.Mock).mockReturnValue(hashedPasswordTwo);
      const spyMethod = userRepository.save;

      await service.resetPassword(mockResetPasswordDto);
      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith({
        ...myMockUser,
        password: hashedPasswordTwo,
      });
    });
    it('should return user', async () => {
      const myMockUser = { ...mockUser };
      const hashedPasswordTwo = 'hashed-password';
      (hashSync as jest.Mock).mockReturnValue(hashedPasswordTwo);
      const result = await service.resetPassword(mockResetPasswordDto);
      expect(result).toEqual({ ...myMockUser, password: hashedPasswordTwo });
    });
  });

  describe('resetPasswordByToken', () => {
    const mockResetPasswordByTokenDto: ResetPasswordByTokenDto = {
      password: '123',
      confirmPassword: '123',
      currentPassword: '1233',
    };
    const hashedPasswordTwo = 'hashed-password';
    beforeEach(() => {
      (hashSync as jest.Mock).mockReturnValue(hashedPasswordTwo);
    });
    it('for non-verified password should throw BadRequestException with clear message', async () => {
      (compareSync as jest.Mock).mockReturnValue(false);
      try {
        await service.resetPasswordByToken(
          mockUser,
          mockResetPasswordByTokenDto
        );
        expect(true).toBeFalsy();
      } catch (err) {
        expect(err).toBeInstanceOf(BadRequestException);
        expect(err.message).toBe('Wrong current password');
      }
    });
    it('should call repository.save method', async () => {
      const myMockUser: User = { ...mockUser };
      (compareSync as jest.Mock).mockReturnValue(true);
      (hashSync as jest.Mock).mockReturnValue(hashedPasswordTwo);
      const spyMethod = userRepository.save;
      await service.resetPasswordByToken(mockUser, mockResetPasswordByTokenDto);
      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith({
        ...myMockUser,
        password: hashedPasswordTwo,
      });
    });
    it('should return user', async () => {
      const myMockUser: User = { ...mockUser };
      (compareSync as jest.Mock).mockReturnValue(true);
      (hashSync as jest.Mock).mockReturnValue(hashedPasswordTwo);
      const result = await service.resetPasswordByToken(
        mockUser,
        mockResetPasswordByTokenDto
      );
      expect(result).toEqual({
        ...myMockUser,
        password: hashedPasswordTwo,
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
          emailVerificationLink: null,
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
