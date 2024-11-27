import { NO_CACHE_KEY } from '@common/decorators';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const isCachingIgnored = (
  context: ExecutionContext,
  reflector: Reflector
) => {
  return reflector.getAllAndOverride<boolean>(NO_CACHE_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
};
