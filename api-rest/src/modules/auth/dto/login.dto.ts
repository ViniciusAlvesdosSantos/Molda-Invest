import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email do usuário',
  })    
  @IsEmail()
  readonly email: string;

  @ApiProperty({
    example: 'Senha@123',
    description:
      'Senha com no mínimo 8 caracteres, contendo letra maiúscula, minúscula, número e símbolo',
    minLength: 8,
  })
  @IsString()
  readonly password: string;
}
