import { Test } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import {
  productDto,
  productFinalMock,
  productMock,
  productRepositoryProvider,
  updatedProductDto,
  updateProduct,
} from './mocks/productProvider';
import { ShopService } from '../shop/shop/shop.service';
import { ShopCategoryService } from '../shop/shop-category/shop-category.service';
import { CategoryService } from '../category/category.service';
import {
  shopMock,
  shopRepositoryProvider,
} from '../shop/shop/mocks/shopProvider';
import {
  shopCategoryMock,
  shopCategoryRepositoryProvider,
} from '../shop/shop-category/mocks/shopCategoryProvider';
import {
  categoryMock,
  categoryRepositoryProvider,
} from '../category/mocks/categoryProvider';
import { CATEGORY } from '../../common/enums/category.enum';
import {
  fileMock,
  photoDto,
  shopPhotoRepositoryProvider,
  productPhotoRepositoryProvider,
} from '../photo/mocks/photoProvider';
import { NotFoundException } from '@nestjs/common';
import { PhotoService } from '../photo/photo.service';

describe('Product Controller', () => {
  let controller: ProductController;
  let spyService: ProductService;

  let categoryService: CategoryService;
  let shopService: ShopService;
  let shopCategoryService: ShopCategoryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        ProductService,
        productRepositoryProvider,
        ShopService,
        shopRepositoryProvider,
        ShopCategoryService,
        shopCategoryRepositoryProvider,
        CategoryService,
        categoryRepositoryProvider,
        PhotoService,
        shopPhotoRepositoryProvider,
        productPhotoRepositoryProvider,
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    spyService = module.get<ProductService>(ProductService);

    categoryService = module.get<CategoryService>(CategoryService);
    shopService = module.get<ShopService>(ShopService);
    shopCategoryService = module.get<ShopCategoryService>(ShopCategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET product', () => {
    it('should get concrete Product from concrete Shop', async () => {
      jest.spyOn(spyService, 'findOneBy').mockResolvedValue(productFinalMock);

      const result = await controller.findOne(productFinalMock.id);

      expect(spyService.findOneBy).toHaveBeenCalled();
      expect(spyService.findOneBy).toHaveBeenCalledWith(productFinalMock.id);
      expect(result).toBe(productFinalMock);
    });

    describe('should get products from concrete Shop', () => {
      it('should get All products from concrete Shop', async () => {
        jest.spyOn(spyService, 'findAll').mockResolvedValue([productFinalMock]);

        const result = await controller.getCategorySelection(shopMock.id);

        expect(spyService.findAll).toHaveBeenCalled();
        expect(spyService.findAll).toHaveBeenCalledWith();
        expect(result).toEqual([productFinalMock]);
      });

      it('should get all products of certain category from concrete Shop', async () => {
        jest
          .spyOn(spyService, 'findAllByCategory')
          .mockResolvedValue([productFinalMock]);

        const result = await controller.getCategorySelection(
          shopMock.id,
          categoryMock.name
        );

        expect(spyService.findAllByCategory).toHaveBeenCalled();
        expect(spyService.findAllByCategory).toHaveBeenCalledWith(
          shopCategoryMock.id
        );
        expect(result).toEqual([productFinalMock]);
      });
    });

    it('should throw Error due to not-found category', async () => {
      jest.spyOn(categoryService, 'findOne').mockResolvedValue(null);

      const differentCategory = 'salad' as CATEGORY;

      try {
        await controller.getCategorySelection(shopMock.id, differentCategory);
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(
          `Category with name ${differentCategory} not found`
        );
      }
    });

    it('should throw Error due to not-found shop', async () => {
      jest.spyOn(shopCategoryService, 'findOneById').mockResolvedValue(null);

      const differentId = 73;

      try {
        await controller.getCategorySelection(differentId, CATEGORY['coffee']);
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(`Shop with id ${differentId} not found`);
      }
    });
  });

  describe('POST product', () => {
    it('should post product of existing category into concrete Shop', async () => {
      jest.spyOn(spyService, 'create').mockResolvedValue(productMock);

      const result = await controller.create(
        shopMock.id,
        categoryMock.name,
        productDto,
        fileMock
      );

      expect(spyService.create).toHaveBeenCalled();
      expect(spyService.create).toHaveBeenCalledWith(
        photoDto,
        productDto,
        shopCategoryMock
      );
      expect(result).toBe(productMock);
    });

    it('should post product of not yet existing category into concrete Shop', async () => {
      jest.spyOn(spyService, 'create').mockResolvedValue(productMock);

      const differentCategory = CATEGORY['drinks'];

      const result = await controller.create(
        shopMock.id,
        differentCategory,
        productDto,
        fileMock
      );

      expect(spyService.create).toHaveBeenCalled();
      expect(spyService.create).toHaveBeenCalledWith(photoDto, productDto, {
        ...shopCategoryMock,
        category: { ...shopCategoryMock.category, name: differentCategory },
      });
      expect(result).toBe(productMock);
    });

    it('should throw Error due to not-found category', async () => {
      jest.spyOn(categoryService, 'findOne').mockResolvedValue(null);

      const differentCategory = 'salad' as CATEGORY;

      try {
        await controller.create(
          shopMock.id,
          differentCategory,
          productDto,
          fileMock
        );
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(
          `Category with name ${differentCategory} not found`
        );
      }
    });

    it('should throw Error due to not-found shop', async () => {
      jest.spyOn(shopService, 'findOne').mockResolvedValue(null);

      const differentId = 73;

      try {
        await controller.create(
          differentId,
          CATEGORY['coffee'],
          productDto,
          fileMock
        );
        expect(false).toBeTruthy();
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(`Shop with id ${differentId} not found`);
      }
    });
  });

  describe('PATCH product', () => {
    it('should update product in concrete Shop', async () => {
      jest.spyOn(spyService, 'update').mockResolvedValue(updateProduct);

      const result = await controller.update(
        productFinalMock.id,
        updatedProductDto,
        fileMock
      );

      expect(spyService.update).toHaveBeenCalled();
      expect(spyService.update).toHaveBeenCalledWith(
        productFinalMock.id,
        { image: fileMock.buffer },
        updatedProductDto
      );
      expect(result).toEqual(updateProduct);
    });
  });

  describe('DELETE product', () => {
    it('should delte product from concrete Shop', async () => {
      jest.spyOn(spyService, 'remove').mockResolvedValue(true);

      const result = await controller.remove(productMock.id);

      expect(spyService.remove).toHaveBeenCalled();
      expect(spyService.remove).toHaveBeenCalledWith(productMock.id);
      expect(result).toBe(true);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
