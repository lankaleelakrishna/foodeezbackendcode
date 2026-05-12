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
import { DeliveryPartnersModule } from './modules/delivery-partners/delivery-partners.module';
import { DeliveryAssignmentsModule } from './modules/delivery-assignments/delivery-assignments.module';
import { DeliveryTrackingModule } from './modules/delivery-tracking/delivery-tracking.module';
import { DeliveryAnalyticsModule } from './modules/delivery-analytics/delivery-analytics.module';
import { DeliveryPayoutsModule } from './modules/delivery-payouts/delivery-payouts.module';
import { DeliverySupportModule } from './modules/delivery-support/delivery-support.module';
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
    DeliveryPartnersModule,
    DeliveryAssignmentsModule,
    DeliveryTrackingModule,
    DeliveryAnalyticsModule,
    DeliveryPayoutsModule,
    DeliverySupportModule,
  ],
})
export class AppModule {}
