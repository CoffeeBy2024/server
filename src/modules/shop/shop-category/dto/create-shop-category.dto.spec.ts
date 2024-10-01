import { validate } from 'class-validator';
import { CreateShopCategoryDto } from './create-shop-category.dto';
import { shopMock } from '../../shop/mocks/shopProvider';
import { categoryMock } from '../../../../modules/category/mocks/categoryProvider';

describe('CreateShopCategoryDto', () => {
  let dto: CreateShopCategoryDto;

  beforeEach(() => {
    dto = new CreateShopCategoryDto();
  });

  describe('Positive Tests', () => {
    it('should succeed when shop and category exist', async () => {
      Object.assign(dto, { shop: shopMock, category: categoryMock });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail when shop was not specified', async () => {
      Object.assign(dto, { category: categoryMock });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when category was not specified', async () => {
      Object.assign(dto, { shop: shopMock });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when shop is undefined', async () => {
      Object.assign(dto, { shop: undefined as any, category: categoryMock });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when category is undefined', async () => {
      Object.assign(dto, { shop: shopMock, category: undefined as any });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as CreateShopCategoryDto;
  });
});
