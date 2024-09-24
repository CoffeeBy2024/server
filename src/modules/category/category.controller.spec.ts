import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import {
  categoryDto,
  categoryMock,
  categoryRepositoryProvider,
} from './mocks/categoryProvider';
import { NotFoundException } from '@nestjs/common';
import { CATEGORY } from 'src/common/enums/category.enum';

describe('CategoryController', () => {
  let controller: CategoryController;
  let spyService: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [CategoryService, categoryRepositoryProvider],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    spyService = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET', () => {
    it('should get all categories', async () => {
      jest.spyOn(spyService, 'findAll').mockResolvedValue([categoryMock]);

      const result = await controller.findAll();

      expect(result).toEqual([categoryMock]);
    });

    it('should get concrete category by name', async () => {
      jest.spyOn(spyService, 'findOne').mockResolvedValue(categoryMock);

      const result = await controller.findOne(categoryMock.name);

      expect(spyService.findOne).toHaveBeenCalled();
      expect(spyService.findOne).toHaveBeenCalledWith(categoryMock.name);
      expect(result).toBe(categoryMock);
    });

    it('should throw NotFoundException due to not-found shop', async () => {
      jest.spyOn(spyService, 'findOne').mockResolvedValue(null);

      const nonExistingCategory = 'pizza' as CATEGORY;

      try {
        await controller.findOne(nonExistingCategory);
        expect(false).toBeTruthy(); // we should never hit this line
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(
          `Category with name ${nonExistingCategory} not found`
        );
      }
    });
  });

  describe('POST', () => {
    it('shoul post new category from enum list', async () => {
      jest.spyOn(spyService, 'create').mockResolvedValue(categoryMock);

      const result = await controller.create(categoryDto);

      expect(spyService.create).toHaveBeenCalled();
      expect(spyService.create).toHaveBeenCalledWith(categoryDto);
      expect(result).toBe(categoryMock);
    });
  });
});
