import { User } from '../../users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum Status {
  AVAILABLE = 'available',
  OWNED = 'owned',
  TRANSFERRED = 'transferred',
}

@Entity()
export class Certificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  country: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.AVAILABLE,
  })
  status: Status;

  @ManyToOne(() => User, (user) => user.certificates)
  owner: User;
}
