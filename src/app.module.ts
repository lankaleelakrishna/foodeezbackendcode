import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { BranchesModule } from './modules/branches/branches.module';
import { MenusModule } from './modules/menus/menus.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PaymentAnalysisModule } from './modules/payment-analysis/payment-analysis.module';
import { typeOrmConfig } from './config/typeorm.config';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({ useFactory: typeOrmConfig }),
    PrismaModule,
    AuthModule,
    RestaurantsModule,
    BranchesModule,
    MenusModule,
    DocumentsModule,
    DashboardModule,
    PaymentAnalysisModule,
  ],
})
export class AppModule {}
