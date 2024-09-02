import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { categoryRepositoryProvider } from './mocks/categoryProvider';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: MockRepository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService, categoryRepositoryProvider],
    }).compile();

    service = await module.resolve<CategoryService>(CategoryService);
    categoryRepository = module.get<MockRepository<Category>>(
      getRepositoryToken(Category)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByName', () => {
    it('when category with following name exists', async () => {
      const expectedCategory = { name: 'coffee' };

      categoryRepository.findOne?.mockReturnValue(expectedCategory);
      const category = await service.findOneByName(expectedCategory.name);
      expect(category).toEqual(expectedCategory);
    });

    it('should throw the "NotFoundException"', async () => {
      const categoryName = 'blabla';
      categoryRepository.findOne?.mockReturnValue(undefined);

      try {
        await service.findOneByName(categoryName);
        expect(false).toBeTruthy(); // we should never hit this line
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(
          `Category with name ${categoryName} not found`
        );
      }
    });
  });
});
