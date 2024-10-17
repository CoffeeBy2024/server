import { SetMetadata } from '@nestjs/common';
import { NO_CACHE_KEY, NoCache } from './no-cache.decorator';

jest.mock('@nestjs/common');

const mockSetMetadataReturnValue = 'mockSetMetadataReturnValue';

describe('NoCache', () => {
  it('should call setMetadata function', () => {
    (SetMetadata as jest.Mock).mockReturnValue(mockSetMetadataReturnValue);
    const result = NoCache();

    expect(SetMetadata).toHaveBeenCalledTimes(1);
    expect(SetMetadata).toHaveBeenCalledWith(NO_CACHE_KEY, true);

    expect(result).toBe(mockSetMetadataReturnValue);
  });
});
