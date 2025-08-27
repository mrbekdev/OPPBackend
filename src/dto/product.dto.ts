import { IsString, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  count: number;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  weight: number;
}

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsNumber()
  @IsPositive()
  count?: number;

  @IsString()
  @IsNotEmpty()
  size?: string;

  @IsNumber()
  @IsPositive()
  price?: number;

  @IsNumber()
  @IsPositive()
  weight?: number;
}