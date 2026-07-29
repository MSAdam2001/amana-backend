import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsDateString } from 'class-validator';

export class CreateBookingDto {
  @IsMongoId()
  artisanProfileId: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}