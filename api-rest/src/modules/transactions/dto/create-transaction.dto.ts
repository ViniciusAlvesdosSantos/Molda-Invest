import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsNumber, IsPositive, IsEnum, IsDateString, IsOptional, IsArray, Matches } from "class-validator";
import { Type } from "class-transformer";
import { TransactionType } from "src/common/enums/transaction-type.enum";

export class CreateTransactionDto {

    @ApiProperty({
        example: "Salário de Dezembro",
        description: "Descrição de salário"
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        example: 5000.00,
        description: "Valor da transação",
        type: Number
    })
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    @Matches(/^(?!0+(?:\\.0{1,2})?$)\d{1,10}(\.\d{1,2})?$/)
    amount : string

    @ApiProperty({
        example: "2024-12-26T10:30:00.000Z",
        description: "Data da transação",
        type: String,
        format: 'date-time'
    })
    @IsDateString()
    date: string

    @ApiProperty({
        example: TransactionType.INCOME,
        description: "Tipo de transação",
        enum: TransactionType
    })
    @IsEnum(TransactionType)
    type: TransactionType


    @ApiProperty({
        example: "uuid-da-categoria",
        description: "ID da categoria"
    })
    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @ApiPropertyOptional({
        example: "Conta Corrente",
        description: "ID da conta"
    })
    @IsString()
    @IsNotEmpty()
    accountId: string;

    @ApiPropertyOptional({
        example: "Pagamento referente ao mês de dezembro",
        description: "Notas adicionais"
    })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({
        example: ["salario", "dezembro"],
        description: "Tags para a transação"
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}

