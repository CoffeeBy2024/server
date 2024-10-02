import { ExecutionContext, Injectable } from '@nestjs/common';

import { CacheInterceptor } from '@nestjs/cache-manager';
import { isCachingIgnored } from '@common/utils';

@Injectable()
export class CustomCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const request = http.getRequest();

    const ignoreCaching: boolean = isCachingIgnored(context, this.reflector);

    return this.allowedMethods.includes(request.method) && !ignoreCaching;
  }
}
