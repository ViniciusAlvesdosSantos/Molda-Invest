import { Injectable, MethodNotAllowedException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class AccountsService {
  constructor (private prisma : PrismaService){}
  
  async create(userId : string, createAccountDto: CreateAccountDto) {
    
    if(!userId){
      throw new MethodNotAllowedException(`Usuario com o ${userId} não encontrado`)
    }

  }

  findAll() {
    return `This action returns all accounts`;
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
