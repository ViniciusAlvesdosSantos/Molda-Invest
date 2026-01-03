import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ========================================
  // CADASTRO
  // ========================================

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    // Validar email único
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException(
        'O EMAIL informado já possui uma conta vinculada',
      );
    }

    // Validar CPF único
    const existingCpf = await this.prisma.user.findUnique({
      where: { cpf: registerDto.cpf },
    });
    if (existingCpf) {
      throw new ConflictException(
        'O CPF informado já possui uma conta vinculada',
      );
    }

    // Validar telefone único
    const existingPhoneNumber = await this.prisma.user.findUnique({
      where: { phone: registerDto.phone },
    });
    if (existingPhoneNumber) {
      throw new ConflictException(
        'Número de telefone informado já possui uma conta vinculada',
      );
    }

    // Criar usuário
    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        cpf: registerDto.cpf,
        phone: registerDto.phone,
        status: UserStatus.PENDING,
        isEmailVerified: false,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // Gerar token de verificação
    const tokenVerification = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'email-verification',
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    // Enviar email
    const frontEndUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const verificationUrl = `${frontEndUrl}/auth/verify-email?token=${tokenVerification}`;

    await this.mailService.sendVerificationEmail(user.email, verificationUrl);

    return {
      message: 'Cadastro realizado! Verifique seu email para ativar sua conta.',
    };
  }

  // ========================================
  // VERIFICAÇÃO DE EMAIL
  // ========================================

  async verifyEmail(
    token: string
  ): Promise<{ message: string }> {
    let userId: number;
    let email: string;

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'email-verification') {
        throw new Error('Tipo de token inválido');
      }

      userId = payload.sub;
      email = payload.email;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email já verificado');
    }

    if (user.email !== email) {
      throw new UnauthorizedException('Token inválido');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        status: UserStatus.ACTIVE,
      },
    });

    return {
      message: 'Email verificado com sucesso! Agora você pode fazer login.',
    };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email já verificado');
    }

    const verificationToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'email-verification',
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: '24h',
      },
    );

    const frontendUrl = this.configService.get(
      'FRONTEND_URL',
      'http://localhost:3000',
    );
    const verificationUrl = `${frontendUrl}/auth/verify-email?token=${verificationToken}`;

    await this.mailService.sendVerificationEmail(user.email, verificationUrl);

    return {
      message: 'Novo link de verificação enviado para seu email',
    };
  }

  // ========================================
  // LOGIN COM OTP
  // ========================================

  async requestLogin(
    requestLoginDto: LoginDto,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: requestLoginDto.identifier },
          { cpf: requestLoginDto.identifier },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('Email ou CPF não encontrado');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email não verificado');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Usuário bloqueado');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: otp,
        otpExpiresAt: expiresAt,
      },
    });

    await this.mailService.sendLoginOtp(user.email, otp);

    return { message: 'Código enviado para o e-mail' };
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: verifyOtpDto.identifier },
          { cpf: verifyOtpDto.identifier },
        ],
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      throw new UnauthorizedException('Nenhum código foi solicitado');
    }

    if (user.otpCode !== verifyOtpDto.otpCode) {
      throw new UnauthorizedException('Código inválido');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new UnauthorizedException('Código expirado');
    }

    // ✅ CORREÇÃO 1 e 2: undefined → null
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,        // ✅ CORRETO (não undefined)
        otpExpiresAt: undefined,   // ✅ CORRETO (não undefined)
      },
    });

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access',
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION', '1h'),
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'refresh',
      },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION', '7d'),
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
      tokenType: 'Bearer',  // ✅ CORREÇÃO 3: typeToken → tokenType
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // ========================================
  // REFRESH TOKEN
  // ========================================

  async refreshToken(refreshToken: string) {
    let userId: number;
    let email: string;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        throw new Error('Token inválido');
      }

      userId = payload.sub;
      email = payload.email;
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Usuário bloqueado');
    }

    const newAccessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access',
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION', '1h'),
      },
    );

    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken, // Mantém o mesmo refresh token
      expiresIn: 3600,
      tokenType: 'Bearer',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }

  // ========================================
  // VALIDAR USUÁRIO
  // ========================================

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        status: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Usuário bloqueado');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email não verificado');
    }

    return user;
  }
}
