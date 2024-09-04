import { ObjectLiteral, Repository } from 'typeorm';
import { Shop } from '../entities/shop.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateShopDto } from '../dto/create-shop.dto';

const shopDto: CreateShopDto = {
  coordinates: { type: 'Point', coordinates: [31, 32] },
  name: 'Starbucks',
  working_hours: [],
};

const shopMock: Shop = {
  id: 1,
  coordinates: { type: 'Point', coordinates: [31, 32] },
  name: 'Starbucks',
  working_hours: [],
  shopCategories: [],
};

const updatedShop: Shop = {
  ...shopMock,
  name: 'Starbucks & Co',
};

const arrMockShop: Shop[] = [
  { ...shopMock, id: 1, name: 'Starbucks' },
  { ...shopMock, id: 2, name: 'Dobro' },
];

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  create: jest
    .fn()
    .mockImplementation((shopDto: CreateShopDto) =>
      Promise.resolve({ id: 1, ...shopDto, shopCategories: [] })
    ),
  save: jest.fn().mockImplementation((shop) => Promise.resolve(shop)),
  find: jest.fn(),
  findOneBy: jest.fn(({ id }) => {
    return {
      id: id,
      coordinates: { type: 'Point', coordinates: [31, 32] },
      name: 'Starbucks',
      working_hours: [],
      shopCategories: [],
    };
  }),
  update: jest.fn(),
  delete: jest.fn().mockImplementation(() => ({ affected: 1 })),
});

const shopRepositoryProvider = {
  provide: getRepositoryToken(Shop),
  useValue: createMockRepository(),
};

export { shopDto, shopMock, updatedShop, arrMockShop, shopRepositoryProvider };
