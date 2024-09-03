import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  productDto,
  productMock,
  productRepositoryProvider,
  updatedProductDto,
  updateProduct,
} from './mocks/productProvider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { shopCategoryMock } from '../shop/shop-category/mocks/shopCategoryProvider';
import { shopMock } from '../shop/shop/mocks/shopProvider';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: MockRepository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductService, productRepositoryProvider],
    }).compile();

    service = await module.resolve<ProductService>(ProductService);
    productRepository = module.get<MockRepository<Product>>(
      getRepositoryToken(Product)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create', () => {
    it('should create product', async () => {
      const result = await service.create(productDto, shopCategoryMock);

      expect(productRepository.create).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalled();
      expect(result).toEqual(productMock);
    });
  });

  describe('Find', () => {
    it('should find all products', async () => {
      productRepository.find?.mockResolvedValue([productMock]);
      const result = await service.findAll();

      expect(result).toEqual([productMock]);
      expect(productRepository.find).toHaveBeenCalled();
      expect(productRepository.find).toHaveBeenCalledWith();
    });

    it('should find all products by category', async () => {
      productRepository.find?.mockResolvedValue([productMock]);

      const result = await service.findAllByCategory(shopCategoryMock.id);

      expect(productRepository.find).toHaveBeenCalled();
      expect(productRepository.find).toHaveBeenCalledWith({
        where: { shopCategory: { id: shopCategoryMock.id } },
      });
      expect(result).toEqual([productMock]);
    });

    it('should find concrete product', async () => {
      productRepository.findOneBy?.mockResolvedValue(productMock);

      const result = await service.findOneBy(shopMock.id);

      expect(productRepository.findOneBy).toHaveBeenCalled();
      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: productMock.id,
      });
      expect(result).toBe(productMock);
    });
  });

  describe('Update', () => {
    it('should update existing product', async () => {
      productRepository.findOneBy?.mockResolvedValue(productMock);

      const result = await service.update(productMock.id, updatedProductDto);

      expect(productRepository.save).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledWith(updateProduct);
      expect(result).toEqual(updateProduct);
    });

    it('should throw Error due to non-existing product', async () => {
      productRepository.findOneBy?.mockResolvedValue(undefined);

      await expect(
        service.update(productMock.id, updatedProductDto)
      ).rejects.toThrow('This product does not exist');

      expect(productRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Remove', () => {
    it('should remove concrete product', async () => {
      productRepository.delete?.mockResolvedValue({ affected: 1 });

      const result = await service.remove(productMock.id);

      expect(productRepository.delete).toHaveBeenCalled();
      expect(productRepository.delete).toHaveBeenCalledWith({
        id: productMock.id,
      });
      expect(result).toEqual(true);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
