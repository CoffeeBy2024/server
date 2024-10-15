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

  @Column({ type: 'varchar', nullable: true })
  lastName: string | null;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;

  @Column({
    type: 'enum',
    enum: Provider,
  })
  provider: Provider;

  @Column()
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationLink: string | null;

  @Column({ type: 'varchar', nullable: true })
  passwordRecoveryVerificationLink: string | null;

  @Column('jsonb', { nullable: true })
  location: string | null;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];
}
