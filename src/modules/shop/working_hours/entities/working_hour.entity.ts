import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Shop } from '../../shop/entities/shop.entity';

@Entity('WorkingHour')
export class WorkingHour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  day_of_the_week: number;

  @Column()
  open_hour: string;

  @Column()
  close_hour: string;

  @ManyToOne(() => Shop, (shop) => shop.working_hours)
  shop: Shop;
}
