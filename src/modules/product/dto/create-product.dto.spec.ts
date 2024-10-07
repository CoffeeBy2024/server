import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { plainToInstance } from 'class-transformer';

describe('CreateProductDto', () => {
  let dto: CreateProductDto;

  beforeEach(() => {
    dto = new CreateProductDto();
  });

  describe('Positive Tests', () => {
    it('should pass validation with valid name and price', async () => {
      dto.name = 'Sample Product';
      dto.price = 19.99;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should transform price from string to number and pass validation', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: 'Sample Product',
        price: '29.99',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
      expect(typeof dto.price).toBe('number');
    });
  });

  describe('Negative Tests', () => {
    it('should fail validation when name is empty', async () => {
      dto.name = '';
      dto.price = 19.99;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail validation when price is not a valid number', async () => {
      dto.name = 'Sample Product';
      dto.price = 'invalid' as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as CreateProductDto;
  });
});
