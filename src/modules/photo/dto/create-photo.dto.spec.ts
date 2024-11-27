import { validate } from 'class-validator';
import { CreatePhotoDto } from './create-photo.dto';

describe('CreatePhotoDto', () => {
  let dto: CreatePhotoDto;

  beforeEach(() => {
    dto = new CreatePhotoDto();
  });

  describe('Positive Tests', () => {
    it('should pass validation when image is not empty', async () => {
      dto.image = Buffer.from('some image data');

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail validation when image is empty', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as CreatePhotoDto;
  });
});
