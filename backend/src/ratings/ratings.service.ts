import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingsRepo: Repository<Rating>,
  ) {}

  async submit(userId: string, dto: CreateRatingDto): Promise<Rating> {
    const existing = await this.ratingsRepo.findOne({
      where: { user_id: userId, store_id: dto.store_id },
    });

    if (existing) {
      throw new BadRequestException(
        'You already rated this store. Use the update endpoint to change it.',
      );
    }

    const rating = this.ratingsRepo.create({
      user_id: userId,
      store_id: dto.store_id,
      value: dto.value,
    });

    return this.ratingsRepo.save(rating);
  }

  async update(userId: string, ratingId: string, dto: UpdateRatingDto): Promise<Rating> {
    const rating = await this.ratingsRepo.findOne({ where: { id: ratingId } });
    if (!rating) throw new NotFoundException('Rating not found');

    // Users can only edit their own ratings
    if (rating.user_id !== userId) {
      throw new ForbiddenException('You can only update your own ratings');
    }

    rating.value = dto.value;
    return this.ratingsRepo.save(rating);
  }

  /** Get the logged-in user's own rating for a specific store */
  async getUserRatingForStore(userId: string, storeId: string): Promise<Rating | null> {
    return this.ratingsRepo.findOne({
      where: { user_id: userId, store_id: storeId },
    });
  }

  /**
   * Store owner dashboard data:
   * - All ratings for their store (with rater details)
   * - Computed average
   */
  async getOwnerDashboard(ownerId: string) {
    const ratings = await this.ratingsRepo
      .createQueryBuilder('rating')
      .innerJoin('rating.store', 'store', 'store.owner_id = :ownerId', { ownerId })
      .leftJoin('rating.user', 'user')
      .select([
        'rating.id',
        'rating.value',
        'rating.created_at',
        'user.id',
        'user.name',
        'user.email',
      ])
      .orderBy('rating.created_at', 'DESC')
      .getMany();

    const avg =
      ratings.length > 0
        ? parseFloat(
            (ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length).toFixed(2),
          )
        : null;

    return {
      avgRating: avg,
      totalRatings: ratings.length,
      ratings,
    };
  }

  async count(): Promise<number> {
    return this.ratingsRepo.count();
  }
}
