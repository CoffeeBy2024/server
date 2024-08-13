import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ShopCategory } from 'src/modules/shop/shop-category/entities/shop-category.entity';

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

  @Column({ type: 'bytea' })
  image: Buffer;

  @ManyToOne(() => ShopCategory, (shopCategory) => shopCategory.products)
  @JoinColumn()
  shopCategory: ShopCategory;
}
