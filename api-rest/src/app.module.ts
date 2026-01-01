import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { CategoriesModule } from './modules/categories-services/categories.module';
import { PrismaModule } from './database/prisma.module';
import { AccountsModule } from './modules/accounts/accounts.module';
@Module({
  imports: [PrismaModule, UsersModule, AuthModule, TransactionsModule, CategoriesModule, AccountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}