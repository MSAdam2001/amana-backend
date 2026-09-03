import { IsString, IsOptional, IsNumber, IsBoolean, Min, Max, IsArray, ArrayMaxSize, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class SocialMediaDto {
  @IsString()
  @IsOptional()
  instagram?: string;

  @IsString()
  @IsOptional()
  facebook?: string;

  @IsString()
  @IsOptional()
  tiktok?: string;
}

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

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => SocialMediaDto)
  @IsOptional()
  socialMedia?: SocialMediaDto;
}