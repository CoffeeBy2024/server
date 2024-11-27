import { invalidateCache } from './invalidate-cache.util';
import { Cache } from '@nestjs/cache-manager';
import { getMockCacheManager, MockCacheManagerType } from '@user/mocks';

describe('invalidateCache', () => {
  const mockKey = 'mock-key';
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
    await invalidateCache(cacheManager as unknown as Cache, mockKey);
    expect(cacheManager.get).toHaveBeenCalledTimes(1);
    expect(cacheManager.get).toHaveBeenCalledWith(mockKey);
  });
  describe('for cached entity', () => {
    it('should call cache del method', async () => {
      await invalidateCache(cacheManager as unknown as Cache, mockKey);
      expect(cacheManager.del).toHaveBeenCalledTimes(1);
      expect(cacheManager.del).toHaveBeenCalledWith(mockKey);
    });
  });
  describe('for non cached entity', () => {
    it('should not call del method', async () => {
      cacheManager.get.mockResolvedValueOnce(null);
      await invalidateCache(cacheManager as unknown as Cache, mockKey);
      expect(cacheManager.del).toHaveBeenCalledTimes(0);
    });
  });
});
