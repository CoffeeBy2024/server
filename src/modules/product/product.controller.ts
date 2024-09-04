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
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ShopService } from '../shop/shop/shop.service';
import { CategoryService } from '../category/category.service';
import { ShopCategoryService } from '../shop/shop-category/shop-category.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('product')
@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly shopService: ShopService,
    private readonly categoryService: CategoryService,
    private readonly shopCategoryService: ShopCategoryService
  ) {}

  @Post('shop/:id/product')
  async create(
    @Param('id') id: number,
    @Query('category') categoryName: string,
    @Body() createProductDto: CreateProductDto
  ) {
    const category = await this.categoryService.findOneByName(categoryName);
    let shopCategory = await this.shopCategoryService.findOneByName(category);
    if (!shopCategory) {
      const shop = this.shopService.handleNonExistingShop(
        id,
        await this.shopService.findOne(id)
      );
      shopCategory = await this.shopCategoryService.create({ shop, category });
    }
    return this.productService.create(createProductDto, shopCategory);
  }

  @Get('shop/:sid/product/:id')
  findOne(@Param('sid') sid: number, @Param('id') id: number) {
    return this.productService.findOneBy(id);
  }

  @Get('shop/:id/products/')
  @ApiQuery({
    name: 'category',
    required: false,
    type: 'string',
    explode: false,
  })
  async getCategorySelection(
    @Param('id') shop_id: number,
    @Query('category') category?: string
  ) {
    return !category
      ? await this.productService.findAll()
      : this.productService.findAllByCategory(
          (
            await this.shopCategoryService.findOneById(
              shop_id,
              await this.categoryService.findOneByName(category)
            )
          ).id
        );
  }

  @Patch('shop/:sid/product/:id')
  update(@Param('id') id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete('shop/:sid/product/:id')
  remove(@Param('id') id: number) {
    return this.productService.remove(id);
  }
}
