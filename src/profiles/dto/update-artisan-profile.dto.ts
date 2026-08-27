import { IsString, IsOptional, IsNumber, Min, Max, IsArray, ArrayMaxSize } from 'class-validator';

export class UpdateArtisanProfileDto {
  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsExperience?: number;

  @IsArray()
  @ArrayMaxSize(12)
  @IsOptional()
  portfolioPhotos?: string[];

  @IsString()
  @IsOptional()
  bio?: string;
}