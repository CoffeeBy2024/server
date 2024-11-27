import { mockContext, mockReflector } from '@auth/guards/mocks';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Reflector } from '@nestjs/core';

export const provideCacheManager = () => ({
  provide: CACHE_MANAGER,
  useValue: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  },
});

export const provideReflector = () => ({
  provide: Reflector,
  useValue: mockReflector,
});

export const mockRequestMethod = (method: string) =>
  (mockContext.switchToHttp as jest.Mock).mockReturnValue({
    getRequest: jest.fn().mockReturnValue({
      method,
    }),
  });
