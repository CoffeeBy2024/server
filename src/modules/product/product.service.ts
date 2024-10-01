import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ShopCategory } from '../shop/shop-category/entities/shop-category.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {}
  async create(createProductDto: CreateProductDto, shopCategory: ShopCategory) {
    return await this.productRepository.save(
      this.productRepository.create({
        ...createProductDto,
        shopCategory: shopCategory,
      })
    );
  }

  async findAll() {
    return await this.productRepository.find();
  }

  async findAllByCategory(id: number) {
    return await this.productRepository.find({
      where: { shopCategory: { id } },
    });
  }

  async findOneBy(id: number) {
    return await this.productRepository.findOneBy({ id });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const existingProduct = await this.productRepository.findOneBy({ id });

    if (!existingProduct) {
      throw new Error('This product does not exist');
    }

    const updatedProduct = {
      ...existingProduct,
      ...updateProductDto,
    };
    return await this.productRepository.save(updatedProduct);
  }

  async remove(id: number) {
    return !!(await this.productRepository.delete({ id })).affected;
  }
}
