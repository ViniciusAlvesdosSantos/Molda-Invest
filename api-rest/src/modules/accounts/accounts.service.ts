import { Injectable, MethodNotAllowedException, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundError } from 'rxjs';

@Injectable()
export class AccountsService {
  constructor (private prisma : PrismaService){}
  
  async create(userId : number, createAccountDto: CreateAccountDto) {
    
    if(!userId){
      throw new MethodNotAllowedException(`Usuario com o ${userId} não encontrado`)
    }

    try{
      await this.prisma.account.create({
        data: {
          ...createAccountDto,
          userId
        }
      })
    } catch(error){
      throw new Error('Erro ao criar a conta')
    }

  }

  async findAll(userId: number) {
    if(!userId) throw new NotFoundException('Usuario não encontrado')

    await this.prisma.account.findMany({
      where: {userId}
    })
  }

  async findAllSystem(){
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
      user: {       // ✅ Incluir dados do usuário
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
  

  async getBalance(userId : number, accountId: number){
    if(!accountId) throw new NotFoundException(`Número de conta ${accountId} não encontrada`)

    if(!userId) throw new NotFoundException(`Id de usuário ${userId} não encontrado` )

    try {
      await this.prisma.account.findFirst({
        where:{
          userId,
          id: accountId
        },
        select: {
          balance: true
        }
      })
    } catch(error){
      throw new Error('Busca de balance falhou')
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
