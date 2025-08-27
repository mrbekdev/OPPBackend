import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class UpdateUserDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  login?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
