import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY, Public } from './public.decorator';

jest.mock('@nestjs/common');

const mockSetMetadataReturnValue = 'mockSetMetadataReturnValue';

describe('Public', () => {
  it('should call SetMetadata function', () => {
    (SetMetadata as jest.Mock).mockReturnValue(mockSetMetadataReturnValue);
    const result = Public();

    expect(SetMetadata).toHaveBeenCalledTimes(1);
    expect(SetMetadata).toHaveBeenCalledWith(IS_PUBLIC_KEY, true);

    expect(result).toBe(mockSetMetadataReturnValue);
  });
});
