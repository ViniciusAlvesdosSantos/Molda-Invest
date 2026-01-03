// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   Request,
//   UseGuards,
//   HttpCode,
//   HttpStatus,
// } from '@nestjs/common';
// import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
// import { TransactionsService } from './transactions.service';
// import { CreateTransactionDto } from './dto/create-transaction.dto';
// import { UpdateTransactionDto } from './dto/update-transaction.dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

// @ApiTags('Transações')
// @Controller('transactions')
// @UseGuards(JwtAuthGuard)
// @ApiBearerAuth()
// export class TransactionsController {
//   constructor(private readonly transactionsService: TransactionsService) {}

//   @Post()
//   @HttpCode(HttpStatus.CREATED)
//   @ApiOperation({
//     summary: 'Criar nova transação',
//     description: 'Cria uma nova transação financeira para o usuário autenticado',
//   })
//   @ApiResponse({
//     status: 201,
//     description: 'Transação criada com sucesso',
//     schema: {
//       example: {
//         id: 'abc-123',
//         description: 'Salário de Dezembro',
//         amount: 5000.5,
//         date: '2024-12-29T10:30:00.000Z',
//         type: 'INCOME',
//         categoryId: 'xyz-789',
//         userId: 'user-456',
//         category: {
//           id: 'xyz-789',
//           name: 'Salário',
//           icon: 'attach_money',
//           type: 'INCOME',
//         },
//       },
//     },
//   })
//   @ApiResponse({
//     status: 400,
//     description: 'Dados inválidos ou tipo incompatível com a categoria'
//   })
//   @ApiResponse({
//     status: 401,
//     description: 'Token não fornecido ou inválido'
//   })
//   @ApiResponse({
//     status: 404,
//     description: 'Categoria não encontrada'
//   })
//   create(
//     @Request() req: RequestWithUser,
//     @Body() createTransactionDto: CreateTransactionDto,
//   ) {
//     return this.transactionsService.create(req.user.sub, createTransactionDto);
//   }

//   @Get()
//   @ApiOperation({
//     summary:'Listar todas as transações',
//     description: 'Retorna todas as transações do usuário, ordenadas por data decrescente'
//   })
//    @ApiResponse({
//     status: 200,
//     description: 'Lista de transações retornada com sucesso',
//     schema: {
//       example: [
//         {
//           id: 'abc-123',
//           description: 'Almoço',
//           amount: 50.0,
//           date: '2024-12-29T12:00:00.000Z',
//           type: 'EXPENSE',
//           categoryId: 'xyz-789',
//           userId: 'user-456',
//           category: {
//             id: 'xyz-789',
//             name: 'Alimentação',
//             icon: 'food',
//             type: 'EXPENSE',
//           },
//         },
//       ],
//     },
//   })
//   @ApiResponse({
//     status: 401,
//     description: 'Token não fornecido ou inválido'
//   })
//   findAll(@Request() req: RequestWithUser) {
//     return this.transactionsService.findAll(req.user.sub);
//   }

//   @Get('category/:categoryId')
//   @ApiOperation({
//     summary: 'Listar transações por categoria',
//     description: 'Retorna todas as transações de uma categoria específica',
//   })
//   @ApiParam({
//     name: 'categoryId',
//     description: 'UUID da categoria',
//     example: 'e513fd68-d10d-44ef-be57-8da42ac6f701',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Lista de transações da categoria retornada com sucesso',
//     schema: {
//       example: [
//         {
//           id: 'abc-123',
//           description: 'Almoço no restaurante',
//           amount: 50.0,
//           date: '2024-12-29T12:00:00.000Z',
//           type: 'EXPENSE',
//           categoryId: 'e513fd68-d10d-44ef-be57-8da42ac6f701',
//           userId: 'user-456',
//           category: {
//             id: 'e513fd68-d10d-44ef-be57-8da42ac6f701',
//             name: 'Alimentação',
//             icon: 'food',
//             type: 'EXPENSE',
//           },
//         },
//       ],
//     },
//   })
//   @ApiResponse({
//     status: 401,
//     description: 'Token não fornecido ou inválido',
//   })
//   async findByCategory(
//     @Request() req: RequestWithUser,
//     @Param('categoryId') categoryId: string,
//   ) {
//     return this.transactionsService.findByCategory(categoryId, req.user.sub);
//   }

//   @Get(':id')
//   @ApiOperation({
//     summary: 'Buscar transação por ID',
//     description: 'Retorna os detalhes de uma transação específica',
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'UUID da transação',
//     example: '4fd2d663-c76d-4df5-b721-ce2a0705238e',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Transação encontrada',
//     schema: {
//       example: {
//         id: '4fd2d663-c76d-4df5-b721-ce2a0705238e',
//         description: 'Salário de Dezembro',
//         amount: 5000.5,
//         date: '2024-12-29T10:30:00.000Z',
//         type: 'INCOME',
//         categoryId: 'xyz-789',
//         userId: 'user-456',
//         category: {
//           id: 'xyz-789',
//           name: 'Salário',
//           icon: 'attach_money',
//           type: 'INCOME',
//         },
//       },
//     },
//   })
//   @ApiResponse({
//     status: 401,
//     description: 'Token não fornecido ou inválido',
//   })
//   @ApiResponse({
//     status: 404,
//     description: 'Transação não encontrada',
//   })
//   findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
//     return this.transactionsService.findOne(id, req.user.sub);
//   }

//   @Patch(':id')
//   @ApiOperation({
//     summary: 'Atualizar transação',
//     description: 'Atualiza os dados de uma transação existente',
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'UUID da transação',
//     example: '4fd2d663-c76d-4df5-b721-ce2a0705238e',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Transação atualizada com sucesso',
//     schema: {
//       example: {
//         id: '4fd2d663-c76d-4df5-b721-ce2a0705238e',
//         description: 'Salário de Dezembro (Atualizado)',
//         amount: 5500.0,
//         date: '2024-12-29T10:30:00.000Z',
//         type: 'INCOME',
//         categoryId: 'xyz-789',
//         userId: 'user-456',
//         category: {
//           id: 'xyz-789',
//           name: 'Salário',
//           icon: 'attach_money',
//           type: 'INCOME',
//         },
//       },
//     },
//   })
//   @ApiResponse({
//     status: 400,
//     description: 'Dados inválidos ou tipo incompatível com a categoria',
//   })
//   @ApiResponse({
//     status: 401,
//     description: 'Token não fornecido ou inválido',
//   })
//   @ApiResponse({
//     status: 404,
//     description: 'Transação ou categoria não encontrada',
//   })
//   update(
//     @Request() req: RequestWithUser,
//     @Param('id') id: string,
//     @Body() updateTransactionDto: UpdateTransactionDto,
//   ) {
//     return this.transactionsService.update(
//       id,
//       req.user.sub,
//       updateTransactionDto,
//     );
//   }

//   @Delete(':id')
//   @HttpCode(HttpStatus.OK)
//   @ApiOperation({
//     summary: 'Deletar transação',
//     description: 'Remove uma transação do sistema',
//   })
//   @ApiParam({
//     name: 'id',
//     description: 'UUID da transação',
//     example: '4fd2d663-c76d-4df5-b721-ce2a0705238e',
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'Transação deletada com sucesso',
//     schema: {
//       example: {
//         message: 'Transação deletada com sucesso',
//       },
//     },
//   })
//   @ApiResponse({
//     status: 401,
//     description: 'Token não fornecido ou inválido',
//   })
//   @ApiResponse({
//     status: 404,
//     description: 'Transação não encontrada',
//   })
//   remove(@Request() req: RequestWithUser, @Param('id') id: string) {
//     return this.transactionsService.remove(id,req.user.sub);
//   }
// }
