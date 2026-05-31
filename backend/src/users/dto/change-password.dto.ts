import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password must be at most 100 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>])/, {
    message: 'Password must contain at least one uppercase letter and one special character',
  })
  newPassword: string;
}
