import { ConfigService } from '@nestjs/config';
import { JWTStrategy } from './jwt.strategy';
import { UserService } from '@user/user.service';
import { configServiceProvider } from '@auth/mocks';
import { Test, TestingModule } from '@nestjs/testing';
import { mockUser, userRepositoryProvider } from '@user/mocks';
import { JWTPayload } from '@auth/types';
import { UnauthorizedException } from '@nestjs/common';

const mockJWTPayload: JWTPayload = {
  id: mockUser.id,
  email: mockUser.email,
  exp: Date.now(),
  iat: Date.now(),
};

describe('JWTStrategy', () => {
  let jwtStrategy: JWTStrategy;
  let configService: ConfigService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JWTStrategy,
        configServiceProvider(),
        UserService,
        userRepositoryProvider(),
      ],
    }).compile();

    jwtStrategy = module.get<JWTStrategy>(JWTStrategy);
    configService = module.get<ConfigService>(ConfigService);
    userService = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
    expect(configService).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('constructor', () => {
    it('should call configService.get method', () => {
      expect(configService.get).toHaveBeenCalledTimes(1);
      expect(configService.get).toHaveBeenCalledWith('JWT_ACCESS_SECRET');
    });
  });

  describe('validate', () => {
    it('should call userService.getUserByConditions method', async () => {
      const spyMethod = jest.spyOn(userService, 'getUserByConditions');
      await jwtStrategy.validate(mockJWTPayload);
      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith({ id: mockJWTPayload.id });
    });

    describe('for existing user', () => {
      it('should return user', async () => {
        const result = await jwtStrategy.validate(mockJWTPayload);
        expect(result).toEqual(mockUser);
      });
    });

    describe('for non existing user', () => {
      it('should throw UnauthorizedException for not found user', async () => {
        jest.spyOn(userService, 'getUserByConditions').mockResolvedValue(null);

        try {
          await jwtStrategy.validate(mockJWTPayload);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(UnauthorizedException);
        }
      });
    });
  });
});