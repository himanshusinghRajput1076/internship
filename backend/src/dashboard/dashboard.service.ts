import { Injectable } from '@nestjs/common';
import { RatingsService } from '../ratings/ratings.service';
import { StoresService } from '../stores/stores.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly usersService: UsersService,
    private readonly storesService: StoresService,
    private readonly ratingsService: RatingsService,
  ) {}

  /** Admin sees platform-wide counts at a glance */
  async adminStats() {
    const [totalUsers, totalStores, totalRatings] = await Promise.all([
      this.usersService.count(),
      this.storesService.count(),
      this.ratingsService.count(),
    ]);
    return { totalUsers, totalStores, totalRatings };
  }
}
