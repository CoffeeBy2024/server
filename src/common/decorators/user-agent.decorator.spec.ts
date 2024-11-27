import { mockContext } from '@auth/guards/mocks';
import { UserAgent } from './user-agent.decorator';
import { mockAgents } from '@auth/mocks';
import { ExecutionContext } from '@nestjs/common';
import { getParamDecoratorFactory } from './mocks';

describe('UserAgent', () => {
  it('should return expected user-agent', () => {
    const factory = getParamDecoratorFactory(UserAgent);
    const result = factory('', mockContext as ExecutionContext);

    expect(result).toBe(mockAgents.POSTMAN);
  });
});
