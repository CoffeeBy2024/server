import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ShopCategory } from '@shop/shop-category/entities';
import { CATEGORY } from '@common/enums';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: CATEGORY, unique: true })
  name: CATEGORY;

  @OneToMany(() => ShopCategory, (shopCategory) => shopCategory.category)
  shopCategory: ShopCategory;
}
