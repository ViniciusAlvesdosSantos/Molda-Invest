import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { IsCpf } from 'src/common/decorators/IsCpf.decorator';

export class LoginDto {

  @ApiProperty({ 
    example: 'joao@email.com',
    description: 'Email ou CPF do usuário'
  })
  @IsString()
  identifier: string; // Pode ser email ou CPF

}
