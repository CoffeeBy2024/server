import { mockContext } from '@auth/guards/mocks';
import { User } from './user.decorator';
import { ExecutionContext } from '@nestjs/common';
import { getParamDecoratorFactory } from './mocks';
import { mockUser } from '@user/mocks';

describe('User', () => {
  it('should return expected user', () => {
    const factory = getParamDecoratorFactory(User);
    const result = factory('', mockContext as ExecutionContext);

    expect(result).toBe(mockUser);
  });
});
