import { ObjectLiteral, Repository } from 'typeorm';
import { shopCategoryMock } from '../../../modules/shop/shop-category/mocks/shopCategoryProvider';
import { Category } from '../entities/category.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateCategoryDto } from '../dto/create-category.dto';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest.fn().mockImplementation(
    (dto): CreateCategoryDto => ({
      id: categoryMock.id,
      ...dto,
    })
  ),
  save: jest.fn().mockImplementation(() => categoryMock),
  find: jest.fn(),
  findOne: jest.fn().mockImplementation(({ where: { name: categoryName } }) => {
    return categoryName === categoryMock.name
      ? categoryMock
      : { ...categoryMock, name: categoryName };
  }),
});

const categoryRepositoryProvider = {
  provide: getRepositoryToken(Category),
  useValue: createMockRepository(),
};

const categoryDto: CreateCategoryDto = {
  name: 'coffee',
};

const categoryMock: Category = {
  id: 1,
  name: 'coffee',
  shopCategory: shopCategoryMock,
};

export { categoryRepositoryProvider, categoryDto, categoryMock };
