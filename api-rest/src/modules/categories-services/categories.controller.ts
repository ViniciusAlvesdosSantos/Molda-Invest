import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';

@ApiTags('Categorias')
@Controller('categories')
@UseGuards(JwtAuthGuard) // ✅ Protege todas as rotas
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova categoria customizada' })
  create(
    @Request() req : RequestWithUser,
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    console.log('🎯 User no controller:', req.user); // ✅ Debug
    return this.categoriesService.create(req.user.sub, createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as categorias com filtros e paginação' })
  findAll(
    @Request() req: RequestWithUser
  ) {
    return this.categoriesService.findAll(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  findOne(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.categoriesService.findOne(id, req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto
  ) {
    return this.categoriesService.update(id, req.user.sub, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar categoria' })
  remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string
  ) {
    return this.categoriesService.remove(id, req.user.sub);
  }
}
