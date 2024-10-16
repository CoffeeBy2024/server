import { validate } from 'class-validator';
import { UpdatePhotoDto } from './update-photo.dto';

describe('UpdatePhotoDto', () => {
  let dto: UpdatePhotoDto;

  beforeEach(() => {
    dto = new UpdatePhotoDto();
  });

  describe('Positive Tests', () => {
    it('should pass validation when image is provided', async () => {
      dto.image = Buffer.from('some image data');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when image is not provided (undefined)', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail validation if image is set to an invalid type', async () => {
      (dto as any).image = 'invalid string';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  afterEach(() => {
    dto = {} as UpdatePhotoDto;
  });
});
