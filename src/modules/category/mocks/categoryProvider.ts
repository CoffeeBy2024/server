import { ObjectLiteral, Repository } from 'typeorm';
import { shopCategoryMock } from '../../../modules/shop/shop-category/mocks/shopCategoryProvider';
import { Category } from '../entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const categoryMock: Category = {
  id: 1,
  name: 'coffee',
  shopCategory: shopCategoryMock,
};

const arrMockCategories: Category[] = [
  { ...categoryMock, id: 1, name: 'coffee' },
  { ...categoryMock, id: 2, name: 'drinks' },
];

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  save: jest.fn(),
  findOneBy: jest.fn(),
  findOne: jest.fn().mockImplementation(() => {
    return Promise.resolve(categoryMock);
  }),
});

const categoryRepositoryProvider = {
  provide: getRepositoryToken(Category),
  useValue: createMockRepository(),
};

export { categoryMock, arrMockCategories, categoryRepositoryProvider };
