import { mockAgents } from '@auth/mocks';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { mockUser } from '@user/mocks';

export const mockRequestHeaderKey = 'user-agent';
export const mockRequestCookieKey = 'my-cookie';

export const mockRequestCookies = {
  [mockRequestCookieKey]: 'my-cookie',
};

export const mockContext: Partial<ExecutionContext> = {
  switchToHttp: jest.fn().mockReturnValue({
    getRequest: jest.fn().mockReturnValue({
      user: mockUser,
      headers: {
        [mockRequestHeaderKey]: mockAgents.POSTMAN,
      },
      cookies: mockRequestCookies,
    }),
  }),
  getHandler: jest.fn(),
  getClass: jest.fn(),
};

export const mockReflector: Partial<Reflector> = {
  get: jest.fn(),
  getAllAndOverride: jest.fn().mockReturnValue(true),
};

export const mockReflectorProvider = () => ({
  provide: Reflector,
  useValue: mockReflector,
});
