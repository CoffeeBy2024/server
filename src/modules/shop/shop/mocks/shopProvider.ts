import { ObjectLiteral, Repository } from 'typeorm';
import { Shop } from '../entities/shop.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const shopMock: Shop = {
  id: 1,
  coordinates: { type: 'Point', coordinates: [31, 32] },
  name: 'Starbucks',
  working_hours: [],
  shopCategories: [],
};

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  save: jest.fn(),
  findOneBy: jest.fn(({ id }) => {
    return {
      id: id,
      coordinates: { type: 'Point', coordinates: [31, 32] },
      name: 'Starbucks',
      working_hours: [],
      shopCategories: [],
    };
  }),
});

const shopRepositoryProvider = {
  provide: getRepositoryToken(Shop),
  useValue: createMockRepository(),
};

export { shopMock, shopRepositoryProvider };
