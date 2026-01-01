import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/database/prisma.service';
import { TransactionType, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    // 1️⃣ Validar categoria
    const category = await this.prismaService.category.findFirst({
      where: {
        id: createTransactionDto.categoryId,
        userId
      }
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    if (category.type !== createTransactionDto.type) {
      throw new BadRequestException(
        `Não é possível criar transação do tipo ${createTransactionDto.type} em uma categoria do tipo ${category.type}`
      );
    }

    // 2️⃣ Buscar conta para pegar o saldo atual
    const account = await this.prismaService.account.findFirst({
      where: {
        id: createTransactionDto.accountId,
        userId
      }
    });

    if (!account) {
      throw new NotFoundException('Conta não encontrada');
    }

    const balanceBefore = account.balance; 
    let balanceAfter: Decimal;

    if (
      createTransactionDto.type === TransactionType.INCOME || 
      createTransactionDto.type === TransactionType.DIVIDEND
    ) {
      // ➕ RECEITA: adiciona ao saldo
      balanceAfter = new Decimal(balanceBefore.toString())
        .add(new Decimal(createTransactionDto.amount));
    } 
    else if (
      createTransactionDto.type === TransactionType.EXPENSE || 
      createTransactionDto.type === TransactionType.INVESTMENT
    ) {
      // ➖ DESPESA/INVESTIMENTO: subtrai do saldo
      balanceAfter = new Decimal(balanceBefore.toString())
        .sub(new Decimal(createTransactionDto.amount));

      // ⚠️ Validar saldo suficiente
      if (balanceAfter.lessThan(0)) {
        throw new BadRequestException(
          `Saldo insuficiente. Disponível: R$ ${balanceBefore}, Necessário: R$ ${createTransactionDto.amount}`
        );
      }
    }
    else if (createTransactionDto.type === TransactionType.RESCUE) {
      // ➕ RESGATE: adiciona ao saldo (voltando de investimento)
      balanceAfter = new Decimal(balanceBefore.toString())
        .add(new Decimal(createTransactionDto.amount));
    }
    else {
      // TRANSFER ou outros tipos
      balanceAfter = balanceBefore;
    }

    // 4️⃣ Gerar referenceNumber único
    const referenceNumber = this.generateReferenceNumber(createTransactionDto.type);

    // 5️⃣ Criar transação (transação atômica do Prisma)
    return await this.prismaService.$transaction(async (prisma) => {
      // Criar registro da transação
      const transaction = await prisma.transaction.create({
        data: {
          userId: userId,
          accountId: createTransactionDto.accountId,
          categoryId: createTransactionDto.categoryId,
          description: createTransactionDto.description,
          amount: createTransactionDto.amount,
          type: createTransactionDto.type,
          status: 'COMPLETED',
          date: new Date(createTransactionDto.date),
          balanceBefore: balanceBefore,  // 📸 Registra saldo antes
          balanceAfter: balanceAfter,    // 📸 Registra saldo depois
          referenceNumber: referenceNumber,
          notes: createTransactionDto.notes,
          tags: createTransactionDto.tags || [],
        },
        include: {
          category: true,
          account: true,
        },
      });

      // Atualizar saldo da conta
      await prisma.account.update({
        where: { id: createTransactionDto.accountId },
        data: { 
          balance: balanceAfter,
          updatedAt: new Date()
        }
      });

      return transaction;
    });
  }

  async findAll(userId: string) {
    return this.prismaService.transaction.findMany({
      where: {
        userId: userId,
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const transaction = await this.prismaService.transaction.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        category: true,
        account: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transação não encontrada');
    }

    return transaction;
  }

  async update(
    id: string,
    userId: string,
    updateTransactionDto: UpdateTransactionDto,
  ) {
    const existingTransaction = await this.findOne(id, userId);

    // ⚠️ Não permitir alterar amount (afetaria saldo histórico)
    if (updateTransactionDto.amount && 
        updateTransactionDto.amount !== existingTransaction.amount.toNumber()) {
      throw new BadRequestException(
        'Não é possível alterar o valor de uma transação. Delete e crie uma nova.'
      );
    }

    // Validar categoria se estiver mudando
    if (updateTransactionDto.categoryId || updateTransactionDto.type) {
      const categoryId = updateTransactionDto.categoryId || existingTransaction.categoryId;
      const type = updateTransactionDto.type || existingTransaction.type;

      if (categoryId) {
        const category = await this.prismaService.category.findFirst({
          where: { id: categoryId, userId }
        });

        if (!category) {
          throw new NotFoundException("Categoria não encontrada");
        }

        if (category.type !== type) {
          throw new BadRequestException(
            `Não é possível criar transação do tipo ${type} em uma categoria do tipo ${category.type}`
          );
        }
      }
    }

    return this.prismaService.transaction.update({
      where: { id },
      data: {
        description: updateTransactionDto.description,
        notes: updateTransactionDto.notes,
        tags: updateTransactionDto.tags,
        categoryId: updateTransactionDto.categoryId,
        ...(updateTransactionDto.date && {
          date: new Date(updateTransactionDto.date),
        }),
      },
      include: {
        category: true,
        account: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);

    // ⚠️ IMPORTANTE: Reverter saldo da conta ao deletar
    await this.prismaService.$transaction(async (prisma) => {
      const account = await prisma.account.findUnique({
        where: { id: transaction.accountId }
      });

      if (!account) {
        throw new NotFoundException('Conta não encontrada');
      }

      let newBalance: Decimal;

      // Reverter operação baseado no tipo
      if (
        transaction.type === TransactionType.INCOME || 
        transaction.type === TransactionType.DIVIDEND ||
        transaction.type === TransactionType.RESCUE
      ) {
        // Era entrada, então subtrair do saldo atual
        newBalance = new Decimal(account.balance.toString())
          .sub(new Decimal(transaction.amount.toString()));
      } else {
        // Era saída, então adicionar de volta ao saldo
        newBalance = new Decimal(account.balance.toString())
          .add(new Decimal(transaction.amount.toString()));
      }

      // Atualizar saldo da conta
      await prisma.account.update({
        where: { id: transaction.accountId },
        data: { 
          balance: newBalance,
          updatedAt: new Date()
        }
      });

      // Deletar transação
      await prisma.transaction.delete({
        where: { id },
      });
    });

    return { message: 'Transação deletada e saldo revertido com sucesso' };
  }

  async findByCategory(categoryId: string, userId: string) {
    return this.prismaService.transaction.findMany({
      where: {
        categoryId,
        userId
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  // 🎯 Gerar referência única
  private generateReferenceNumber(type: TransactionType): string {
    const prefixMap = {
      INCOME: 'INC',
      EXPENSE: 'EXP',
      INVESTMENT: 'INV',
      RESCUE: 'RES',
      DIVIDEND: 'DIV',
      TRANSFER: 'TRF',
    };
    
    const prefix = prefixMap[type] || 'TXN';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    
    return `${prefix}-${timestamp}-${random}`;
  }
}
