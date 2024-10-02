import { SetMetadata } from '@nestjs/common';

export const NO_CACHE_KEY = 'ignoreCaching';
export const NoCache = () => SetMetadata(NO_CACHE_KEY, true);
