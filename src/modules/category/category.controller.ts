import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ApiTags } from '@nestjs/swagger';
import { CacheTTL } from '@nestjs/cache-manager';
import { TTLVariables } from 'src/utils/constants/cache';

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
  findOneByName(@Param('category') category: string) {
    return this.categoryService.findOneByName(category);
  }
}
