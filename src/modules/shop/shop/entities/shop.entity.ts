import {
  Column,
  Entity,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkingHour } from '../../working_hours/entities/working_hour.entity';
import { ShopCategory } from '../../../shop/shop-category/entities/shop-category.entity';

@Entity()
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'geometry', nullable: true })
  coordinates: Point;

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
