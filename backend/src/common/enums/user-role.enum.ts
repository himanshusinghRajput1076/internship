/**
 * User Role Enum
 *
 * Three distinct roles drive all authorization decisions in this app.
 * Using a string enum (not numeric) keeps database values readable
 * and PostgreSQL ENUM columns human-friendly.
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  STORE_OWNER = 'store_owner',
}
