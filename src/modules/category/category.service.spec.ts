import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

type MockRepository<T extends ObjectLiteral = any> = {
  [P in keyof Repository<T>]?: jest.Mock<any, any>;
};

const createMockRepository = <
  T extends ObjectLiteral = any,
>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
});

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: MockRepository<Category>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: getRepositoryToken(Category),
          useValue: createMockRepository(),
        },
      ],
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
    describe('when category with following name exists', () => {
      it('a', async () => {
        const categoryName = 'coffee';
        const expectedCategory = { name: 'coffee' };

        categoryRepository.findOne?.mockReturnValue(expectedCategory);
        const category = await service.findOneByName(categoryName);
        expect(category).toEqual(expectedCategory);
      });
    });
    describe('should throw the "NotFoundException"', () => {
      it('b', async () => {
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
});
