import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ShopCategory } from '../../shop/shop-category/entities/shop-category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  price: number;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  photo: string;

  @ManyToOne(() => ShopCategory, (shopCategory) => shopCategory.products)
  @JoinColumn()
  shopCategory: ShopCategory;
}
