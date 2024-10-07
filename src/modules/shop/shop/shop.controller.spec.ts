import { Test } from '@nestjs/testing';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ShopCategoryService } from '../shop-category/shop-category.service';
import { CategoryService } from '../../../modules/category/category.service';
import {
  shopDto,
  shopMock,
  shopRepositoryProvider,
  updatedShop,
} from './mocks/shopProvider';
import { shopCategoryRepositoryProvider } from '../shop-category/mocks/shopCategoryProvider';
import { categoryRepositoryProvider } from '../../../modules/category/mocks/categoryProvider';
import { CATEGORY } from '../../../common/enums/category.enum';
import { NotFoundException } from '@nestjs/common';
import {
  fileMock,
  shopPhotoRepositoryProvider,
  productPhotoRepositoryProvider,
  shopPhotoMock as photoMock,
  updatePhotoDto,
  updatedPhotoMock,
  fileUpdateMock,
  photoDto,
} from '../../photo/mocks/photoProvider';
import { PhotoService } from '../../photo/photo.service';

describe('Shop Controller', () => {
  let controller: ShopController;
  let spyService: ShopService;
  let categoryService: CategoryService;
  let photoService: PhotoService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [
        ShopService,
        ShopCategoryService,
        CategoryService,
        PhotoService,
        shopRepositoryProvider,
        shopPhotoRepositoryProvider,
        productPhotoRepositoryProvider,
        shopCategoryRepositoryProvider,
        categoryRepositoryProvider,
      ],
    }).compile();
    controller = module.get<ShopController>(ShopController);
    spyService = module.get<ShopService>(ShopService);
    categoryService = module.get<CategoryService>(CategoryService);
    photoService = module.get<PhotoService>(PhotoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET Shop', () => {
    it('should get concrete shop by id', async () => {
      jest.spyOn(spyService, 'findOne').mockResolvedValue(shopMock);

      const result = await controller.findOne(shopMock.id);

      expect(spyService.findOne).toHaveBeenCalled();
      expect(spyService.findOne).toHaveBeenCalledWith(shopMock.id);
      expect(result).toBe(shopMock);
    });

    describe('should perform category selection', () => {
      it('should get shop according to category', async () => {
        jest.spyOn(spyService, 'findOne').mockResolvedValue(shopMock);

        const result = await controller.getCategorySelection(
          CATEGORY['coffee']
        );
        expect(result).toEqual([shopMock]);
      });

      it('should get shop according to name', async () => {
        jest.spyOn(spyService, 'findByName').mockResolvedValue([shopMock]);
        const resultByName = await controller.getCategorySelection(
          '' as CATEGORY,
          'Starbucks'
        );
        expect(spyService.findByName).toHaveBeenCalled();
        expect(spyService.findByName).toHaveBeenCalledWith('Starbucks');
        expect(resultByName).toEqual([shopMock]);
      });

      it('should get all shop due to no parametrs entered', async () => {
        jest.spyOn(spyService, 'findAll').mockResolvedValue([shopMock]);

        const result = await controller.getCategorySelection();

        expect(spyService.findAll).toHaveBeenCalled();
        expect(spyService.findAll).toHaveBeenCalledWith();
        expect(result).toEqual([shopMock]);
      });

      it('should throw Error due to both Parametrs entered', async () => {
        try {
          await controller.getCategorySelection(
            CATEGORY['coffee'],
            'Starbucks'
          );
          expect(false).toBeTruthy(); // we should never hit this line
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toEqual(
            'Too many parameters entered. Provide either name or category, not both.'
          );
        }
      });

      it('should throw NotFoundException due to not-found shop', async () => {
        jest.spyOn(categoryService, 'findOne').mockResolvedValue(null);

        const nonExistingCategory = 'pizza' as CATEGORY;

        try {
          await controller.getCategorySelection(nonExistingCategory);
          expect(false).toBeTruthy(); // we should never hit this line
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(
            `Category with name ${nonExistingCategory} not found`
          );
        }
      });
    });
  });

  describe('POST Shop', () => {
    it('should create new shop', async () => {
      jest.spyOn(spyService, 'create').mockResolvedValue(shopMock);
      jest.spyOn(photoService, 'create').mockResolvedValue(photoMock);

      const result = await controller.create(shopDto, fileMock);

      expect(spyService.create).toHaveBeenCalled();
      expect(spyService.create).toHaveBeenCalledWith(photoDto, shopDto);
      expect(result).toBe(shopMock);
    });
  });

  describe('Patch Shop', () => {
    it('should update shop info', async () => {
      jest.spyOn(spyService, 'update').mockResolvedValue(updatedShop);
      jest.spyOn(photoService, 'update').mockResolvedValue(updatedPhotoMock);

      const result = await controller.update(
        shopMock.id,
        updatedShop,
        fileUpdateMock
      );

      expect(spyService.update).toHaveBeenCalled();
      expect(spyService.update).toHaveBeenCalledWith(
        shopMock.id,
        updatePhotoDto,
        updatedShop
      );
      expect(result).toEqual(updatedShop);
    });
  });

  describe('Delete Shop', () => {
    it('should delete existing shop', async () => {
      jest.spyOn(spyService, 'remove').mockResolvedValue(true);

      const result = await controller.remove(shopMock.id);

      expect(spyService.remove).toHaveBeenCalled();
      expect(spyService.remove).toHaveBeenCalledWith(shopMock.id);
      expect(result).toBe(true);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
