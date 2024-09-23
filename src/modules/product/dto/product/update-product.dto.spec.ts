import { validate } from 'class-validator';
import { UpdateProductDto } from './update-product.dto';

describe('UpdateProductDto', () => {
  let dto: UpdateProductDto;

  beforeEach(() => {
    dto = new UpdateProductDto();
  });

  describe('Positive Tests', () => {
    it('should pass validation when name and price are provided', async () => {
      dto.name = 'Updated Product';
      dto.price = 39.99;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when no fields are provided (partial update)', async () => {
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail validation if price is provided but not a valid number', async () => {
      dto.price = 'invalid' as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });

    it('should fail validation if name is provided but is empty', async () => {
      dto.name = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as UpdateProductDto;
  });
});
