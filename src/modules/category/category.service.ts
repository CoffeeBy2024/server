import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { CATEGORY } from '../../common/enums/category.enum';
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
        name: createCategoryDto.name,
      })
    );
  }

  async findAll() {
    return await this.categoryRepository.find();
  }

  async findOneByName(name: CATEGORY) {
    const category = await this.categoryRepository.findOne({
      where: { name },
    });

    if (!category)
      throw new NotFoundException(`Category with name ${name} not found`);

    return category;
  }
}
