import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // ✅ ADICIONAR
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { CategoriesModule } from '../categories-services/categories.module';
import { MailModule } from '../../mail/mail.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [
    ConfigModule, // ✅ ADICIONAR ESTA LINHA
    forwardRef(() => CategoriesModule),
    forwardRef(()=> AccountsModule),
    MailModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'segredo_temporario_dev'
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard],
  exports: [JwtAuthGuard]
})
export class AuthModule {}
