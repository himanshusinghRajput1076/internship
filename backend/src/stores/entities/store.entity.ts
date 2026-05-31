import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Rating } from '../../ratings/entities/rating.entity';

/**
 * Store entity — a business registered on the platform.
 *
 * owner_id is nullable because an admin can create a store
 * without assigning an owner immediately. A store owner user
 * is linked here when the admin creates their account.
 */
@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 400 })
  address: string;

  @Column({ nullable: true })
  owner_id: string;

  @ManyToOne(() => User, (user) => user.store, { nullable: true, eager: false })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => Rating, (rating) => rating.store)
  ratings: Rating[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
