import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchArtisansDto {
  @IsString()
  @IsOptional()
  category?: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  longitude: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  latitude: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  radiusKm?: number;
}