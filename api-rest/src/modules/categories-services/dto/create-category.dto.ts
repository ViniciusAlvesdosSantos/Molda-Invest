import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Matches } from "class-validator";
import { CategoryIcon } from "src/common/enums/category-icons.enum";
import { TransactionType } from "src/common/enums/transaction-type.enum";
import { Type } from "class-transformer";

export class CreateCategoryDto {
    @ApiProperty({
        example: "Alimentação",
        description: "Nome da categoria"
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        example: CategoryIcon.FOOD,
        description: "Ícone da categoria",
        enum: CategoryIcon,
        required: false
    })
    @IsOptional()
    @IsEnum(CategoryIcon)
    icon?: CategoryIcon;

    @ApiProperty({
        example: TransactionType.EXPENSE,
        description: "Tipo da transação",
        enum: TransactionType
    })
    @IsNotEmpty()
    @IsEnum(TransactionType)
    type: TransactionType;

    @ApiProperty({
        example: "#059669",
        description: "Cor da categoria",
        required: false
    })
    @IsOptional()
    @IsString()
    color?: string

    @ApiProperty({
        example: "1000.00",
        description: "Orçamento/limite de gasto para a categoria (máximo 8 dígitos inteiros e 2 decimais)",
        required: false,
        type: 'string',
        pattern: '^(?!0+(?:\\.0{1,2})?$)\\d{1,8}(\\.\\d{1,2})?$'
    })
    @IsOptional()
    @IsString()
    @Matches(/^(?!0+(?:\\.0{1,2})?$)\d{1,8}(\.\d{1,2})?$/, {
        message: 'Budget deve ser um valor positivo maior que zero, com no máximo 8 dígitos inteiros e 2 decimais (ex: 99999999.99)'
    })
    budget?: string;
}
