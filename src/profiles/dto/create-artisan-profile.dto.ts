import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsArray } from 'class-validator';

export class CreateArtisanProfileDto {
  @IsString()
  @IsNotEmpty()
  tradeCategory: string;

  @IsArray()
  @IsOptional()
  skills?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  yearsExperience?: number;

  @IsNumber()
  @Min(1)
  @Max(50)
  @IsOptional()
  serviceRadiusKm?: number;

  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;
}