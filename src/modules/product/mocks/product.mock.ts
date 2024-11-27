import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from '@product/entities';
import { ObjectLiteral, Repository } from 'typeorm';
import { shopCategoryMock } from '@shop/shop-category/mocks';
import { CreateProductDto, UpdateProductDto } from '@product/dto';
import { productPhotoMock as photoMock } from '@photo/mocks';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn().mockImplementation((productDto: CreateProductDto) => ({
    id: productMock.id,
    ...productDto,
    photo: photoMock._id.toString(),
  })),
  save: jest.fn().mockImplementation((product) => product),
  find: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
});

const productRepositoryProvider = {
  provide: getRepositoryToken(Product),
  useValue: createMockRepository(),
};

const productDto: CreateProductDto = {
  name: 'Americano',
  price: 12.99,
  description: 'Product Mock',
};

const productMock: Product = {
  id: 1,
  ...productDto,
  photo: photoMock._id.toString(),
  shopCategory: shopCategoryMock,
};

const productFinalMock = {
  ...productMock,
  photo: photoMock.image,
};

const updatedProductDto: UpdateProductDto = {
  price: 9.99,
};

const updateProduct: Product = {
  ...productMock,
  ...updatedProductDto,
};

export {
  productRepositoryProvider,
  productDto,
  productMock,
  productFinalMock,
  updatedProductDto,
  updateProduct,
};
