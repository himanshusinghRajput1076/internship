import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MinLength(20, { message: 'Store name must be at least 20 characters' })
  @MaxLength(60, { message: 'Store name must be at most 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Enter a valid email address' })
  email: string;

  @IsString()
  @MaxLength(400, { message: 'Address must be at most 400 characters' })
  address: string;

  // Optional: link this store to an existing store_owner user
  @IsOptional()
  @IsUUID()
  owner_id?: string;
}
