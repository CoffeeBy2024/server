import { shopCategoryMock } from '../../../modules/shop/shop-category/mocks/shopCategoryProvider';
import { Category } from '../entities/category.entity';

const categoryMock: Category = {
  id: 1,
  name: 'coffee',
  shopCategory: shopCategoryMock,
};

const arrMockCategories: Category[] = [
  { ...categoryMock, id: 1, name: 'coffee' },
  { ...categoryMock, id: 2, name: 'drinks' },
];

export { categoryMock, arrMockCategories };
