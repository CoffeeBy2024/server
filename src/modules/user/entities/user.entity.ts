import { Token } from '@auth/entities';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export enum Provider {
  PASSWORD = 'password',
  GOOGLE = 'google',
}

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

  @Column({
    type: 'enum',
    enum: Provider,
  })
  provider: Provider;

  @Column()
  emailVerified: boolean;

  @Column({ nullable: true })
  emailVerificationLink: string;

  @Column('jsonb', { nullable: true })
  location: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
}
