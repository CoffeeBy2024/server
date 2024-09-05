import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';
describe('CreateProductDto', () => {
  let dto: CreateProductDto;

  beforeEach(() => {
    dto = new CreateProductDto();
  });

  describe('Positive Tests', () => {
    it('should succeed when all required fields are valid', async () => {
      Object.assign(dto, {
        name: ' Americano',
        price: 12.99,
        description: 'A great product',
        image: Buffer.from(''),
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should succeed when description is not provided', async () => {
      Object.assign(dto, {
        name: ' Americano',
        price: 12.99,
        image: Buffer.from(''),
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should succeed becaues description is allowed to be null', async () => {
      Object.assign(dto, {
        name: ' Americano',
        price: 12.99,
        description: null as any,
        image: Buffer.from(''),
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail when name is not provided', async () => {
      Object.assign(dto, {
        price: 12.99,
        image: Buffer.from(''),
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when price is not provided', async () => {
      Object.assign(dto, {
        name: ' Americano',
        image: Buffer.from(''),
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when name is not a string', async () => {
      Object.assign(dto, {
        name: 1234 as any,
        price: 12.99,
        image: Buffer.from(''),
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should fail when price is not a number', async () => {
      Object.assign(dto, {
        name: ' Americano',
        price: 'Not a Number' as any,
        image: Buffer.from(''),
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });

    it('should fail when image is not provided', async () => {
      Object.assign(dto, {
        name: ' Americano',
        price: 12.99,
        description: 'A great product',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as CreateProductDto;
  });
});
