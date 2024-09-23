import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { TTLVariables } from '../../utils/constants/cache';
import { CacheTTL } from '@nestjs/cache-manager';
import { CATEGORY } from '../../common/enums/category.enum';

@ApiTags('category')
@Controller('category')
@CacheTTL(TTLVariables.rare)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoryService.findAll();
  }

  @Get(':category')
  findOneByName(@Param('category') category: CATEGORY) {
    return this.categoryService.findOneByName(category);
  }
}
