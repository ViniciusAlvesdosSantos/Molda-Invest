import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto) {
    const category = await this.prismaService.category.findFirst({
      where: {
        id: createTransactionDto.categoryId,
        userId
      }
    })

    if(!category){
      throw new NotFoundException('Categoria não encontrada')
    }

    if(category.type !== createTransactionDto.type){
      throw new BadRequestException(
        `Não é possível criar transação do tipo ${createTransactionDto.type} em uma categoria do tipo ${category.type}`
      )
    }
    
    await this.prismaService.transaction.create({
      data: {
        ...createTransactionDto,
        userId: userId,
        date: new Date(createTransactionDto.date),
      },
      include: {
        category: true,
      },
    });
  }

  async findAll(userId: string) {
    return this.prismaService.transaction.findMany({
      where: {
        userId: userId,
      },
      include: {
        category: true,
      },
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
    await this.findOne(id, userId);

    if(updateTransactionDto.categoryId || updateTransactionDto.type){
      const transaction = await this.findOne(id, userId)

      const categoryId = updateTransactionDto.categoryId || transaction.type
      const type = updateTransactionDto.type || transaction.type

      const category = await this.prismaService.category.findFirst({
        where: { id: categoryId, userId}
      })

      if(!category){
        throw new NotFoundException("Categoria não encontrada")
      }

      if(category.type !== type){
        throw new BadRequestException(
          `Não é possível criar transação do tipo ${type} em uma categoria do tipo ${category.type}`
        );
      }
    }
    
    return this.prismaService.transaction.update({
      where: { id },
      data: {
        ...updateTransactionDto,
        ...(updateTransactionDto.date && {
          date: new Date(updateTransactionDto.date),
        }),
      },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prismaService.transaction.delete({
      where: { id },
    });

    return { message: 'Transação deletada com sucesso' };
  }

  async findByCategory(categoryId: string, userId: string) {
    return this.prismaService.transaction.findMany({
      where: {
        categoryId,
        userId
      },
      include: {
        category: true,
      },
      orderBy: { date: 'desc' },
    });
  }
}
