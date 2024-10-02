import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { Product } from './entities/product.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  productDto,
  productFinalMock,
  productMock,
  productRepositoryProvider,
  updatedProductDto,
  updateProduct,
} from './mocks/productProvider';
import { getRepositoryToken } from '@nestjs/typeorm';
import { shopCategoryMock } from '../shop/shop-category/mocks/shopCategoryProvider';
import {
  photoDto,
  photoMock,
  photoRepositoryProvider,
  updatePhotoDto,
} from './mocks/photoProvider';
import { Photo } from './entities/photo.entity';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: MockRepository<Product>;
  let photoRepository: MockRepository<Photo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        productRepositoryProvider,
        photoRepositoryProvider,
      ],
    }).compile();

    service = await module.resolve<ProductService>(ProductService);
    productRepository = module.get<MockRepository<Product>>(
      getRepositoryToken(Product)
    );
    photoRepository = module.get<MockRepository<Photo>>(
      getRepositoryToken(Photo, 'mongodb')
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create', () => {
    it('should create product', async () => {
      photoRepository.save?.mockResolvedValue(photoMock);

      const result = await service.create(
        photoDto,
        productDto,
        shopCategoryMock
      );

      expect(photoRepository.create).toHaveBeenCalled();
      expect(photoRepository.create).toHaveBeenCalledWith(photoDto);

      expect(productRepository.create).toHaveBeenCalled();
      expect(result).toEqual(productMock);
    });
  });

  describe('Find', () => {
    it('should find all products', async () => {
      productRepository.find?.mockResolvedValue([productMock]);
      photoRepository.findOneBy?.mockResolvedValue(photoMock);

      const result = await service.findAll();

      expect(result).toEqual([productFinalMock]);
      expect(productRepository.find).toHaveBeenCalled();
      expect(productRepository.find).toHaveBeenCalledWith();
    });

    it('should find all products by category', async () => {
      productRepository.find?.mockResolvedValue([productMock]);
      photoRepository.findOneBy?.mockResolvedValue(photoMock);

      const result = await service.findAllByCategory(shopCategoryMock.id);

      expect(productRepository.find).toHaveBeenCalled();
      expect(productRepository.find).toHaveBeenCalledWith({
        where: { shopCategory: { id: shopCategoryMock.id } },
      });
      expect(result).toEqual([productFinalMock]);
    });

    it('should fail to find all products by category', async () => {
      productRepository.find?.mockResolvedValue([]);

      const result = await service.findAllByCategory(+shopCategoryMock.id);

      expect(productRepository.find).toHaveBeenCalled();
      expect(productRepository.find).toHaveBeenCalledWith({
        where: { shopCategory: { id: +shopCategoryMock.id } },
      });
      expect(result).toEqual([]);
    });

    it('should find concrete product', async () => {
      productRepository.findOneBy?.mockResolvedValue(productMock);
      photoRepository.findOneBy?.mockResolvedValue(photoMock);

      const result = await service.findOneBy(productMock.id);

      expect(productRepository.findOneBy).toHaveBeenCalled();
      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: productMock.id,
      });
      expect(result).toEqual(productFinalMock);
    });

    it('should fail to find concrete product', async () => {
      productRepository.findOneBy?.mockResolvedValue(null);

      const result = await service.findOneBy(+productMock.id);

      expect(productRepository.findOneBy).toHaveBeenCalled();
      expect(productRepository.findOneBy).toHaveBeenCalledWith({
        id: +productMock.id,
      });
      expect(result).toEqual(null);
    });

    it('should not find any products', async () => {
      productRepository.find?.mockResolvedValue([]);

      const result = await service.findAll();

      expect(productRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('Update', () => {
    it('should update existing product', async () => {
      productRepository.findOneBy?.mockResolvedValue(productMock);

      const result = await service.update(
        productMock.id,
        updatePhotoDto,
        updatedProductDto
      );

      expect(productRepository.save).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledWith(updateProduct);
      expect(result).toEqual(updateProduct);
    });

    it('should throw Error due to non-existing product', async () => {
      productRepository.findOneBy?.mockResolvedValue(undefined);

      await expect(
        service.update(productMock.id, updatePhotoDto, updatedProductDto)
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
