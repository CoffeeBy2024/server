import { Test } from '@nestjs/testing';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { ShopCategoryService } from '../shop-category/shop-category.service';
import { CategoryService } from '../../../modules/category/category.service';
import {
  arrMockShop,
  shopMock,
  shopRepositoryProvider,
  updatedShop,
} from './mocks/shopProvider';
import { shopCategoryRepositoryProvider } from '../shop-category/mocks/shopCategoryProvider';
import { categoryRepositoryProvider } from '../../../modules/category/mocks/categoryProvider';
import { UpdateShopDto } from './dto/update-shop.dto';

describe('Shop Controller', () => {
  let controller: ShopController;
  let spyService: ShopService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ShopController],
      providers: [
        ShopService,
        ShopCategoryService,
        CategoryService,
        shopRepositoryProvider,
        shopCategoryRepositoryProvider,
        categoryRepositoryProvider,
      ],
    }).compile();
    controller = module.get<ShopController>(ShopController);
    spyService = module.get<ShopService>(ShopService);
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

        const result = await controller.getCategorySelection('coffee', '');
        expect(result).toEqual([shopMock]);
      });

      it('should get shop according to name', async () => {
        jest.spyOn(spyService, 'findByName').mockResolvedValue([shopMock]);
        const resultByName = await controller.getCategorySelection(
          '',
          'Starbucks'
        );
        expect(spyService.findByName).toHaveBeenCalled();
        expect(spyService.findByName).toHaveBeenCalledWith('Starbucks');
        expect(resultByName).toEqual([shopMock]);
      });

      it('should get all shop due to no parametrs entered', async () => {
        jest.spyOn(spyService, 'findAll').mockResolvedValue(arrMockShop);

        const result = await controller.getCategorySelection('', '');

        expect(spyService.findAll).toHaveBeenCalled();
        expect(spyService.findAll).toHaveBeenCalledWith();
        expect(result).toBe(arrMockShop);
      });

      it('should throw Error due to both Parametrs entered', async () => {
        try {
          await controller.getCategorySelection('coffee', 'Starbucks');
          expect(false).toBeTruthy(); // we should never hit this line
        } catch (err) {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toEqual('Too Many Parametrs Entered');
        }
      });
    });
  });

  describe('POST Shop', () => {
    it('should create new shop', async () => {
      jest.spyOn(spyService, 'create').mockResolvedValue(shopMock);

      const result = await controller.create(shopMock);

      expect(spyService.create).toHaveBeenCalled();
      expect(spyService.create).toHaveBeenCalledWith(shopMock);
      expect(result).toBe(shopMock);
    });
  });

  describe('Patch Shop', () => {
    it('should update shop info', async () => {
      jest
        .spyOn(spyService, 'update')
        .mockImplementation((id: number, updateShopDto: UpdateShopDto) => {
          return Promise.resolve({
            ...shopMock,
            ...updateShopDto,
          });
        });

      const result = await controller.update(shopMock.id, updatedShop);

      expect(spyService.update).toHaveBeenCalled();
      expect(spyService.update).toHaveBeenCalledWith(shopMock.id, updatedShop);
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
