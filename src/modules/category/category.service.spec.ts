import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CATEGORY, Category } from './entities/category.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import {
  arrMockCategories,
  categoryDto,
  categoryMock,
  categoryRepositoryProvider,
} from './mocks/categoryProvider';

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

  describe('Create', () => {
    it('should create non-existing category', async () => {
      const result = await service.create(categoryDto);

      expect(categoryRepository.create).toHaveBeenCalled();
      expect(categoryRepository.save).toHaveBeenCalled();
      expect(result).toEqual(categoryMock);
    });
  });

  describe('Find', () => {
    describe('findAll', () => {
      it('should find all categories', async () => {
        categoryRepository.find?.mockResolvedValue(arrMockCategories);

        const result = await service.findAll();

        expect(categoryRepository.find).toHaveBeenCalled();
        expect(categoryRepository.find).toHaveBeenCalledWith();
        expect(result).toBe(arrMockCategories);
      });
    });

    describe('findOneByName', () => {
      it('should get correct category when following name exists', async () => {
        const expectedCategory = { name: 'coffee' };

        categoryRepository.findOne?.mockReturnValue(expectedCategory);
        const category = await service.findOneByName(expectedCategory.name);
        expect(category).toEqual(expectedCategory);
      });

      it('should throw the "NotFoundException"', async () => {
        const categoryName = 'bakery';
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

    describe('String to Enum category conversion', () => {
      it('should correctly convert listed categories', () => {
        const coffee = service.convertToEnum('coffee');
        expect(coffee).toEqual(CATEGORY.coffee);

        const bakery = service.convertToEnum('bakery');
        expect(bakery).toEqual(CATEGORY.bakery);

        const drinks = service.convertToEnum('drinks');
        expect(drinks).toEqual(CATEGORY.drinks);

        const odds = service.convertToEnum('odds');
        expect(odds).toEqual(CATEGORY.odds);
      });
      it('should throw Error due to missmatching predefined categories', () => {
        const wrongCategoryName = 'wrong name';
        try {
          service.convertToEnum(wrongCategoryName);
          expect(false).toBeTruthy();
        } catch (err) {
          expect(err).toBeInstanceOf(NotFoundException);
          expect(err.message).toEqual(
            `Category with name ${wrongCategoryName} not found`
          );
        }
      });
    });
  });
});
