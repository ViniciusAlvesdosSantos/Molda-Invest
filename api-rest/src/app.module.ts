import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories-services/categories.module';
import { PrismaModule } from './database/prisma.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { MailModule } from './mail/mail.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ GARANTIR QUE ESTÁ TRUE
      envFilePath: '.env',
      cache: true,
    }),
    PrismaModule,
    MailModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    AccountsModule,
    TransactionsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}