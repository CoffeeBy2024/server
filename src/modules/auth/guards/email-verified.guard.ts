import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { isPublicRoute } from '@utils';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = isPublicRoute(context, this.reflector);
    if (isPublic) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new InternalServerErrorException('User is not found');
    }

    const { isEmailVerified } = user;
    if (!isEmailVerified) {
      throw new ForbiddenException('Email is not verified!');
    }

    return isEmailVerified;
  }
}
