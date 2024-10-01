import { validate } from 'class-validator';
import { UpdateShopDto } from './update-shop.dto';
import { Point } from 'typeorm';

describe('UpdateShopDto', () => {
  let dto: UpdateShopDto;

  const coordinates: Point = {
    type: 'Point',
    coordinates: [40.7128, -74.006],
  };

  beforeEach(() => {
    dto = new UpdateShopDto();
  });

  describe('Positive Tests', () => {
    it('should succeed when all fields are valid', async () => {
      Object.assign(dto, { name: 'Updated Shop Name', coordinates });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail when name is not a string', async () => {
      Object.assign(dto, { name: 12345 as any });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as UpdateShopDto;
  });
});
