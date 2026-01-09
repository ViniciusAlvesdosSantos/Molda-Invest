import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ 
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 3,
    maxLength: 100
  })
  @IsString()
  @MinLength(3, { message: 'Nome deve ter no mínimo 3 caracteres' })
  @MaxLength(100)
  name: string;

  @ApiProperty({ 
    description: 'Endereço de email do usuário',
    example: 'joao@email.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({ 
    description: 'CPF do usuário (apenas números)',
    example: '12345678900',
    minLength: 9,
    maxLength: 11,
    pattern: '^\\d{9,11}$'
  })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve ter 11 dígitos ou 9 dígitos' })
  cpf: string;

  @ApiProperty({ 
    description: 'Telefone do usuário com DDD (apenas números)',
    example: '11999999999',
    minLength: 10,
    maxLength: 11,
    pattern: '^\\d{10,11}$'
  })
  @IsString()
  @Matches(/^\d{10,11}$/, { message: 'Telefone inválido (10 ou 11 dígitos)' })
  phone: string;
}