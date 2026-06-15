import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReservationModule } from './reservation/reservation.module';
import { PaymentModule } from './payment/payment.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { BullModule } from '@nestjs/bull';
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        HttpModule.register({ global: true }),
        BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                redis: {
                    host: config.getOrThrow('REDIS_HOST'),
                    port: config.getOrThrow('REDIS_PORT'),
                },
            })
        }),
        AuthModule,
        ReservationModule,
        PaymentModule,
        LoyaltyModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
    ],
})
export class AppModule {}
