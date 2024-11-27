import { ObjectLiteral, Repository } from 'typeorm';
import { Shop } from '../entities/shop.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateShopDto } from '../dto/create-shop.dto';
import { shopPhotoMock as photoMock } from '../../../../modules/photo/mocks/photoProvider';

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
  findOneBy: jest.fn(({ id }) => ({ ...shopMock, id: id })),
  update: jest.fn(),
  delete: jest.fn().mockImplementation(() => ({ affected: 1 })),
});

const shopRepositoryProvider = {
  provide: getRepositoryToken(Shop),
  useValue: createMockRepository(),
};

const shopDto: CreateShopDto = {
  coordinates: { type: 'Point', coordinates: [31, 32] },
  name: 'Starbucks',
  working_hours: [],
};

const shopMock: Shop = {
  id: 1,
  coordinates: { type: 'Point', coordinates: [31, 32] },
  name: 'Starbucks',
  photo: photoMock._id.toString(),
  working_hours: [],
  shopCategories: [],
};

const updatedShop: Shop = {
  ...shopMock,
  name: 'Starbucks & Co',
};

export { shopDto, shopMock, updatedShop, shopRepositoryProvider };
