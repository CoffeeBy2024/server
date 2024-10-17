import { Cache } from '@nestjs/cache-manager';

export const invalidateCache = async (cacheManager: Cache, key: string) => {
  const cachedUser = await cacheManager.get(key);

  if (cachedUser) {
    await cacheManager.del(key);
  }
};
