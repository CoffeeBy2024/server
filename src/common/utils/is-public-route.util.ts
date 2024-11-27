import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ExecutionContext } from '@nestjs/common';

export const isPublicRoute = (
  context: ExecutionContext,
  reflector: Reflector
) => {
  return reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
    context.getHandler(),
    context.getClass(),
  ]);
};
