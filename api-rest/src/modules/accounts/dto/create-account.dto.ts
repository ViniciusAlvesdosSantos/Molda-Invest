import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty({
    description: 'Nome da conta',
    example: 'Conta Corrente',
    minLength: 3,
    maxLength: 50
  })
  @IsString()
  @MinLength(3, { message: 'O nome da conta deve ter no mínimo 3 caracteres' })
  @MaxLength(50, { message: 'O nome deve ter no máximo 50 caracteres' })
  accountName: string;

  @ApiProperty({
    description: 'Cor da conta em formato hexadecimal',
    example: '#4CAF50',
    required: false
  })
  @IsString()
  @IsOptional()
  @Matches(/^#([A-Fa-f0-9]{6})$/, {
    message: 'Cor deve estar no formato hexadecimal (#FFFFFF)',
  })
  color?: string;

  @ApiProperty({
    description: 'Ícone da conta',
    example: 'credit-card',
    required: false,
    maxLength: 50
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @ApiProperty({
    description: 'Saldo inicial da conta (permite zero, máximo 15 dígitos inteiros e 4 decimais)',
    example: '1500.50',
    required: false,
    type: 'string',
    pattern: '^\\d{1,15}(\\.\\d{1,4})?$'
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{1,15}(\.\d{1,3})?$/, {
    message: 'Balance inválido. Deve ser um valor positivo ou zero, com no máximo 15 dígitos inteiros e 4 decimais (ex: 999999999999999.9999)',
  })
  balance?: string;
}
