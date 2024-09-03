import { ShopCategory } from '../entities/shop-category.entity';
import { shopMock } from '../../shop/mocks/shopProvider';
import { categoryMock } from '../../../../modules/category/mocks/categoryProvider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';

const shopCategoryMock: ShopCategory = {
  id: 1,
  shop: shopMock,
  category: categoryMock,
  products: [],
};

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest.fn().mockImplementation(() => Promise.resolve(shopCategoryMock)),
  save: jest.fn(),
  find: jest.fn().mockImplementation(() => {
    return [shopCategoryMock];
  }),
  findOne: jest.fn().mockImplementation(() => shopCategoryMock),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});

const shopCategoryRepositoryProvider = {
  provide: getRepositoryToken(ShopCategory),
  useValue: createMockRepository(),
};

export { shopCategoryRepositoryProvider, shopCategoryMock };
