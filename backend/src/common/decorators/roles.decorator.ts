import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * @Roles decorator — attach to any controller method to restrict access.
 * Works in tandem with RolesGuard which reads this metadata at runtime.
 *
 * Example:
 *   @Roles(UserRole.ADMIN)
 *   @Get('stats')
 *   getStats() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
