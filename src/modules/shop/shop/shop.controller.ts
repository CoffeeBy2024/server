import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

import { ShopService } from './shop.service';
import { ShopCategoryService } from '../shop-category/shop-category.service';
import { CategoryService } from '../category/category.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('shop')
@Controller('shop')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly shopCategoryServcie: ShopCategoryService,
    private readonly categoryService: CategoryService
  ) {}

  @Get()
  async getCategorySelection(
    @Query('category') category: string,
    @Query('name') name: string
  ) {
    if (name && category) throw new Error('Too Many Parametrs Entered');
    if (name) return await this.shopService.findByName(name);
    if (!category) return await this.shopService.findAll();

    return await Promise.all(
      (
        await this.shopCategoryServcie.findAllByName(
          await this.categoryService.findOneByName(category)
        )
      ).map((shop) => this.shopService.findOne(shop.shop.id))
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
