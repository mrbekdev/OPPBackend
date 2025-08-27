import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
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
}
