import { 
  Injectable, 
  NotFoundException,
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TransactionType, Prisma } from '@prisma/client'; // ✅ Importar Prisma também
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

// ✅ Interface simplificada (ajuste conforme necessário)
interface DefaultCategory {
  name: string;
  icon: string;
  type: TransactionType;
  color?: string;
}

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // ========================================
  // CATEGORIAS PADRÃO
  // ========================================

  private readonly defaultCategories: DefaultCategory[] = [
    // 💰 RECEITAS (INCOME)
    {
      name: 'Salário',
      icon: '💼',
      color: '#10b981',
      type: TransactionType.INCOME,
    },
    {
      name: 'Freelance',
      icon: '💻',
      color: '#3b82f6',
      type: TransactionType.INCOME,
    },
    {
      name: 'Investimentos',
      icon: '📈',
      color: '#8b5cf6',
      type: TransactionType.INCOME,
    },
    {
      name: 'Outros',
      icon: '💵',
      color: '#06b6d4',
      type: TransactionType.INCOME,
    },

    // 💸 DESPESAS (EXPENSE)
    {
      name: 'Alimentação',
      icon: '🍔',
      color: '#ef4444',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Transporte',
      icon: '🚗',
      color: '#f59e0b',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Moradia',
      icon: '🏠',
      color: '#ec4899',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Saúde',
      icon: '💊',
      color: '#14b8a6',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Educação',
      icon: '📚',
      color: '#6366f1',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Lazer',
      icon: '🎮',
      color: '#a855f7',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Compras',
      icon: '🛍️',
      color: '#f43f5e',
      type: TransactionType.EXPENSE,
    },
    {
      name: 'Contas',
      icon: '📄',
      color: '#84cc16',
      type: TransactionType.EXPENSE,
    },

    // 📊 INVESTIMENTOS (INVESTMENT)
    {
      name: 'Ações',
      icon: '📊',
      color: '#2563eb',
      type: TransactionType.INVESTMENT,
    },
    {
      name: 'Renda Fixa',
      icon: '🏦',
      color: '#059669',
      type: TransactionType.INVESTMENT,
    },
    {
      name: 'Fundos',
      icon: '💼',
      color: '#7c3aed',
      type: TransactionType.INVESTMENT,
    },
    {
      name: 'Cripto',
      icon: '₿',
      color: '#f97316',
      type: TransactionType.INVESTMENT,
    },

    // 🔄 TRANSFERÊNCIAS (TRANSFER)
    {
      name: 'Transferência',
      icon: '💸',
      color: '#6366f1',
      type: TransactionType.TRANSFER,
    },
  ];

  getDefaultCategories(): DefaultCategory[] {
    return this.defaultCategories;
  }

  async createDefaultCategories(userId: number): Promise<void> {
    // ✅ Verificar se já tem categorias
    const existingCategories = await this.prisma.category.count({
      where: { userId },
    });

    if (existingCategories > 0) {
      throw new ConflictException('Usuário já possui categorias cadastradas');
    }

    await this.prisma.category.createMany({
      data: this.defaultCategories.map((cat) => ({
        name: cat.name,
        icon: cat.icon,
        color: cat.color || '#6366f1',
        type: cat.type,
        userId,
      })),
      skipDuplicates: true,
    });
  }

  // ========================================
  // CRIAR CATEGORIA PERSONALIZADA
  // ========================================

  async create(userId: number, createCategoryDto: CreateCategoryDto) {
    // ✅ Validar se já existe categoria com mesmo nome e tipo
    // const existing = await this.prisma.category.findFirst({
    //   where: {
    //     userId,
    //     name: createCategoryDto.name,
    //     // type: createCategoryDto.type,
    //   },
    // });

    // if (existing) {
    //   throw new ConflictException(
    //     `Categoria "${createCategoryDto.name}" do tipo ${createCategoryDto.type} já existe`
    //   );
    // }

    // return this.prisma.category.create({
    //   data: {
    //     ...createCategoryDto,
    //     userId,
    //   },
    // });
  }

  // ========================================
  // LISTAR CATEGORIAS
  // ========================================

  async findAll(userId: number, type?: TransactionType) {
    // ✅ CORREÇÃO: Usar Prisma.CategoryWhereInput
    const whereClause: Prisma.CategoryWhereInput = { userId };
    
    if (type) {
      whereClause.type = type; // ✅ Agora funciona!
    }

    return this.prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        type: true,
        createdAt: true,
      },
    });
  }

  async findById(userId: number) {
    return this.prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByType(userId: number, type: TransactionType) {
    return this.prisma.category.findMany({
      where: {
        userId,
        type,
      },
      orderBy: { name: 'asc' },
    });
  }

  // ========================================
  // BUSCAR UMA CATEGORIA
  // ========================================

  async findOne(id: number, userId: number) {
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

  // ========================================
  // ATUALIZAR CATEGORIA
  // ========================================

  async update(
    id: number,
    userId: number,
    updateCategoryDto: UpdateCategoryDto,
  ) {
    // await this.findOne(id, userId);

    // // ✅ Se mudou nome ou tipo, validar duplicata
    // if (updateCategoryDto.name || updateCategoryDto.type) {
    //   const category = await this.findOne(id, userId);
      
    //   const conflicting = await this.prisma.category.findFirst({
    //     where: {
    //       userId,
    //       name: updateCategoryDto.name || category.name,
    //       type: updateCategoryDto.type || category.type,
    //       id: { not: id },
    //     },
    //   });

    //   if (conflicting) {
    //     throw new ConflictException(
    //       `Já existe uma categoria "${updateCategoryDto.name || category.name}" do tipo ${updateCategoryDto.type || category.type}`
    //     );
    //   }
    // }

    // return this.prisma.category.update({
    //   where: { id },
    //   data: updateCategoryDto,
    // });
  }

  // ========================================
  // DELETAR CATEGORIA
  // ========================================

  async remove(id: number, userId: number) {
    await this.findOne(id, userId);

    // ✅ Verificar se tem transações usando esta categoria
    const transactionsCount = await this.prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionsCount > 0) {
      throw new ConflictException(
        `Não é possível deletar. Existem ${transactionsCount} transação(ões) usando esta categoria.`
      );
    }

    await this.prisma.category.delete({
      where: { id },
    });

    return {
      message: 'Categoria deletada com sucesso',
    };
  }

  // ========================================
  // ESTATÍSTICAS
  // ========================================

  async getStatistics(userId: number) {
    const categories = await this.prisma.category.findMany({
      where: { userId },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type,
      transactionCount: cat._count.transactions,
    }));
  }
}
