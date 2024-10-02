import { Test, TestingModule } from '@nestjs/testing';
import { ShopCategoryService } from './shop-category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShopCategory } from './entities/shop-category.entity';
import { Category } from '../../category/entities/category.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { categoryMock } from '../../../modules/category/mocks/categoryProvider';
import { shopMock } from '../shop/mocks/shopProvider';
import {
  createShopCategoryDto,
  shopCategoryMock,
  shopCategoryRepositoryProvider,
} from './mocks/shopCategoryProvider';

type MockRepository<T extends ObjectLiteral = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;

describe('ShopCategoryService', () => {
  let service: ShopCategoryService;
  let shopCategoryRepository: MockRepository<ShopCategory>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopCategoryService, shopCategoryRepositoryProvider],
    }).compile();

    service = module.get<ShopCategoryService>(ShopCategoryService);
    shopCategoryRepository = module.get<MockRepository<ShopCategory>>(
      getRepositoryToken(ShopCategory)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create', () => {
    it('should create a new shop category', async () => {
      const result = await service.create(createShopCategoryDto);

      expect(shopCategoryRepository.create).toHaveBeenCalledWith(
        createShopCategoryDto
      );
      expect(shopCategoryRepository.save).toHaveBeenCalledWith(
        shopCategoryMock
      );
      expect(result).toEqual(shopCategoryMock);
    });
  });

  describe('Find', () => {
    it('should find all shop categories', async () => {
      shopCategoryRepository.find?.mockResolvedValue([shopCategoryMock]);

      const result = await service.findAll();

      expect(shopCategoryRepository.find).toHaveBeenCalled();
      expect(result).toEqual([shopCategoryMock]);
    });

    it('should find all shop categories by category name', async () => {
      shopCategoryRepository.find?.mockResolvedValue([shopCategoryMock]);

      const result = await service.findAllByCategory(categoryMock);

      expect(shopCategoryRepository.find).toHaveBeenCalledWith({
        where: { category: categoryMock },
        relations: ['category', 'shop'],
      });
      expect(result).toEqual([shopCategoryMock]);
    });

    it('should find one shop category by category name', async () => {
      shopCategoryRepository.findOne?.mockResolvedValue(shopCategoryMock);

      const result = await service.findOneByCategory(shopMock.id, categoryMock);

      expect(shopCategoryRepository.findOne).toHaveBeenCalledWith({
        where: { shop: { id: shopMock.id }, category: { id: categoryMock.id } },
      });
      expect(result).toEqual(shopCategoryMock);
    });

    describe('findOneById', () => {
      it('should find one shop category by shop and category id', async () => {
        shopCategoryRepository.findOne?.mockResolvedValue(shopCategoryMock);

        const result = await service.findOneById(shopMock.id, categoryMock);

        expect(shopCategoryRepository.findOne).toHaveBeenCalledWith({
          where: {
            shop: { id: shopMock.id },
            category: categoryMock,
          },
          relations: ['category', 'shop'],
        });
        expect(result).toEqual(shopCategoryMock);
      });
    });
  });

  describe('Remove', () => {
    it('should remove shop category by category name', async () => {
      const category: Category = categoryMock;

      shopCategoryRepository.delete?.mockResolvedValue({ affected: 1 });

      const result = await service.remove(category);

      expect(shopCategoryRepository.delete).toHaveBeenCalledWith({ category });
      expect(result).toBe(true);
    });
  });
});
