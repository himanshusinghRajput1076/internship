import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @IsUUID()
  store_id: string;

  @IsInt()
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  value: number;
}
