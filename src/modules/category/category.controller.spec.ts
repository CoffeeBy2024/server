import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { arrMockCategories } from './mocks/categoryProvider';

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
      jest.spyOn(spyService, 'findAll').mockResolvedValue(arrMockCategories);

      const result = await controller.findAll();

      expect(result).toBe(arrMockCategories);
    });
    it('should get concrete category by name', () => {});
  });

  describe('POST', () => {
    it('shoul post new category from enum list', () => {});
  });
});
