import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Store } from '../../stores/entities/store.entity';

/**
 * Rating entity — records a user's score (1–5) for a specific store.
 *
 * The composite unique constraint on (user_id, store_id) enforces
 * one-rating-per-user-per-store at the database level, not just application level.
 * This prevents race conditions if two requests arrive simultaneously.
 */
@Entity('ratings')
@Unique(['user_id', 'store_id'])
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  store_id: string;

  @Column({ type: 'smallint' })
  value: number;

  @ManyToOne(() => User, (user) => user.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Store, (store) => store.ratings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
