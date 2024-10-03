import { mockContext, mockReflector } from '@auth/guards/mocks';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NO_CACHE_KEY } from '@common/decorators';
import { isCachingIgnored } from './is-caching-ignored.util';

describe('isCachingIgnored', () => {
  it('should call reflector.getAllAndOverride method', () => {
    isCachingIgnored(
      mockContext as ExecutionContext,
      mockReflector as Reflector
    );

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledTimes(1);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(NO_CACHE_KEY, [
      mockContext.getHandler?.(),
      mockContext.getClass?.(),
    ]);
  });
  it('should return expected boolean value', () => {
    const result = isCachingIgnored(
      mockContext as ExecutionContext,
      mockReflector as Reflector
    );

    expect(result).toBeTruthy();
  });
});
