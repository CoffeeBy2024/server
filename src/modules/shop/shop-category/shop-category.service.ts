import { Injectable } from '@nestjs/common';
import { CreateShopCategoryDto } from './dto/create-shop-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ShopCategory } from './entities/shop-category.entity';
import { Repository } from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Injectable()
export class ShopCategoryService {
  constructor(
    @InjectRepository(ShopCategory)
    private readonly shopCategoryRepository: Repository<ShopCategory>
  ) {}

  async create(createShopCategoryDto: CreateShopCategoryDto) {
    return await this.shopCategoryRepository.save(
      this.shopCategoryRepository.create(createShopCategoryDto)
    );
  }

  async findAll() {
    return await this.shopCategoryRepository.find();
  }

  async findAllByCategory(category: Category) {
    return await this.shopCategoryRepository.find({
      where: { category },
      relations: ['category', 'shop'],
    });
  }

  async findOneByCategory(shop_id: number, category: Category) {
    return await this.shopCategoryRepository.findOne({
      where: { shop: { id: shop_id }, category: { id: category.id } },
    });
  }

  async findOneById(shop_id: number, category: Category) {
    return await this.shopCategoryRepository.findOne({
      where: { shop: { id: shop_id }, category },
      relations: ['category', 'shop'],
    });
  }

  async remove(category: Category) {
    const deleteResult = await this.shopCategoryRepository.delete({ category });
    return !!deleteResult.affected;
  }
}
