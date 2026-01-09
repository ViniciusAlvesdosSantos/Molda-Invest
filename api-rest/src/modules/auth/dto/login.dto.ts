import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { IsCpf } from 'src/common/decorators/IsCpf.decorator';

export class LoginDto {
  @ApiProperty({ 
    description: 'Email ou CPF do usuário para login',
    example: 'joao@email.com',
    examples: {
      email: {
        value: 'joao@email.com',
        summary: 'Login com email'
      },
      cpf: {
        value: '12345678900',
        summary: 'Login com CPF'
      }
    }
  })
  @IsString()
  identifier: string; // Pode ser email ou CPF
}
