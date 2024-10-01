import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CATEGORY } from '../../common/enums/category.enum';
import { ObjectLiteral, Repository } from 'typeorm';
import {
  categoryDto,
  categoryMock,
  categoryRepositoryProvider,
} from './mocks/categoryProvider';
import { BadRequestException } from '@nestjs/common';

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

    it('should throw BadRequestException due to already existing category', async () => {
      const duplicate = { name: 'Duplicate Category' as CATEGORY };

      jest
        .spyOn(categoryRepository, 'save')
        .mockRejectedValueOnce(
          new BadRequestException(
            `Category with the name ${duplicate.name} already exists`
          )
        );

      expect(categoryRepository.create).toHaveBeenCalled();
      expect(categoryRepository.save).toHaveBeenCalled();
      await expect(service.create(duplicate)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('Find', () => {
    describe('findAll', () => {
      it('should find all categories', async () => {
        categoryRepository.find?.mockResolvedValue([categoryMock]);

        const result = await service.findAll();

        expect(categoryRepository.find).toHaveBeenCalled();
        expect(categoryRepository.find).toHaveBeenCalledWith();
        expect(result).toEqual([categoryMock]);
      });
    });

    describe('findOne', () => {
      it('should get correct category when following name exists', async () => {
        const expectedCategory = CATEGORY['coffee'];

        categoryRepository.findOne?.mockReturnValue(expectedCategory);
        const category = await service.findOne(expectedCategory);
        expect(category).toEqual(expectedCategory);
      });
    });
  });
});
