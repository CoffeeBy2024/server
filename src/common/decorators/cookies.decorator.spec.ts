import {
  mockContext,
  mockRequestCookieKey,
  mockRequestCookies,
} from '@auth/guards/mocks';
import { Cookies } from './cookies.decorator';
import { ExecutionContext } from '@nestjs/common';
import { getParamDecoratorFactory } from './mocks';

describe('Cookies', () => {
  describe('for existing cookie key', () => {
    it('should return expected value ', () => {
      const factory = getParamDecoratorFactory(Cookies);
      const result = factory(
        mockRequestCookieKey,
        mockContext as ExecutionContext
      );
      expect(result).toBe(mockRequestCookies[mockRequestCookieKey]);
    });
  });
  describe('for non existing cookie key', () => {
    it('should return null', () => {
      const factory = getParamDecoratorFactory(Cookies);
      const result = factory('random', mockContext as ExecutionContext);
      expect(result).toBeNull();
    });
  });
});
