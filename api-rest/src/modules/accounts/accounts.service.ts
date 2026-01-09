import {
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createAccountDto: CreateAccountDto) {
    if (!userId) {
      throw new MethodNotAllowedException(
        `Usuario com o ${userId} não encontrado`,
      );
    }

    try {
      await this.prisma.account.create({
        data: {
          ...createAccountDto,
          userId,
        },
      });
    } catch (error) {
      throw new Error('Erro ao criar a conta');
    }
  }

  async findAccountsById(userId: number) {
    if (!userId) throw new NotFoundException('Usuario não encontrado');

    return await this.prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        accountName: true,
        balance: true,
        color: true,
        icon: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAccountDetails(userId: number, accountId: number){
    if(!userId) throw new NotFoundException('Usuário não encontrado')
    if(!accountId) throw new NotFoundException('Conta não encontrada')

    const account = await this.prisma.account.findFirst({
      where:{
        id: accountId,
        userId
      },
      include:{

      }
    })
  }

  async findAllSystem() {
    return this.prisma.account.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        accountName: true,
        balance: true,
        color: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
        userId: true, // ✅ Incluir userId para saber de quem é
        user: {
          // ✅ Incluir dados do usuário
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });
  }

  async getBalance(userId: number, accountId: number) {
    if (!accountId)
      throw new NotFoundException(
        `Número de conta ${accountId} não encontrada`,
      );

    if (!userId)
      throw new NotFoundException(`Id de usuário ${userId} não encontrado`);

    try {
      const response = await this.prisma.account.findFirst({
        where: {
          userId,
          id: accountId,
        },
        select: {
          balance: true,
        },
      });

      return response;
    } catch (error) {
      throw new Error('Busca de balance falhou');
    }
  }

  async findOneAccount(id: number, userId: number) {
    if (!userId) throw new NotFoundException('Usuário não encontrado');

    const account = await this.prisma.account.findFirst({
      where: {
        id,
        userId
      },
    });
    
    if (!account) {
      throw new NotFoundException('Conta não encontrada ou acesso negado');
    }

    return account;
  }

  async update(id: number, userId: number, updateAccountDto: UpdateAccountDto) {
    // Valida se conta existe e pertence ao usuário
    await this.findOneAccount(id, userId);

    return this.prisma.account.update({
      where: { id },
      data: {
        ...updateAccountDto
      }
    });
  }

  async remove(id: number, userId: number) {
    // Valida se conta existe e pertence ao usuário
    await this.findOneAccount(id, userId);

    // Deleta usando apenas o id
    return await this.prisma.account.delete({
      where: { id }
    });
  }
}
