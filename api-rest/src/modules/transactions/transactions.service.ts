// import { 
//   BadRequestException, 
//   Injectable, 
//   NotFoundException 
// } from '@nestjs/common';
// import { PrismaService } from 'src/database/prisma.service';
// import { TransactionType, Decimal } from '@prisma/client';
// import { CreateTransactionDto } from './dto/create-transaction.dto';
// import { UpdateTransactionDto } from './dto/update-transaction.dto';

// @Injectable()
// export class TransactionsService {
//   constructor(private readonly prisma: PrismaService) {}

//   // ========================================
//   // CRIAR TRANSAÇÃO
//   // ========================================

//   async create(userId: string, createTransactionDto: CreateTransactionDto) {
//     // ✅ Validar tipo
//     if (!Object.values(TransactionType).includes(createTransactionDto.type as TransactionType)) {
//       throw new BadRequestException(
//         `Tipo de transação inválido: ${createTransactionDto.type}. Tipos permitidos: INCOME, EXPENSE, INVESTMENT, TRANSFER`
//       );
//     }



//     // ✅ Buscar conta (se o campo accountId existir no seu DTO)
//     const account = await this.prisma.account.findFirst({
//       where: {
//         id: Number(createTransactionDto.accountId),
//         userId: Number(userId),
//       },
//     });

//     if (!account) {
//       throw new NotFoundException('Conta não encontrada');
//     }

//     // ✅ Calcular saldo
//     const balanceBefore = new Decimal(account.balance.toString());
//     const amount = new Decimal(createTransactionDto.amount);
//     let balanceAfter: Decimal;

//     switch (createTransactionDto.type) {
//       case TransactionType.INCOME:
//         // ➕ ENTRADA: adiciona ao saldo
//         balanceAfter = balanceBefore.add(amount);
//         break;

//       case TransactionType.EXPENSE:
//       case TransactionType.INVESTMENT:
//         // ➖ SAÍDA: subtrai do saldo
//         balanceAfter = balanceBefore.sub(amount);
        
//         // ⚠️ Validar saldo suficiente
//         if (balanceAfter.lessThan(0)) {
//           throw new BadRequestException(
//             `Saldo insuficiente. Disponível: R$ ${balanceBefore.toFixed(2)}, Necessário: R$ ${amount.toFixed(2)}`
//           );
//         }
//         break;

//       default:
//         throw new BadRequestException(`Tipo de transação inválido: ${createTransactionDto.type}`);
//     }

//     // ✅ Criar transação (operação atômica)
//     return await this.prisma.$transaction(async (tx) => {
//       // Criar transação
//       const transaction = await tx.transaction.create({
//         data: {
//           userId,
//           accountId: Number(createTransactionDto.accountId),
//           categoryId: Number(createTransactionDto.categoryId),
//           description: createTransactionDto.description,
//           amount: createTransactionDto.amount,
//           type: createTransactionDto.type,
//           data: new Date(createTransactionDto.date), // ✅ Campo correto: "data"
//           balanceBefore: balanceBefore.toNumber(),
//           balanceAfter: balanceAfter.toNumber(),
//         },
//       });

//       // Atualizar saldo da conta
//       await tx.account.update({
//         where: { id: createTransactionDto.accountId },
//         data: {
//           balance: balanceAfter.toNumber(),
//         },
//       });

//       return transaction;
//     });
//   }

//   // ========================================
//   // CRIAR TRANSFERÊNCIA (ENTRE CONTAS)
//   // ========================================

//   async createTransfer(
//     userId: string, // ✅ CORRIGIDO: era number
//     fromAccountId: string,
//     toAccountId: string,
//     amount: number,
//     description: string,
//     date: Date,
//   ) {
//     if (fromAccountId === toAccountId) {
//       throw new BadRequestException('Não é possível transferir para a mesma conta');
//     }

//     // ✅ Buscar contas
//     const [fromAccount, toAccount] = await Promise.all([
//       this.prisma.account.findFirst({
//         where: { id: fromAccountId, userId },
//       }),
//       this.prisma.account.findFirst({
//         where: { id: toAccountId, userId },
//       }),
//     ]);

//     if (!fromAccount) {
//       throw new NotFoundException('Conta de origem não encontrada');
//     }

//     if (!toAccount) {
//       throw new NotFoundException('Conta de destino não encontrada');
//     }

//     // ✅ Validar saldo
//     const amountDecimal = new Decimal(amount);
//     const fromBalanceBefore = new Decimal(fromAccount.balance.toString());
//     const fromBalanceAfter = fromBalanceBefore.sub(amountDecimal);

//     if (fromBalanceAfter.lessThan(0)) {
//       throw new BadRequestException(
//         `Saldo insuficiente na conta de origem. Disponível: R$ ${fromBalanceBefore.toFixed(2)}`
//       );
//     }

//     const toBalanceBefore = new Decimal(toAccount.balance.toString());
//     const toBalanceAfter = toBalanceBefore.add(amountDecimal);

//     // ✅ Buscar categoria de transferência (se existir relacionamento)
//     const transferCategory = await this.prisma.category.findFirst({
//       where: {
//         userId,
//         type: TransactionType.TRANSFER,
//       },
//     });

//     // ✅ Criar transações (operação atômica)
//     return await this.prisma.$transaction(async (tx) => {
//       // 1. Criar transação de saída
//       const outTransaction = await tx.transaction.create({
//         data: {
//           userId,
//           accountId: fromAccountId,
//           categoryId: transferCategory?.id,
//           description: `Transferência para conta destino: ${description}`,
//           amount,
//           type: TransactionType.TRANSFER,
//           data: new Date(date), // ✅ Campo correto: "data"
//           balanceBefore: fromBalanceBefore.toNumber(),
//           balanceAfter: fromBalanceAfter.toNumber(),
//         },
//       });

//       // 2. Criar transação de entrada
//       const inTransaction = await tx.transaction.create({
//         data: {
//           userId,
//           accountId: toAccountId,
//           categoryId: transferCategory?.id,
//           description: `Transferência da conta origem: ${description}`,
//           amount,
//           type: TransactionType.TRANSFER,
//           data: new Date(date), // ✅ Campo correto: "data"
//           balanceBefore: toBalanceBefore.toNumber(),
//           balanceAfter: toBalanceAfter.toNumber(),
//         },
//       });

//       // 3. Atualizar saldos
//       await Promise.all([
//         tx.account.update({
//           where: { id: fromAccountId },
//           data: { balance: fromBalanceAfter.toNumber() },
//         }),
//         tx.account.update({
//           where: { id: toAccountId },
//           data: { balance: toBalanceAfter.toNumber() },
//         }),
//       ]);

//       return {
//         outTransaction,
//         inTransaction,
//         message: 'Transferência realizada com sucesso',
//       };
//     });
//   }

//   // ========================================
//   // LISTAR TRANSAÇÕES
//   // ========================================

//   async findAll(
//     userId: string,
//     filters?: {
//       type?: TransactionType;
//       accountId?: string;
//       categoryId?: string;
//       startDate?: Date;
//       endDate?: Date;
//       search?: string;
//     },
//   ) {
//     const where: any = { userId };

//     if (filters?.type) {
//       where.type = filters.type;
//     }

//     if (filters?.accountId) {
//       where.accountId = filters.accountId;
//     }

//     if (filters?.categoryId) {
//       where.categoryId = filters.categoryId;
//     }

//     if (filters?.startDate || filters?.endDate) {
//       where.data = {}; // ✅ Campo correto: "data"
//       if (filters.startDate) {
//         where.data.gte = filters.startDate;
//       }
//       if (filters.endDate) {
//         where.data.lte = filters.endDate;
//       }
//     }

//     if (filters?.search) {
//       where.description = { 
//         contains: filters.search, 
//         mode: 'insensitive' 
//       };
//     }

//     return this.prisma.transaction.findMany({
//       where,
//       orderBy: [
//         { data: 'desc' }, // ✅ Campo correto: "data"
//         { createdAt: 'desc' }
//       ],
//     });
//   }

//   // ========================================
//   // BUSCAR UMA TRANSAÇÃO
//   // ========================================

//   async findOne(id: string, userId: string) {
//     const transaction = await this.prisma.transaction.findUnique({
//       where: { id },
//     });

//     if (!transaction || transaction.userId !== userId) {
//       throw new NotFoundException('Transação não encontrada');
//     }

//     return transaction;
//   }

//   // ========================================
//   // ATUALIZAR TRANSAÇÃO
//   // ========================================

//   async update(
//     id: string,
//     userId: string,
//     updateTransactionDto: UpdateTransactionDto,
//   ) {
//     const existingTransaction = await this.findOne(id, userId);

//     // ❌ Não permitir alterar valor (afeta histórico de saldo)
//     if (
//       updateTransactionDto.amount &&
//       updateTransactionDto.amount !== existingTransaction.amount.toNumber()
//     ) {
//       throw new BadRequestException(
//         'Não é possível alterar o valor de uma transação. Delete e crie uma nova para manter a integridade do histórico.'
//       );
//     }

//     // ❌ Não permitir alterar tipo
//     if (
//       updateTransactionDto.type &&
//       updateTransactionDto.type !== existingTransaction.type
//     ) {
//       throw new BadRequestException(
//         'Não é possível alterar o tipo de uma transação. Delete e crie uma nova.'
//       );
//     }

//     // ❌ Não permitir alterar conta
//     if (
//       updateTransactionDto.accountId &&
//       updateTransactionDto.accountId !== existingTransaction.accountId.toString()
//     ) {
//       throw new BadRequestException(
//         'Não é possível alterar a conta de uma transação. Delete e crie uma nova.'
//       );
//     }

//     // ✅ Atualizar apenas campos permitidos (baseado no schema)
//     return this.prisma.transaction.update({
//       where: { id },
//       data: {
//         description: updateTransactionDto.description,
//         ...(updateTransactionDto.categoryId && {
//           categoryId: Number(updateTransactionDto.categoryId),
//         }),
//         ...(updateTransactionDto.date && {
//           data: new Date(updateTransactionDto.date), // ✅ Campo correto: "data"
//         }),
//       },
//     });
//   }

//   // ========================================
//   // DELETAR TRANSAÇÃO
//   // ========================================

//   async remove(id: string, userId: string) {
//     const transaction = await this.findOne(id, userId);

//     // ✅ Reverter saldo (operação atômica)
//     return await this.prisma.$transaction(async (tx) => {
//       const account = await tx.account.findUnique({
//         where: { id: transaction.accountId },
//       });

//       if (!account) {
//         throw new NotFoundException('Conta não encontrada');
//       }

//       const currentBalance = new Decimal(account.balance.toString());
//       const transactionAmount = new Decimal(transaction.amount.toString());
//       let newBalance: Decimal;

//       // Reverter operação
//       switch (transaction.type) {
//         case TransactionType.INCOME:
//           // Era entrada → subtrair
//           newBalance = currentBalance.sub(transactionAmount);
//           break;

//         case TransactionType.EXPENSE:
//         case TransactionType.INVESTMENT:
//           // Era saída → adicionar de volta
//           newBalance = currentBalance.add(transactionAmount);
//           break;

//         case TransactionType.TRANSFER:
//           throw new BadRequestException(
//             'Transferências não podem ser deletadas individualmente. Delete ambas as transações relacionadas.'
//           );

//         default:
//           throw new BadRequestException('Tipo de transação inválido');
//       }

//       // Atualizar saldo
//       await tx.account.update({
//         where: { id: transaction.accountId },
//         data: { balance: newBalance.toNumber() },
//       });

//       // Deletar transação
//       await tx.transaction.delete({
//         where: { id },
//       });

//       return {
//         message: 'Transação deletada e saldo revertido com sucesso',
//         previousBalance: currentBalance.toNumber(),
//         newBalance: newBalance.toNumber(),
//       };
//     });
//   }

//   // ========================================
//   // BUSCAR POR CATEGORIA
//   // ========================================

//   async findByCategory(categoryId: string, userId: string) {
//     return this.prisma.transaction.findMany({
//       where: {
//         categoryId,
//         userId,
//       },
//       orderBy: { data: 'desc' }, // ✅ Campo correto: "data"
//     });
//   }

//   // ========================================
//   // ESTATÍSTICAS
//   // ========================================

//   async getStatistics(
//     userId: string,
//     startDate?: Date,
//     endDate?: Date,
//   ) {
//     const where: any = { userId };

//     if (startDate || endDate) {
//       where.data = {}; // ✅ Campo correto: "data"
//       if (startDate) where.data.gte = startDate;
//       if (endDate) where.data.lte = endDate;
//     }

//     const [income, expenses, investments] = await Promise.all([
//       this.prisma.transaction.aggregate({
//         where: { ...where, type: TransactionType.INCOME },
//         _sum: { amount: true },
//         _count: true,
//       }),
//       this.prisma.transaction.aggregate({
//         where: { ...where, type: TransactionType.EXPENSE },
//         _sum: { amount: true },
//         _count: true,
//       }),
//       this.prisma.transaction.aggregate({
//         where: { ...where, type: TransactionType.INVESTMENT },
//         _sum: { amount: true },
//         _count: true,
//       }),
//     ]);

//     const totalIncome = new Decimal(income._sum.amount || 0).toNumber();
//     const totalExpenses = new Decimal(expenses._sum.amount || 0).toNumber();
//     const totalInvestments = new Decimal(investments._sum.amount || 0).toNumber();

//     return {
//       income: {
//         total: totalIncome,
//         count: income._count,
//       },
//       expenses: {
//         total: totalExpenses,
//         count: expenses._count,
//       },
//       investments: {
//         total: totalInvestments,
//         count: investments._count,
//       },
//       balance: totalIncome - totalExpenses - totalInvestments,
//       totalTransactions: income._count + expenses._count + investments._count,
//     };
//   }
// }
