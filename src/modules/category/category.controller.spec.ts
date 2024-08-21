import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { NotFoundException } from '@nestjs/common';

describe('CategoryController', () => {
  let controller: CategoryController;

  const mockCategoryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOneByName: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'coffee' };
      const result = { id: 1, name: 'coffee' };

      mockCategoryService.create.mockResolvedValue(result);

      expect(await controller.create(createCategoryDto)).toEqual(result);
      expect(mockCategoryService.create).toHaveBeenCalledWith(
        createCategoryDto
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const result = [{ id: 1, name: 'coffee' }];

      mockCategoryService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(mockCategoryService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOneByName', () => {
    it('should return a category if it exists', async () => {
      const result = { id: 1, name: 'coffee' };
      const categoryName = 'coffee';

      mockCategoryService.findOneByName.mockResolvedValue(result);

      expect(await controller.findOneByName(categoryName)).toEqual(result);
      expect(mockCategoryService.findOneByName).toHaveBeenCalledWith(
        categoryName
      );
    });

    it('should throw a NotFoundException if category does not exist', async () => {
      const categoryName = 'blabla';

      mockCategoryService.findOneByName.mockRejectedValue(
        new NotFoundException(`Category with name ${categoryName} not found`)
      );

      await expect(controller.findOneByName(categoryName)).rejects.toThrow(
        new NotFoundException(`Category with name ${categoryName} not found`)
      );
      expect(mockCategoryService.findOneByName).toHaveBeenCalledWith(
        categoryName
      );
    });
  });
});
