import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CATEGORY, Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    return await this.categoryRepository.save(
      this.categoryRepository.create({
        name: CATEGORY[this.convertToEnum(createCategoryDto.name)],
      })
    );
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOneByName(name: string) {
    const category = await this.categoryRepository.findOne({
      where: { name: CATEGORY[this.convertToEnum(name)] },
    });

    if (!category) throw new Error("Such Category wasn't found");
    return category;
  }

  private convertToEnum(category: string): CATEGORY {
    switch (category) {
      case 'coffee':
        return CATEGORY.coffee;
      case 'bakery':
        return CATEGORY.bakery;
      case 'drinks':
        return CATEGORY.drinks;
      case 'odds':
        return CATEGORY.odds;
      default:
        throw new Error('Trying to get Non-Existing Category');
    }
  }
}
