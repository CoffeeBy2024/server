import { ShopCategory } from '../entities/shop-category.entity';
import { shopMock } from '../../shop/mocks/shopProvider';
import { categoryMock } from '../../../../modules/category/mocks/categoryProvider';

const shopCategoryMock: ShopCategory = {
  id: 1,
  shop: shopMock,
  category: categoryMock,
  products: [],
};

export { shopCategoryMock };
