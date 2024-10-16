import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { ShopCategory } from '../shop/shop-category/entities/shop-category.entity';
import { CreatePhotoDto } from '../photo/dto/create-photo.dto';
import { UpdatePhotoDto } from '../photo/dto/update-photo.dto';
import { PhotoService, PhotoType } from '../photo/photo.service';

@Injectable()
export class ProductService {
  private type: PhotoType = 'product';

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    private readonly photoService: PhotoService
  ) {}

  async create(
    createPhotoDto: CreatePhotoDto,
    createProductDto: CreateProductDto,
    shopCategory: ShopCategory
  ) {
    const photo = await this.photoService.create(createPhotoDto, this.type);

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

    if (!products.length) {
      return products;
    }

    const productPhotIds = products.map(({ photo }) => photo);
    const photos = await this.photoService.findAll(productPhotIds, this.type);

    return products.map((product, index) => ({
      ...product,
      photo: photos[index],
    }));
  }

  async findAllByCategory(id: number) {
    const products = await this.productRepository.find({
      where: { shopCategory: { id } },
    });

    if (!products.length) {
      return products;
    }

    const productPhotIds = products.map(({ photo }) => photo);
    const photos = await this.photoService.findAll(productPhotIds, this.type);

    return products.map((product, index) => ({
      ...product,
      photo: photos[index],
    }));
  }

  async findOneBy(id: number) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      return product;
    }

    const photo = await this.photoService.findOne(product.photo, this.type);

    return { ...product, photo };
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

    const updatedPhoto = await this.photoService.update(
      existingProduct.photo,
      updatePhotoDto,
      this.type
    );

    const updatedProduct = {
      ...existingProduct,
      ...updateProductDto,
      photo: updatedPhoto._id?.toString(),
    };

    return await this.productRepository.save(updatedProduct);
  }

  async remove(id: number) {
    const deleteResult = await this.productRepository.delete({ id });
    return !!deleteResult.affected;
  }
}
