import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private readonly shopRepository: Repository<Shop>
  ) {}

  async create(createShopDto: CreateShopDto) {
    return await this.shopRepository.save(
      this.shopRepository.create(createShopDto)
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

  async update(id: number, updateShopDto: UpdateShopDto) {
    const existingShop = await this.shopRepository.findOneBy({ id });

    if (!existingShop) {
      throw new BadRequestException(`Shop with id - ${id} doesn't exist`);
    }

    return await this.shopRepository.save({
      ...existingShop,
      ...updateShopDto,
    });
  }

  async remove(id: number) {
    const deleteResult = await this.shopRepository.delete({ id });
    return !!deleteResult.affected;
  }
}
