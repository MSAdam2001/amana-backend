import { IsString, IsNotEmpty, MinLength, IsIn, IsEmail } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsIn(['customer', 'artisan', 'apprentice'])
  role: string;
}