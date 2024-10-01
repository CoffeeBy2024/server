import { validate } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';
import { CATEGORY } from '../../../common/enums/category.enum';
describe('CreateCategoryDto', () => {
  let dto: CreateCategoryDto;

  beforeEach(() => {
    dto = new CreateCategoryDto();
  });

  describe('Positive Tests', () => {
    it('should succeed when name is a valid string', async () => {
      dto.name = CATEGORY['coffee'];
      const errors = await validate(dto);

      expect(errors.length).toBe(0);
    });
  });

  describe('Negative Tests', () => {
    it('should fail when dto was not specified', async () => {
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });

    it('should fail when name has invalid type', async () => {
      dto.name = 12345 as any;

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail when name is an empty string', async () => {
      dto.name = '' as any;
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints?.isNotEmpty).toBeDefined();
    });
  });

  afterEach(() => {
    dto = {} as CreateCategoryDto;
  });
});
