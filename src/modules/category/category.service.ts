import { Injectable } from '@nestjs/common';
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

  async findOne(name: CATEGORY): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: { name },
    });
  }
}
