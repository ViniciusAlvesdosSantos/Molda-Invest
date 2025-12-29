import { Body, Injectable, NotFoundException, Request } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from 'src/database/prisma.service';
import { DefaultCategory } from 'src/common/interfaces/default-category.interface';
import { CategoryIcon } from 'src/common/enums/category-icons.enum';
import { TransactionType } from 'src/common/enums/transaction-type.enum';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private readonly defaultCategories: DefaultCategory[] = [
    // Receitas
    {
      name: 'Salário',
      icon: CategoryIcon.SALARY,
      type: TransactionType.INCOME,
    },
    {
      name: 'Freelance',
      icon: CategoryIcon.FREELANCE,
      type: TransactionType.INCOME,
    },
    {
      name: 'Investimentos',
      icon: CategoryIcon.INVESTMENT_INCOME,
      type: TransactionType.INCOME,
    },
    {
      name: 'Outros',
      icon: CategoryIcon.OTHER_INCOME,
      type: TransactionType.INCOME,
    },

    // Despesas
    {
      name: 'Alimentação',
      icon: CategoryIcon.FOOD,
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Transporte',
      icon: CategoryIcon.TRANSPORT,
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Moradia',
      icon: CategoryIcon.HOUSING,
      type: TransactionType.EXPENSE,
    },
    { name: 'Saúde', icon: CategoryIcon.HEALTH, type: TransactionType.EXPENSE },
    {
      name: 'Educação',
      icon: CategoryIcon.EDUCATION,
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Lazer',
      icon: CategoryIcon.ENTERTAINMENT,
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Compras',
      icon: CategoryIcon.SHOPPING,
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Contas',
      icon: CategoryIcon.UTILITIES,
      type: TransactionType.EXPENSE,
    },

    // Investimentos
    {
      name: 'Ações',
      icon: CategoryIcon.STOCKS,
      type: TransactionType.INVESTMENT,
    },
    {
      name: 'Renda Fixa',
      icon: CategoryIcon.FIXED_INCOME,
      type: TransactionType.INVESTMENT,
    },
    {
      name: 'Fundos',
      icon: CategoryIcon.FUNDS,
      type: TransactionType.INVESTMENT,
    },
    {
      name: 'Cripto',
      icon: CategoryIcon.CRYPTO,
      type: TransactionType.INVESTMENT,
    },
  ];

  getDefaultCategories(): DefaultCategory[] {
    return this.defaultCategories;
  }

  async createDefaultCategories(userId: string): Promise<void> {
    await this.prisma.category.createMany({
      data: this.defaultCategories.map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        type: cat.type,
        userId: userId,
      })),
    });
  }
  
  async create(userId: string, createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: {
        ...createCategoryDto,
        userId: userId,
      },
    });
  }

  async findAll(userId: string, type?: TransactionType) {
    const whereClause = { userId } as any;
    if (type) {
      whereClause.type = type;
    }

    return this.prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });
  }

  async findById(userId: string) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByType(userId: string, type: TransactionType) {
    return this.prisma.category.findMany({
      where: {
        userId: userId,
        type: type,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(
    id: string,
    userId: string,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    await this.findOne(id, userId);

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: string, useId: string) {
    await this.findOne(id, useId);

    await this.prisma.category.delete({
      where: { id },
    });
  }
}
