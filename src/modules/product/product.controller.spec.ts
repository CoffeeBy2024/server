import { Test } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import {
  productDto,
  productMock,
  productRepositoryProvider,
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

describe('Product Controller', () => {
  let controller: ProductController;
  let spyService: ProductService;

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
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    spyService = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET product', () => {
    it('should get concrete Product from concrete Shop', async () => {
      jest.spyOn(spyService, 'findOneBy').mockResolvedValue(productMock);

      const result = await controller.findOne(shopMock.id, productMock.id);

      expect(spyService.findOneBy).toHaveBeenCalled();
      expect(spyService.findOneBy).toHaveBeenCalledWith(productMock.id);
      expect(result).toBe(productMock);
    });

    describe('should get products from concrete Shop', () => {
      it('should get All products from concrete Shop', async () => {
        jest.spyOn(spyService, 'findAll').mockResolvedValue([productMock]);

        const result = await controller.getCategorySelection(shopMock.id, '');

        expect(spyService.findAll).toHaveBeenCalled();
        expect(spyService.findAll).toHaveBeenCalledWith();
        expect(result).toEqual([productMock]);
      });

      it('should get all products of certain category from concrete Shop', async () => {
        jest
          .spyOn(spyService, 'findAllByCategory')
          .mockResolvedValue([productMock]);

        const result = await controller.getCategorySelection(
          shopMock.id,
          categoryMock.name
        );

        expect(spyService.findAllByCategory).toHaveBeenCalled();
        expect(spyService.findAllByCategory).toHaveBeenCalledWith(
          shopCategoryMock.id
        );
        expect(result).toEqual([productMock]);
      });
    });
  });

  describe('POST product', () => {
    it('should post product of existing category into concrete Shop', async () => {
      jest.spyOn(spyService, 'create').mockResolvedValue(productMock);

      const result = await controller.create(
        shopMock.id,
        categoryMock.name,
        productDto
      );

      expect(spyService.create).toHaveBeenCalled();
      expect(spyService.create).toHaveBeenCalledWith(
        productDto,
        shopCategoryMock
      );
      expect(result).toBe(productMock);
    });

    it('should post product of not yet existing category into concrete Shop', async () => {
      jest.spyOn(spyService, 'create').mockResolvedValue(productMock);

      const differentCategory = 'drinks';

      const result = await controller.create(
        shopMock.id,
        differentCategory,
        productDto
      );

      expect(spyService.create).toHaveBeenCalled();
      expect(spyService.create).toHaveBeenCalledWith(productDto, {
        ...shopCategoryMock,
        category: { ...shopCategoryMock.category, name: differentCategory },
      });
      expect(result).toBe(productMock);
    });
  });

  describe('PATCH product', () => {
    it('should update product in concrete Shop', async () => {
      jest.spyOn(spyService, 'update').mockResolvedValue(updateProduct);

      const result = await controller.update(productMock.id, updateProduct);

      expect(spyService.update).toHaveBeenCalled();
      expect(spyService.update).toHaveBeenCalledWith(
        productMock.id,
        updateProduct
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
