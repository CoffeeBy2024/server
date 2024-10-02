import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ShopService } from '../shop/shop/shop.service';
import { CategoryService } from '../category/category.service';
import { ShopCategoryService } from '../shop/shop-category/shop-category.service';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { CATEGORY } from '../../common/enums/category.enum';
import { Product } from './entities/product.entity';

@ApiTags('products')
@Controller('shops/:id/products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly shopService: ShopService,
    private readonly categoryService: CategoryService,
    private readonly shopCategoryService: ShopCategoryService
  ) {}

  @Post()
  @ApiQuery({
    name: 'category',
    required: false,
    type: 'string',
    description: 'product category',
  })
  async create(
    @Param('id') id: number,
    @Query('category') category: CATEGORY,
    @Body() createProductDto: CreateProductDto
  ): Promise<Product> {
    const categoryEntity = await this.categoryService.findOne(category);

    if (!categoryEntity) {
      throw new NotFoundException(`Category with name ${category} not found`);
    }

    let shopCategory = await this.shopCategoryService.findOneByCategory(
      id,
      categoryEntity
    );

    if (!shopCategory) {
      const shop = await this.shopService.findOne(id);

      if (!shop) {
        throw new NotFoundException(`Shop with id ${id} not found`);
      }

      shopCategory = await this.shopCategoryService.create({
        shop,
        category: categoryEntity,
      });
    }

    return this.productService.create(createProductDto, shopCategory);
  }

  @Get()
  @ApiQuery({
    name: 'category',
    required: false,
    type: 'string',
    explode: false,
    description: 'product category',
  })
  async getCategorySelection(
    @Param('id') id: number,
    @Query('category') category?: CATEGORY
  ) {
    if (!category) {
      return this.productService.findAll();
    }

    const categoryEntity = await this.categoryService.findOne(category);

    if (!categoryEntity) {
      throw new NotFoundException(`Category with name ${category} not found`);
    }

    const shopCategory = await this.shopCategoryService.findOneById(
      id,
      categoryEntity
    );

    if (!shopCategory) {
      throw new NotFoundException(`Shop with id ${id} not found`);
    }

    return this.productService.findAllByCategory(shopCategory.id);
  }

  @Get('/:pid')
  findOne(@Param('pid') id: number) {
    return this.productService.findOneBy(id);
  }

  @Patch('/:pid')
  update(@Param('pid') id: number, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete('/:pid')
  remove(@Param('pid') id: number) {
    return this.productService.remove(id);
  }
}
