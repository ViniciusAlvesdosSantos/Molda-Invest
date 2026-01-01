import { IsEmail, IsString, MinLength, Matches, IsIdentityCard } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger';
import { IsCpf } from 'src/common/decorators/IsCpf.decorator';

export class CreateAuthDto {
    @ApiProperty({example: "usuario@example.com",
        description: "Email do usuário"
    })   
    @IsEmail({}, { message: 'Email inválido' })
    email: string;

    @ApiProperty({
        example: "Vinicius Alves",
        description: "Nome completo do usuário"
    })
    @IsString({ message: 'Nome deve ser uma string' })
    name: string;

    @ApiProperty({
        example: "123456789-99",
        description: "Cpf do usuário"
    })
    @IsCpf()
    cpf: string;

    @ApiProperty({
        example: 'Senha@123',
        description: 'Senha com no mínimo 8 caracteres, contendo letra maiúscula, minúscula, número e símbolo',
        minLength: 8
    })
    @IsString()
    @MinLength(8, { message: "A senha tem que ter no mínimo 8 caracteres" })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
        {
            message: 'A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um símbolo'
        }
    )    
    password: string;
}
