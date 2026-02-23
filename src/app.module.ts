import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MessagesModule } from './modules/messages/messages.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './infra/prisma/prisma.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    CategoriesModule,
    MessagesModule,
    AdminModule,
    LeadsModule,
    ClientsModule,
    ChatbotModule,
    TelegramModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
