import { Module } from '@nestjs/common';
import { RatingsModule } from '../ratings/ratings.module';
import { StoresModule } from '../stores/stores.module';
import { UsersModule } from '../users/users.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [UsersModule, StoresModule, RatingsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
