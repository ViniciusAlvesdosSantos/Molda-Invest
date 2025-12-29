import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';


@ApiTags("Autenticação")
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({summary: "Resgistrar novo usuário"})
  @ApiResponse({
    status: 201,
    description: "Usuário criado com sucesso",
    schema: {
      example: {
        id: 'uuid-do-usuario',
        name: 'João Silva',
        email: 'usuario@example.com'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos - verifique os campos obrigatórios',
    schema: {
      example: {
        message: ['Email inválido', 'A senha tem que ter no mínimo 8 caracteres'],
        error: 'Bad Request',
        statusCode: 400
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email já cadastrado no sistema',
    schema: {
      example: {
        message: 'Email já cadastrado',
        error: 'Conflict',
        statusCode: 409
      }
    }
  })
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.register(createAuthDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Fazer login no sistema' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          name: 'João Silva',
          email: 'usuario@example.com'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos',
    schema: {
      example: {
        message: ['Email inválido'],
        error: 'Bad Request',
        statusCode: 400
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciais inválidas - email ou senha incorretos',
    schema: {
      example: {
        message: 'Credenciais Inválidas',
        error: 'Unauthorized',
        statusCode: 401
      }
    }
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
