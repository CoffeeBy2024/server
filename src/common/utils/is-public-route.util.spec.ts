import { mockContext, mockReflector } from '@auth/guards/mocks';
import { isPublicRoute } from './is-public-route.util';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@common/decorators';

describe('isPublicRoute', () => {
  it('should call reflector.getAllAndOverride method', () => {
    isPublicRoute(mockContext as ExecutionContext, mockReflector as Reflector);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledTimes(1);
    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [mockContext.getHandler?.(), mockContext.getClass?.()]
    );
  });
  it('should return expected boolean value', () => {
    const result = isPublicRoute(
      mockContext as ExecutionContext,
      mockReflector as Reflector
    );

    expect(result).toBeTruthy();
  });
});
