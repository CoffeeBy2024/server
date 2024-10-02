import { mockContext, mockReflector } from '@auth/guards/mocks';
import { CustomCacheInterceptor } from './custom-cache.interceptor';
import { ExecutionContext } from '@nestjs/common';
import { isCachingIgnored } from '@common/utils';
import { Test, TestingModule } from '@nestjs/testing';
import {
  mockRequestMethod,
  provideCacheManager,
  provideReflector,
} from './mocks';

jest.mock('@common/utils');

describe('CustomCacheInterceptor.isRequestCacheable', () => {
  let interceptor: CustomCacheInterceptor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomCacheInterceptor,
        provideCacheManager(),
        provideReflector(),
      ],
    }).compile();

    interceptor = module.get<CustomCacheInterceptor>(CustomCacheInterceptor);
  });

  it('should call isCachingIgnored util function', () => {
    (isCachingIgnored as jest.Mock).mockReturnValue(true);
    interceptor.isRequestCacheable(mockContext as ExecutionContext);

    expect(isCachingIgnored).toHaveBeenCalledTimes(1);
    expect(isCachingIgnored).toHaveBeenCalledWith(mockContext, mockReflector);
  });

  describe('should return false', () => {
    it('if method is not in this.allowedMethods', () => {
      (isCachingIgnored as jest.Mock).mockReturnValue(false);
      mockRequestMethod('POST');

      const result = interceptor.isRequestCacheable(
        mockContext as ExecutionContext
      );

      expect(result).toBeFalsy();
    });

    it('if isCachingIgnored returns true', () => {
      (isCachingIgnored as jest.Mock).mockReturnValue(true);
      mockRequestMethod('GET');

      const result = interceptor.isRequestCacheable(
        mockContext as ExecutionContext
      );

      expect(result).toBeFalsy();
    });
  });

  describe('should return true', () => {
    it('should return true if method is GET and isCachingIgnored returns false ', () => {
      (isCachingIgnored as jest.Mock).mockReturnValue(false);
      mockRequestMethod('GET');

      const result = interceptor.isRequestCacheable(
        mockContext as ExecutionContext
      );

      expect(result).toBeTruthy();
    });
  });
});
