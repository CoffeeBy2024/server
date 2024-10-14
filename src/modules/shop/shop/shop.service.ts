import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import { CreatePhotoDto } from '../../photo/dto/create-photo.dto';
import { UpdatePhotoDto } from '../../photo/dto/update-photo.dto';
import { PhotoService, PhotoType } from '../../../modules/photo/photo.service';

@Injectable()
export class ShopService {
  private type: PhotoType = 'shop';

  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>,

    private readonly photoService: PhotoService
  ) {}

  async create(createPhotoDto: CreatePhotoDto, createShopDto: CreateShopDto) {
    const photo = await this.photoService.create(createPhotoDto, this.type);

    return await this.shopRepository.save(
      this.shopRepository.create({
        ...createShopDto,
        photo: photo?._id.toString(),
      })
    );
  }

  async findAll() {
    return await this.shopRepository.find();
  }

  async findByName(name: string) {
    return await this.shopRepository.find({ where: { name } });
  }

  async findOne(id: number) {
    return await this.shopRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updatePhotoDto: UpdatePhotoDto,
    updateShopDto: UpdateShopDto
  ) {
    const existingShop = await this.shopRepository.findOneBy({ id });

    if (!existingShop) {
      throw new BadRequestException(`Shop with id - ${id} doesn't exist`);
    }

    const updatedPhoto = await this.photoService.update(
      existingShop.photo,
      updatePhotoDto,
      this.type
    );

    return await this.shopRepository.save({
      ...existingShop,
      ...updateShopDto,
      photo: updatedPhoto?._id?.toString(),
    });
  }

  async remove(id: number) {
    const deleteResult = await this.shopRepository.delete({ id });
    return !!deleteResult.affected;
  }
}
