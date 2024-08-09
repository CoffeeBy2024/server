import {
  Column,
  Entity,
  OneToMany,
  Point,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { WorkingHour } from '../../working_hours/entities/working_hour.entity';

@Entity()
export class Shop {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'geometry', nullable: true })
  coordinates: Point;

  @OneToMany(() => WorkingHour, (workingHour) => workingHour.shop, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  working_hours: WorkingHour[];

  // LATER ON

  // @OneToMany(() => ShopCategory, (shopCategory) => shopCategory.shop)
  // shopCategories: ShopCategory;

  // User: Producer Role
  // @ManyToOne(() => User, (user) => user.shops)
  // user: User;
}
