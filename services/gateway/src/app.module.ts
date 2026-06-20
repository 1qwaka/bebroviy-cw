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
import { ClsModule } from 'nestjs-cls';
import { KafkaModule } from './kafka/kafka.module';
import { StatisticsModule } from './statistics/statistics.module';

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
        KafkaModule,
        StatisticsModule,
        AuthModule,
        ReservationModule,
        PaymentModule,
        LoyaltyModule,
        ClsModule.forRoot({
            global: true,
            middleware: {
                mount: true,
                setup: (cls, req) => {
                    cls.set('authorization', req.headers.authorization);
                },
            },
        }),
    ],
    controllers: [AppController],
    providers: [
        AppService,
    ],
})
export class AppModule { }
