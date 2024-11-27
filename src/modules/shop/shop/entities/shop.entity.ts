import {
  Column,
  Entity,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkingHour } from '@shop/working_hours/entities';
import { ShopCategory } from '@shop/shop-category/entities';

@Entity()
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'geometry', nullable: true })
  coordinates: Point;

  @Column()
  photo: string;

  @OneToMany(() => WorkingHour, (workingHour) => workingHour.shop, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  working_hours: WorkingHour[];

  @OneToMany(() => ShopCategory, (shopCategory) => shopCategory.shop)
  shopCategories: ShopCategory[];

  // User: Producer Role
  // @ManyToOne(() => User, (user) => user.shops)
  // user: User;
}
