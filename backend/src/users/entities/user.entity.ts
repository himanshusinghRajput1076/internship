import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserRole } from '../../common/enums/user-role.enum';
import { Rating } from '../../ratings/entities/rating.entity';
import { Store } from '../../stores/entities/store.entity';

/**
 * User entity — represents all three user types in a single table.
 * Role determines which features they can access.
 *
 * Password is always stored hashed (bcrypt). Never select it in queries
 * that return data to the client.
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true })
  email: string;

  // Excluded from most queries via `select` in repositories
  @Column({ select: false })
  password: string;

  @Column({ length: 400 })
  address: string;

  @Column({ type: 'simple-enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // A user can rate many stores
  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];

  // A store owner manages exactly one store
  @OneToOne(() => Store, (store) => store.owner)
  store: Store;
}
