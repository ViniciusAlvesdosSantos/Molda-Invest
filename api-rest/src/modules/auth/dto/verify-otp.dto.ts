import { IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyOtpDto {
    @ApiProperty({
        description: 'Email ou CPF do usuário',
        example: 'user@mail.com',
        examples: {
            email: {
                value: 'joao@email.com',
                summary: 'Identificação por email'
            },
            cpf: {
                value: '12345678900',
                summary: 'Identificação por CPF'
            }
        }
    })
    @IsString()
    identifier: string

    @ApiProperty({
        description: 'Código OTP de 6 dígitos enviado por email',
        example: '123456',
        minLength: 6,
        maxLength: 6,
        pattern: '^\\d{6}$'
    })
    @IsString()
    @Length(6,6, {message: 'O código deve ter 6 dígitos'})
    otpCode : string
}