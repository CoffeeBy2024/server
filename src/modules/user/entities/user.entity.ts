import { Token } from 'src/modules/auth/entities/token.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column('jsonb', { nullable: true })
  location: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
}
