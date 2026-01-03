import { IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class VerifyOtpDto {
    @ApiProperty({example: 'user@mail.com'})
    @IsString()
    identifier: string

    @ApiProperty({example: '123456'})
    @IsString()
    @Length(6,6, {message: 'O código deve ter de 6 dígitos'})
    otpCode : string
}