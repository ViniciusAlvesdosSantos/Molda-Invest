import { 
  Controller, 
  Post, 
  Body, 
  HttpCode, 
  HttpStatus,
  Query,
  UseGuards,
  Get,
  Request,
  BadRequestException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBearerAuth
} from '@nestjs/swagger';
import { AuthService } from './services/auth.service';
import { MailService } from 'src/mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  // ========================================
  // FLUXO DE CADASTRO
  // ========================================

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: '1️⃣ Registrar novo usuário',
    description: 'Cria conta e envia link de verificação para o email'
  })
  @ApiResponse({
    status: 201,
    description: 'Usuário cadastrado com sucesso. Email de verificação enviado.',
    schema: {
      example: {
        message: 'Cadastro realizado! Verifique seu email para ativar sua conta.'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Dados inválidos',
    schema: {
      example: {
        message: [
          'Email inválido',
          'CPF deve ter 11 dígitos',
          'Nome deve ter no mínimo 3 caracteres'
        ],
        error: 'Bad Request',
        statusCode: 400
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email, CPF ou telefone já cadastrado',
    schema: {
      example: {
        message: 'O EMAIL informado já possui uma conta vinculada',
        error: 'Conflict',
        statusCode: 409
      }
    }
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '2️⃣ Verificar email',
    description: 'Ativa a conta após clicar no link enviado por email'
  })
  @ApiResponse({
    status: 200,
    description: 'Email verificado com sucesso. Conta ativada.',
    schema: {
      example: {
        message: 'Email verificado com sucesso! Agora você pode fazer login.'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Email já verificado',
    schema: {
      example: {
        message: 'Email já verificado',
        error: 'Bad Request',
        statusCode: 400
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou expirado',
    schema: {
      example: {
        message: 'Token inválido ou expirado',
        error: 'Unauthorized',
        statusCode: 401
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado',
    schema: {
      example: {
        message: 'Usuário não encontrado',
        error: 'Not Found',
        statusCode: 404
      }
    }
  })
  async verifyEmail(@Query('token') token: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException('Token inválido');
    }
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Reenviar link de verificação',
    description: 'Reenvia o email de verificação caso o link tenha expirado'
  })
  @ApiResponse({
    status: 200,
    description: 'Novo link enviado',
    schema: {
      example: {
        message: 'Novo link de verificação enviado para seu email'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Email já verificado',
    schema: {
      example: {
        message: 'Email já verificado',
        error: 'Bad Request',
        statusCode: 400
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado',
    schema: {
      example: {
        message: 'Usuário não encontrado',
        error: 'Not Found',
        statusCode: 404
      }
    }
  })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerification(email);
  }

  // ========================================
  // FLUXO DE LOGIN (OTP)
  // ========================================

  @Post('request-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '3️⃣ Solicitar login (envia OTP)',
    description: 'Envia código de 6 dígitos para o email do usuário'
  })
  @ApiResponse({
    status: 200,
    description: 'Código OTP enviado para o email',
    schema: {
      example: {
        message: 'Código enviado para o e-mail'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Email ou CPF não encontrado',
    schema: {
      example: {
        message: 'Email ou CPF não encontrado',
        error: 'Not Found',
        statusCode: 404
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Email não verificado ou usuário bloqueado',
    schema: {
      example: {
        message: 'Email não verificado. Verifique seu email primeiro.',
        error: 'Unauthorized',
        statusCode: 401
      }
    }
  })
  async requestLogin(@Body() loginDto: LoginDto) {
    return this.authService.requestLogin(loginDto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '4️⃣ Fazer login (com OTP)',
    description: 'Valida o código OTP e retorna tokens de autenticação'
  })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        expiresIn: 3600,
        tokenType: 'Bearer',
        user: {
          id: 'uuid-do-usuario',
          name: 'João Silva',
          email: 'joao@email.com'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Código OTP inválido ou expirado',
    schema: {
      example: {
        message: 'Código inválido ou expirado',
        error: 'Unauthorized',
        statusCode: 401
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Usuário não encontrado',
    schema: {
      example: {
        message: 'Usuário não encontrado',
        error: 'Not Found',
        statusCode: 404
      }
    }
  })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto);
  }

  // ========================================
  // REFRESH TOKEN
  // ========================================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Renovar access token',
    description: 'Gera novo access token usando refresh token'
  })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso'
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Refresh token inválido ou expirado'
  })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  // ========================================
  // ROTAS PROTEGIDAS
  // ========================================

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Obter perfil do usuário autenticado',
    description: 'Retorna dados do usuário logado (requer token JWT)'
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário',
    schema: {
      example: {
        id: 'uuid-do-usuario',
        name: 'João Silva',
        email: 'joao@email.com',
        cpf: '12345678900',
        phone: '11999999999',
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: '2024-01-30T12:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token inválido ou não fornecido' 
  })
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.sub);
  }

  // ========================================
  // 🧪 ROTA DE TESTE (REMOVER EM PRODUÇÃO!)
  // ========================================

  @Post('test-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🧪 Testar envio de email (DEV ONLY)',
    description: '⚠️ REMOVER EM PRODUÇÃO! Envia email de teste.'
  })
  @ApiResponse({
    status: 200,
    description: 'Email de teste enviado',
    schema: {
      example: {
        message: 'Email de teste enviado para joao@email.com',
        provider: 'Resend'
      }
    }
  })
  async testEmail(@Query('email') email: string) {
    await this.mailService.testEmail(email);
    return { 
      message: `Email de teste enviado para ${email}`,
      provider: 'Resend'
    };
  }
}
