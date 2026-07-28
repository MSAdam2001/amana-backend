import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateCustomerProfileDto {
  @IsArray()
  @IsOptional()
  savedAddresses?: string[];
}