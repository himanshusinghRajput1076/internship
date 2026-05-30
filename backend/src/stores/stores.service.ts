import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { CreateStoreDto } from './dto/create-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store)
    private readonly storesRepo: Repository<Store>,
  ) {}

  async create(dto: CreateStoreDto): Promise<Store> {
    const emailTaken = await this.storesRepo.findOne({ where: { email: dto.email } });
    if (emailTaken) throw new ConflictException('A store with this email already exists');

    const store = this.storesRepo.create(dto);
    return this.storesRepo.save(store);
  }

  /**
   * Returns stores with their computed average rating.
   * Uses a raw+entity query to get AVG without loading all rating rows into memory.
   */
  async findAll(filters: {
    name?: string;
    address?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const { name, address, sortOrder = 'ASC' } = filters;

    const allowed = ['name', 'email', 'address', 'created_at'];
    const sortBy = allowed.includes(filters.sortBy ?? '') ? filters.sortBy! : 'name';

    const qb = this.storesRepo
      .createQueryBuilder('store')
      .leftJoin('store.ratings', 'rating')
      .select([
        'store.id',
        'store.name',
        'store.email',
        'store.address',
        'store.created_at',
      ])
      .addSelect('ROUND(AVG(rating.value)::numeric, 2)', 'avg_rating')
      .addSelect('COUNT(rating.id)::int', 'rating_count')
      .groupBy('store.id')
      .orderBy(`store.${sortBy}`, sortOrder);

    if (name) qb.andWhere('store.name ILIKE :name', { name: `%${name}%` });
    if (address) qb.andWhere('store.address ILIKE :address', { address: `%${address}%` });

    const raw = await qb.getRawMany();

    return raw.map((r) => ({
      id: r.store_id,
      name: r.store_name,
      email: r.store_email,
      address: r.store_address,
      created_at: r.store_created_at,
      avgRating: r.avg_rating ? parseFloat(r.avg_rating) : null,
      ratingCount: r.rating_count ?? 0,
    }));
  }

  async findById(id: string) {
    const store = await this.storesRepo.findOne({
      where: { id },
      relations: ['owner', 'ratings', 'ratings.user'],
    });
    if (!store) throw new NotFoundException('Store not found');

    const avgRating =
      store.ratings.length > 0
        ? parseFloat(
            (store.ratings.reduce((s, r) => s + r.value, 0) / store.ratings.length).toFixed(2),
          )
        : null;

    return { ...store, avgRating, ratingCount: store.ratings.length };
  }

  async findByOwnerId(ownerId: string): Promise<Store | null> {
    return this.storesRepo.findOne({ where: { owner_id: ownerId } });
  }

  async count(): Promise<number> {
    return this.storesRepo.count();
  }
}
