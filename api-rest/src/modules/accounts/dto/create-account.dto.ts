import { Decimal } from '@prisma/client/runtime/client';
import {
  IsDecimal,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(3, { message: 'O nome da conte deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'O nome deve ter no máximo 50 caracteres' })
  accountName: string;

  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6})$/, {
    message: 'Cor deve estar no formato hexadecimal (#FFFFFF)',
  })
  color?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  balance?: string; // Moeda (padrão BRL)
}
