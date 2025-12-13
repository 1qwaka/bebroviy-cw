import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ReservationModule } from './reservation/reservation.module';
import { PaymentModule } from './payment/payment.module';
import { LoyaltyModule } from './loyalty/loyalty.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        HttpModule.register({ global: true }),
        ReservationModule,
        PaymentModule,
        LoyaltyModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
