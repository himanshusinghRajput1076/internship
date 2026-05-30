import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  /**
   * Creates a user. Called both by AuthService (self-registration)
   * and UsersController (admin creating any user type).
   * Password must already be hashed before calling this.
   */
  async create(
    data: Omit<CreateUserDto, 'password'> & { password: string; role: UserRole },
  ): Promise<User> {
    const emailTaken = await this.usersRepo.findOne({
      where: { email: data.email },
    });
    if (emailTaken) {
      throw new ConflictException('A user with this email already exists');
    }

    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  /**
   * Look up a user by email — used during login.
   * Explicitly includes password for comparison (it's hidden by default).
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Filtered and sorted list of users for the admin panel.
   * All filters are optional and combined with AND.
   */
  async findAll(filters: {
    name?: string;
    email?: string;
    address?: string;
    role?: UserRole;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<Omit<User, 'password'>[]> {
    const { name, email, address, role, sortOrder = 'ASC' } = filters;

    // Whitelist sortable columns to prevent SQL injection via ORDER BY
    const allowedColumns = ['name', 'email', 'address', 'role', 'created_at'];
    const sortBy = allowedColumns.includes(filters.sortBy ?? '')
      ? filters.sortBy!
      : 'name';

    const where: Record<string, unknown> = {};
    if (name) where.name = ILike(`%${name}%`);
    if (email) where.email = ILike(`%${email}%`);
    if (address) where.address = ILike(`%${address}%`);
    if (role) where.role = role;

    return this.usersRepo.find({
      where,
      order: { [sortBy]: sortOrder },
      // Never expose passwords in list responses
      select: ['id', 'name', 'email', 'address', 'role', 'created_at'],
    });
  }

  /**
   * Full user detail for admin. If the user is a store owner,
   * includes their store's average rating.
   */
  async getDetail(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['store', 'store.ratings'],
      select: ['id', 'name', 'email', 'address', 'role', 'created_at'],
    });
    if (!user) throw new NotFoundException('User not found');

    let avgRating: number | null = null;
    if (user.role === UserRole.STORE_OWNER && user.store?.ratings?.length) {
      const total = user.store.ratings.reduce((sum, r) => sum + r.value, 0);
      avgRating = parseFloat((total / user.store.ratings.length).toFixed(2));
    }

    return { ...user, avgRating };
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.usersRepo.update(userId, { password: hashedPassword });
  }

  async count(): Promise<number> {
    return this.usersRepo.count();
  }

  /**
   * Seeder: creates a default admin on first boot.
   * Safe to call every startup — checks for existence first.
   */
  async seedAdmin(): Promise<void> {
    const existing = await this.usersRepo.findOne({
      where: { role: UserRole.ADMIN },
    });
    if (existing) return;

    const password = await bcrypt.hash('Admin@123456', 10);
    await this.usersRepo.save(
      this.usersRepo.create({
        name: 'System Administrator Account',
        email: 'admin@storeratings.com',
        password,
        address: '123 Admin Street, Platform City, India',
        role: UserRole.ADMIN,
      }),
    );
    console.log('✅ Default admin seeded → admin@storeratings.com / Admin@123456');
  }
}
