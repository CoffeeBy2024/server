import { validate } from 'class-validator';
import { CreateShopDto } from './create-shop.dto';
import { Point } from 'typeorm';

describe('CreateShopDto', () => {
  let dto: CreateShopDto;

  const coordinates: Point = {
    type: 'Point',
    coordinates: [40.7128, -74.006],
  };

  beforeEach(() => {
    dto = new CreateShopDto();
  });

  describe('Positive Tests', () => {
    it('should succeed when all required fields are valid', async () => {
      Object.assign(dto, { name: 'Shop Name', coordinates });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should succeed when coordinates are not provided', async () => {
      Object.assign(dto, { name: 'Shop Name' });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail when name is not provided', async () => {
      Object.assign(dto, { coordinates });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when name is not a string', async () => {
      Object.assign(dto, { name: 12345 as any });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as CreateShopDto;
  });
});
