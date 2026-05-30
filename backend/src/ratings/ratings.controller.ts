import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingsService } from './ratings.service';

@Controller('ratings')
@UseGuards(AuthGuard('jwt'))
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  /** Normal users submit a new rating */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  submit(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.submit(user.id, dto);
  }

  /** Normal users update an existing rating */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.USER)
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateRatingDto,
  ) {
    return this.ratingsService.update(user.id, id, dto);
  }

  /** Store owners view their dashboard — raters list + avg */
  @Get('owner/dashboard')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STORE_OWNER)
  ownerDashboard(@CurrentUser() user: { id: string }) {
    return this.ratingsService.getOwnerDashboard(user.id);
  }
}
