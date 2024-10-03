import { Test, TestingModule } from '@nestjs/testing';
import { EmailVerifiedGuard } from './email-verified.guard';
import { mockContext, mockReflector, mockReflectorProvider } from './mocks';
import { isPublicRoute } from '@common/utils';
import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { mockUser } from '@user/mocks';

jest.mock('@common/utils');

describe('EmailVerifiedGuard', () => {
  let emailVerifiedGuard: EmailVerifiedGuard;
  let reflector: typeof mockReflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailVerifiedGuard, mockReflectorProvider()],
    }).compile();

    emailVerifiedGuard = module.get<EmailVerifiedGuard>(EmailVerifiedGuard);
    reflector = module.get<typeof mockReflector>(Reflector);
  });

  it('should be defined', () => {
    expect(emailVerifiedGuard).toBeDefined();
    expect(reflector).toBeDefined();
  });

  describe('canActivate', () => {
    it('should call isPublicRoute helper', async () => {
      (isPublicRoute as jest.Mock).mockReturnValue(true);
      await emailVerifiedGuard.canActivate(mockContext as ExecutionContext);

      expect(isPublicRoute).toHaveBeenCalledTimes(1);
      expect(isPublicRoute).toHaveBeenCalledWith(mockContext, reflector);
    });
    it('should return true if route is public', async () => {
      (isPublicRoute as jest.Mock).mockReturnValue(true);
      const result = await emailVerifiedGuard.canActivate(
        mockContext as ExecutionContext
      );

      expect(result).toBeTruthy();
    });
    it("should throw InternalServerErrorException with clear message if there's no user in request", async () => {
      (isPublicRoute as jest.Mock).mockReturnValue(false);
      (
        mockContext.switchToHttp?.().getRequest as jest.Mock
      ).mockReturnValueOnce({});

      try {
        await emailVerifiedGuard.canActivate(mockContext as ExecutionContext);
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(InternalServerErrorException);
      }
    });
    it("should throw ForbiddenException user's email is not verified", async () => {
      (isPublicRoute as jest.Mock).mockReturnValue(false);

      try {
        await emailVerifiedGuard.canActivate(mockContext as ExecutionContext);
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
    it('should return true(email is verified)', async () => {
      (isPublicRoute as jest.Mock).mockReturnValue(false);
      (
        mockContext.switchToHttp?.().getRequest as jest.Mock
      ).mockReturnValueOnce({
        user: {
          ...mockUser,
          isEmailVerified: true,
        },
      });

      const result = await emailVerifiedGuard.canActivate(
        mockContext as ExecutionContext
      );
      expect(result).toBeTruthy();
    });
  });
});
