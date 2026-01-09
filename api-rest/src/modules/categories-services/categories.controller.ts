import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@ApiTags('Categorias')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Criar nova categoria',
    description: 'Cria uma categoria customizada para o usuário autenticado'
  })
  @ApiResponse({
    status: 201,
    description: 'Categoria criada com sucesso'
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  create(
    @Request() req : RequestWithUser,
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    return this.categoriesService.create(Number(req.user.sub), createCategoryDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar categorias',
    description: 'Retorna todas as categorias do usuário (padrão + customizadas)'
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de categorias retornada com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  findAll(
    @Request() req: RequestWithUser
  ) {
    return this.categoriesService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar categoria por ID',
    description: 'Retorna detalhes de uma categoria específica'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria',
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria encontrada'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada ou acesso negado'
  })
  findOne(
    @Request() req: RequestWithUser,
    @Param('id') id: number
  ) {
    return this.categoriesService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Atualizar categoria',
    description: 'Atualiza uma categoria customizada do usuário'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria',
    type: Number
  })
  @ApiResponse({
    status: 200,
    description: 'Categoria atualizada com sucesso'
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
    description: 'Categoria não encontrada ou acesso negado'
  })
  @ApiResponse({
    status: 405,
    description: 'Não é possível editar categorias padrão do sistema'
  })
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: number,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(id, req.user.sub, updateCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Deletar categoria',
    description: 'Remove uma categoria customizada do usuário'
  })
  @ApiParam({
    name: 'id',
    description: 'ID da categoria',
    type: Number
  })
  @ApiResponse({
    status: 204,
    description: 'Categoria deletada com sucesso'
  })
  @ApiResponse({
    status: 401,
    description: 'Token não fornecido ou inválido'
  })
  @ApiResponse({
    status: 404,
    description: 'Categoria não encontrada ou acesso negado'
  })
  @ApiResponse({
    status: 405,
    description: 'Não é possível deletar categorias padrão do sistema'
  })
  remove(
    @Request() req: RequestWithUser,
    @Param('id') id: number
  ) {
    return this.categoriesService.remove(id, req.user.sub);
  }
}
