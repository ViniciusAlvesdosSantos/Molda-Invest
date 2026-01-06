import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { CategoryIcon } from "src/common/enums/category-icons.enum";
import { TransactionType } from "src/common/enums/transaction-type.enum";

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
}
