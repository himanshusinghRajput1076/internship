import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(255, { message: 'Name must be at most 255 characters' })
  name: string;

  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100, { message: 'Password must be at most 100 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+{};:,<.>])/, {
    message: 'Password must contain at least one uppercase letter and one special character',
  })
  password: string;

  @IsString()
  @MaxLength(400, { message: 'Address must be at most 400 characters' })
  address: string;
}
