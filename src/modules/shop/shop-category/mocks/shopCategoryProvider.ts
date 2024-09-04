import { ShopCategory } from '../entities/shop-category.entity';
import { shopMock } from '../../shop/mocks/shopProvider';
import { categoryMock } from '../../../../modules/category/mocks/categoryProvider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { CreateShopCategoryDto } from '../dto/create-shop-category.dto';

const shopCategoryMock: ShopCategory = {
  id: 1,
  shop: shopMock,
  category: categoryMock,
  products: [],
};

const createShopCategoryDto: CreateShopCategoryDto = {
  category: categoryMock,
  shop: shopMock,
};

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest
    .fn()
    .mockImplementation(({ shop, category }: CreateShopCategoryDto) => ({
      ...shopCategoryMock,
      shop,
      category,
    })),
  save: jest
    .fn()
    .mockImplementation((shopCategory: ShopCategory) => shopCategory),
  find: jest.fn().mockImplementation(() => {
    return [shopCategoryMock];
  }),
  findOne: jest.fn().mockImplementation(({ where: { category } }) => {
    return category.name === categoryMock.name ? shopCategoryMock : undefined;
  }),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});

const shopCategoryRepositoryProvider = {
  provide: getRepositoryToken(ShopCategory),
  useValue: createMockRepository(),
};

export {
  createShopCategoryDto,
  shopCategoryRepositoryProvider,
  shopCategoryMock,
};
