import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  Req
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@ApiTags('Contas')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar nova conta',
    description: 'Criar uma nova conta para entrada e saída monetária'
  })
  @ApiResponse({
    status: 201,
    description: 'Conta criada com sucesso',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou tipo incompatível com a conta'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  @ApiResponse({
    status: 404,
    description: 'Recurso não encontrado'
  })
  async create(
    @Request() req: RequestWithUser,
    @Body() createAccountDto: CreateAccountDto,
  ) {
    return await this.accountsService.create(req.user.sub, createAccountDto)
  }

  @Get('admin/allAccounts')
  @ApiOperation({
    summary: 'Listar todas as contas do sistema',
    description: 'Endpoint administrativo para listar todas as contas de todos os usuários'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contas retornada com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  async findAllAccounts() {
    return await this.accountsService.findAllSystem();
  }

  @Get()
  @ApiOperation({
    summary: 'Listar contas do usuário',
    description: 'Retorna lista resumida de todas as contas do usuário autenticado'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de contas retornada com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  @ApiResponse({
    status: 404,
    description: 'Usuário não encontrado'
  })
  async findAccountsById(@Request() req: RequestWithUser){
    return await this.accountsService.findAccountsById(req.user.sub)
  }

  @Get('balance/:id')
  @ApiOperation({
    summary: 'Buscar saldo da conta',
    description: 'Retorna o saldo atual de uma conta específica'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da conta',
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Saldo retornado com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  @ApiResponse({
    status: 404,
    description: 'Conta não encontrada'
  })
  async getBalance(@Request() req: RequestWithUser, @Param('id') accountId : number){
    return await this.accountsService.getBalance(req.user.sub, accountId)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar conta por ID',
    description: 'Retorna os detalhes de uma conta específica'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da conta',
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Conta retornada com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  @ApiResponse({
    status: 404,
    description: 'Conta não encontrada ou acesso negado'
  })
  async findAccount(@Request() req: RequestWithUser, @Param('id') accountId: number) {
    return this.accountsService.findOneAccount(accountId, req.user.sub );
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar conta',
    description: 'Atualiza os dados de uma conta existente'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da conta',
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Conta atualizada com sucesso'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  @ApiResponse({
    status: 404,
    description: 'Conta não encontrada ou acesso negado'
  })
  async update(@Request() req: RequestWithUser, @Param('id') id: number, @Body() updateAccountDto: UpdateAccountDto) {
    return await this.accountsService.update(id, req.user.sub, updateAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deletar conta',
    description: 'Remove uma conta do sistema'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da conta',
    type: Number
  })
  @ApiResponse({
    status: 204,
    description: 'Conta deletada com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  @ApiResponse({
    status: 404,
    description: 'Conta não encontrada ou acesso negado'
  })
  @ApiResponse({
    status: 405,
    description: 'Não é possível deletar conta com transações'
  })
  async remove(@Request() req: RequestWithUser, @Param('id') id: number) {
    return await this.accountsService.remove(id, req.user.sub);
  }
}
