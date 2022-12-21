import { Exclude } from 'class-transformer';
import { Certificate } from '../../certificates/entities/certificate.entity';
import {
  Column,
  JoinColumn,
  OneToMany,
  Entity,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from 'typeorm';
import { hash } from 'bcrypt';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Exclude()
  @Column()
  password: string;

  @OneToMany(() => Certificate, (certificate) => certificate.owner, {
    cascade: true,
  })
  @JoinColumn()
  certificates: Certificate[];

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @BeforeInsert()
  async setPassword(password: string) {
    const saltOrRounds = 10;
    this.password = await hash(password || this.password, saltOrRounds);
  }
}
