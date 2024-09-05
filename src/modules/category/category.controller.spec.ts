import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { categoryDto, categoryMock } from './mocks/categoryProvider';

describe('CategoryController', () => {
  let controller: CategoryController;
  let spyService: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: Repository<Category>,
        },
      ],
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
      jest.spyOn(spyService, 'findOneByName').mockResolvedValue(categoryMock);

      const result = await controller.findOneByName(categoryMock.name);

      expect(spyService.findOneByName).toHaveBeenCalled();
      expect(spyService.findOneByName).toHaveBeenCalledWith(categoryMock.name);
      expect(result).toBe(categoryMock);
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
