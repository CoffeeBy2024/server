import { validate } from 'class-validator';
import { UpdateProductDto } from './update-product.dto';
describe('UpdateProductDto', () => {
  let dto: UpdateProductDto;

  beforeEach(() => {
    dto = new UpdateProductDto();
  });

  describe('Positive Tests', () => {
    it('should succeed when all fields are valid', async () => {
      Object.assign(dto, {
        name: 'Updated Product Name',
        price: 129.99,
        description: 'An updated product description',
        image: Buffer.from(''),
      });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should succeed when no fields are provided', async () => {
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should succeed when only one field (name) is provided', async () => {
      Object.assign(dto, { name: 'Updated Product Name' });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should succeed when only one field (price) is provided', async () => {
      Object.assign(dto, { price: 199.99 });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });

    it('should succeed because description is allowed to be null', async () => {
      Object.assign(dto, { description: null as any });

      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail when name is provided but is not a string', async () => {
      Object.assign(dto, { name: 1234 as any });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isString).toBeDefined();
    });

    it('should fail when price is provided but is not a number', async () => {
      Object.assign(dto, { price: 'Not a Number' as any });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNumber).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as UpdateProductDto;
  });
});
