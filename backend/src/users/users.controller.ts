import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import * as bcrypt from 'bcrypt';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN) // All routes in this controller are admin-only
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /api/users
   * Admin creates a user of any role, including other admins and store owners.
   */
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    return this.usersService.create({
      ...dto,
      password: hashedPassword,
      role: dto.role ?? UserRole.USER,
    });
  }

  /**
   * GET /api/users?name=&email=&address=&role=&sortBy=&sortOrder=
   * Returns a filtered, sorted list (no passwords).
   */
  @Get()
  findAll(
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('address') address?: string,
    @Query('role') role?: UserRole,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.usersService.findAll({ name, email, address, role, sortBy, sortOrder });
  }

  /**
   * GET /api/users/:id
   * Full detail view. If the user is a store owner, avgRating is included.
   */
  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.usersService.getDetail(id);
  }
}
