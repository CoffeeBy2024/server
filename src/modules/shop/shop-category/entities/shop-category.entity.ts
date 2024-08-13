import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Shop } from 'src/modules/shop/shop/entities/shop.entity';
import { Product } from 'src/modules/product/entities/product.entity';
import { Category } from '../../category/entities/category.entity';

@Entity()
export class ShopCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Shop, (shop) => shop.shopCategories)
  @JoinColumn()
  shop: Shop;

  @ManyToOne(() => Category, (category) => category.shopCategory)
  @JoinColumn()
  category: Category;

  @OneToMany(() => Product, (product) => product.shopCategory, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  products: Product[];
}
