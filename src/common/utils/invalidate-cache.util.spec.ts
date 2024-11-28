import { invalidateCache } from './invalidate-cache.util';
import { Cache } from '@nestjs/cache-manager';
import { getMockCacheManager, MockCacheManagerType } from '@user/mocks';
import { cacheMockKey } from './mocks';

describe('invalidateCache', () => {
  let cacheManager: MockCacheManagerType;

  beforeEach(async () => {
    cacheManager = getMockCacheManager();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cacheManager).toBeDefined();
  });

  it('should call cache get method', async () => {
    await invalidateCache(cacheManager as unknown as Cache, cacheMockKey);
    expect(cacheManager.get).toHaveBeenCalledTimes(1);
    expect(cacheManager.get).toHaveBeenCalledWith(cacheMockKey);
  });
  describe('for cached entity', () => {
    it('should call cache del method', async () => {
      await invalidateCache(cacheManager as unknown as Cache, cacheMockKey);
      expect(cacheManager.del).toHaveBeenCalledTimes(1);
      expect(cacheManager.del).toHaveBeenCalledWith(cacheMockKey);
    });
  });
  describe('for non cached entity', () => {
    it('should not call del method', async () => {
      cacheManager.get.mockResolvedValueOnce(null);
      await invalidateCache(cacheManager as unknown as Cache, cacheMockKey);
      expect(cacheManager.del).toHaveBeenCalledTimes(0);
    });
  });
});
