import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/product/create-product.dto';
import { UpdateProductDto } from './dto/product/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ShopCategory } from '../shop/shop-category/entities/shop-category.entity';
import { Photo } from './entities/photo.entity';
import { CreatePhotoDto } from './dto/photo/create-photo.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Photo, 'mongodb')
    private readonly photoRepository: Repository<Photo>
  ) {}

  async create(
    createPhotoDto: CreatePhotoDto,
    createProductDto: CreateProductDto,
    shopCategory: ShopCategory
  ) {
    const photo = await this.photoRepository.save(
      this.photoRepository.create(createPhotoDto)
    );

    return await this.productRepository.save(
      this.productRepository.create({
        ...createProductDto,
        photo: photo._id.toString(),
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
