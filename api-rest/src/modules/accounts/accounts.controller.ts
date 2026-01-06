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
  Request
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
  findAll() {
    return this.accountsService.findAllSystem();
  }

  @Get('balance/:id')
  async getBalance(@Request() req: RequestWithUser, @Param('id') accountId : number){
    return this.accountsService.getBalance(req.user.sub, accountId)
  }

  @Get()
  findAccounts(@Request() req: RequestWithUser) {
    return this.accountsService.findOne(req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountsService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsService.remove(+id);
  }
}
