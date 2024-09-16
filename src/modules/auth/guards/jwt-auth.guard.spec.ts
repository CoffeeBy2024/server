import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { isPublicRoute } from '@common/utils';
import { mockContext, mockReflector, mockReflectorProvider } from './mocks';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';

jest.mock('@common/utils');

describe('JwtAuthGuard', () => {
  let jwtAuthGuard: JwtAuthGuard;
  let reflector: typeof mockReflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard, mockReflectorProvider()],
    }).compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<typeof mockReflector>(Reflector);
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
    expect(reflector).toBeDefined();
  });

  describe('canActivate', () => {
    it('should call isPublicRoute helper', async () => {
      (isPublicRoute as jest.Mock).mockReturnValue(true);
      await jwtAuthGuard.canActivate(mockContext as ExecutionContext);

      expect(isPublicRoute).toHaveBeenCalledTimes(1);
      expect(isPublicRoute).toHaveBeenCalledWith(mockContext, reflector);
    });
    it('should return true if the route is public', async () => {
      (isPublicRoute as jest.Mock).mockReturnValue(true);
      const result = await jwtAuthGuard.canActivate(
        mockContext as ExecutionContext
      );
      expect(result).toBeTruthy();
    });

    it('should call super.canActivate method if route is not public', async () => {
      (isPublicRoute as jest.Mock).mockReturnValue(false);
      const prototype = Object.getPrototypeOf(jwtAuthGuard);
      const spyMethod = jest
        .spyOn(prototype, 'canActivate')
        .mockReturnValue(true);

      await jwtAuthGuard.canActivate(mockContext as ExecutionContext);

      expect(spyMethod).toHaveBeenCalledTimes(1);
      expect(spyMethod).toHaveBeenCalledWith(mockContext);
    });

    it('should return value from super.canActivate method', async () => {
      (isPublicRoute as jest.Mock).mockReturnValue(false);
      const prototype = Object.getPrototypeOf(jwtAuthGuard);
      jest.spyOn(prototype, 'canActivate').mockReturnValue(true);

      const result = await jwtAuthGuard.canActivate(
        mockContext as ExecutionContext
      );

      expect(result).toBeTruthy();
    });
  });
});
