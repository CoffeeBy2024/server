import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ShopCategory } from '../../shop/shop-category/entities/shop-category.entity';

export enum CATEGORY {
  'coffee',
  'bakery',
  'drinks',
  'odds',
}

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => ShopCategory, (shopCategory) => shopCategory.category)
  shopCategory: ShopCategory;
}
