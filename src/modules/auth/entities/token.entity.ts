import { User } from '@user/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  value: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column()
  userAgent: string;

  @ManyToOne(() => User, (user) => user.tokens)
  user: User;
}
