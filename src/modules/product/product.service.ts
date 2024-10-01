import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/product/create-product.dto';
import { UpdateProductDto } from './dto/product/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ShopCategory } from '../shop/shop-category/entities/shop-category.entity';
import { Photo } from './entities/photo.entity';
import { CreatePhotoDto } from './dto/photo/create-photo.dto';
import { UpdatePhotoDto } from './dto/photo/update-photo.dto';
import { ObjectId } from 'mongodb';

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
    const products = await this.productRepository.find();

    if (!products) {
      return products;
    }

    return Promise.all(
      products.map(async (product) => {
        const photo = await this.photoRepository.findOneBy({
          _id: new ObjectId(product.photo),
        });

        return {
          ...product,
          photo: photo?.image,
        };
      })
    );
  }

  async findAllByCategory(id: number) {
    const products = await this.productRepository.find({
      where: { shopCategory: { id } },
    });

    if (!products) {
      return products;
    }

    return Promise.all(
      products.map(async (product) => {
        const photo = await this.photoRepository.findOneBy({
          _id: new ObjectId(product.photo),
        });

        return {
          ...product,
          photo: photo?.image,
        };
      })
    );
  }

  async findOneBy(id: number) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      return product;
    }

    const photo = await this.photoRepository.findOneBy({
      _id: new ObjectId(product.photo),
    });

    return {
      ...product,
      photo: photo?.image,
    };
  }

  async update(
    id: number,
    updatePhotoDto: UpdatePhotoDto,
    updateProductDto: UpdateProductDto
  ) {
    const existingProduct = await this.productRepository.findOneBy({ id });

    if (!existingProduct) {
      throw new BadRequestException('This product does not exist');
    }

    const existingPhoto = await this.photoRepository.findOneBy({
      _id: new ObjectId(existingProduct.photo),
    });

    const updatedPhoto = {
      ...existingPhoto,
      ...updatePhotoDto,
    };

    await this.photoRepository.save(updatedPhoto);

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
