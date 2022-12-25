import { IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateUser {
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;
}
