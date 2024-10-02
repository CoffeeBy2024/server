import { mockContext, mockReflector } from '@auth/guards/mocks';
import { CustomCacheInterceptor } from './custom-cache.interceptor';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { isCachingIgnored } from '@common/utils';

jest.mock('@common/utils');

const mockCacheManager = {};

describe('CustomCacheInterceptor.isRequestCacheable', () => {
  let interceptor: CustomCacheInterceptor;

  beforeEach(() => {
    interceptor = new CustomCacheInterceptor(
      mockCacheManager,
      mockReflector as Reflector
    );
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

      (mockContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'POST',
        }),
      });

      const result = interceptor.isRequestCacheable(
        mockContext as ExecutionContext
      );

      expect(result).toBeFalsy();
    });

    it('if isCachingIgnored returns true', () => {
      (isCachingIgnored as jest.Mock).mockReturnValue(true);

      (mockContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
        }),
      });

      const result = interceptor.isRequestCacheable(
        mockContext as ExecutionContext
      );

      expect(result).toBeFalsy();
    });
  });

  describe('should return true', () => {
    it('should return true if method is GET and isCachingIgnored returns false ', () => {
      (isCachingIgnored as jest.Mock).mockReturnValue(false);
      (mockContext.switchToHttp as jest.Mock).mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          method: 'GET',
        }),
      });

      const result = interceptor.isRequestCacheable(
        mockContext as ExecutionContext
      );

      expect(result).toBeTruthy();
    });
  });
});
