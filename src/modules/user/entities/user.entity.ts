import { Token } from 'src/modules/auth/entities/token.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column('jsonb', { nullable: true })
  location: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
}
