import { Injectable } from '@nestjs/common';
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

  async createWorkingHours(shop: Shop) {
    return await this.shopRepository.save(shop);
  }

  async create(createShopDto: CreateShopDto) {
    const shop = this.shopRepository.create(createShopDto);
    return await this.shopRepository.save(shop);
  }

  async findOne(id: number) {
    return await this.shopRepository.findOneBy({ id: id });
  }

  async findWHByShop(id: number) {
    const shop = await this.shopRepository.findOneBy({ id: id });
    return shop?.working_hours;
  }

  async update(id: number, updateShopDto: UpdateShopDto) {
    const existingShop = await this.shopRepository.findOneBy({ id: id });

    if (!existingShop) {
      console.error('Trying to add Working Hours to non-existing shop');
      throw new Error(`Shop with id - ${id} doesn't exist`);
    }

    const updatedShop = { ...existingShop, ...updateShopDto };
    return await this.shopRepository.save(updatedShop);
  }

  async remove(id: number) {
    const shop = await this.shopRepository.delete({ id: id });
    return `This action removes a #${id} ${shop.affected && shop.affected > 0 ? '' : 'Non-Existing'} shop`;
  }
}
