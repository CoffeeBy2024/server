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
    return await this.shopRepository.save(
      this.shopRepository.create(createShopDto)
    );
  }

  async findAll() {
    return await this.shopRepository.find();
  }

  async findByName(name: string) {
    return await this.shopRepository.find({ where: { name: name } });
  }

  async findOne(id: number) {
    return await this.shopRepository.findOneBy({ id: id });
  }

  async update(id: number, updateShopDto: UpdateShopDto) {
    const existingShop = this.handleNonExistingShop(
      id,
      await this.shopRepository.findOneBy({ id: id })
    );

    return await this.shopRepository.save({
      ...existingShop,
      ...updateShopDto,
    });
  }

  async remove(id: number) {
    const shop = await this.shopRepository.delete({ id: id });
    return shop.affected && shop.affected > 0;
  }

  handleNonExistingShop(id: number, shop: Shop | null): Shop {
    if (!shop) {
      console.error('Trying to reach non-existing shop');
      throw new Error(`Shop with id - ${id} doesn't exist`);
    }
    return shop;
  }
}
