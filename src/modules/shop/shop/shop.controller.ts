import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';

import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

import { ShopService } from './shop.service';
import { ShopCategoryService } from '../shop-category/shop-category.service';
import { CategoryService } from '../../category/category.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CATEGORY } from '../../../common/enums/category.enum';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly shopCategoryServcie: ShopCategoryService,
    private readonly categoryService: CategoryService
  ) {}

  @Get()
  @ApiQuery({
    name: 'category',
    required: false,
    type: 'string',
    description: 'Category of the shop',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: 'string',
    description: 'Name of the shop',
  })
  async getCategorySelection(
    @Query('category') category?: CATEGORY,
    @Query('name') name?: string
  ) {
    if (name && category) {
      throw new BadRequestException(
        'Too many parameters entered. Provide either name or category, not both.'
      );
    }

    if (name) {
      return this.shopService.findByName(name);
    }

    if (!category) {
      return this.shopService.findAll();
    }

    const categoryEntity = await this.categoryService.findOne(category);

    if (!categoryEntity)
      throw new NotFoundException(`Category with name ${category} not found`);

    const shopsByCategory =
      await this.shopCategoryServcie.findAllByCategory(categoryEntity);

    return Promise.all(
      shopsByCategory.map((shop) => this.shopService.findOne(shop.shop.id))
    );
  }

  @Post()
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.create(createShopDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.shopService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(id, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.shopService.remove(id);
  }
}
