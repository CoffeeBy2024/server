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
import { CreateWorkingHoursDto } from '../working_hours/dto/create-working_hour.dto';
import UpdateWorkingHoursDto from '../working_hours/dto/update-working_hour.dto';

import { ShopService } from './shop.service';
import { WorkingHoursService } from '../working_hours/working_hours.service';
import { ShopCategoryService } from '../shop-category/shop-category.service';
import { CategoryService } from '../category/category.service';

@Controller('shop')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly workingHoursService: WorkingHoursService,
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

    const shopsWithSuchCategory = await this.shopCategoryServcie.findAllByName(
      await this.categoryService.findOneByName(category)
    );

    const shops = [];
    for (const shop of shopsWithSuchCategory) {
      shops.push(await this.shopService.findOne(shop.shop.id));
    }

    return shops;
  }

  @Post(':id/working_hours')
  async createWorkingHours(
    @Param('id') id: number,
    @Body() createWorkingHoursDto: CreateWorkingHoursDto
  ) {
    const shop = this.shopService.handleNonExistingShop(
      id,
      await this.shopService.findOne(id)
    );
    this.workingHoursService.ensureWH(
      await this.workingHoursService.create({
        ...createWorkingHoursDto,
        shop: shop,
      })
    );

    return this.shopService.createWorkingHours(shop);
  }

  @Get(':id/working_hours')
  findWHByShop(@Param('id') id: number) {
    return this.workingHoursService.findAllById(id);
  }

  @Patch(':id/working_hours')
  async updateWorkingHours(
    @Param('id') id: number,
    @Body() updateWorkingHours: UpdateWorkingHoursDto
  ) {
    this.shopService.handleNonExistingShop(
      id,
      await this.shopService.findOne(id)
    );
    return this.workingHoursService.update(id, updateWorkingHours);
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
