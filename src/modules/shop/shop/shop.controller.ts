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
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
} from '@nestjs/common';

import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';

import { ShopService } from './shop.service';
import { ShopCategoryService } from '../shop-category/shop-category.service';
import { CategoryService } from '../../category/category.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CATEGORY } from '../../../common/enums/category.enum';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('shops')
@Controller('shops')
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
    description: 'product category',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: 'string',
    description: 'shop name',
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
      shopsByCategory.map(({ shop }) => this.shopService.findOne(shop.id))
    );
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: Math.pow(1024, 2) * 3 },
    })
  )
  create(
    @Body() createShopDto: CreateShopDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .build()
    )
    file: Express.Multer.File
  ) {
    return this.shopService.create({ image: file.buffer }, createShopDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.shopService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: Math.pow(1024, 2) * 3 },
    })
  )
  update(
    @Param('id') id: number,
    @Body() updateShopDto: UpdateShopDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp)$/ })
        .build()
    )
    file?: Express.Multer.File
  ) {
    return this.shopService.update(id, { image: file?.buffer }, updateShopDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.shopService.remove(id);
  }
}
