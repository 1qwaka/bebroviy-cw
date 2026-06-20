import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { PaymentModule } from 'src/payment/payment.module';
import { LoyaltyModule } from 'src/loyalty/loyalty.module';
import { CreatereservationUsecase } from './usecase/create-reservation';
import { BullModule } from '@nestjs/bull';
import { ReservationProcessor } from 'src/reservation/reservation.processor';
import { CancelReservationUsecase } from 'src/reservation/usecase/cancel-reservation';

@Module({
    imports: [
        PaymentModule, 
        LoyaltyModule,
        BullModule.registerQueue({
            name: 'retry-queue',
        }),
    ],
    controllers: [ReservationController, HotelController],
    providers: [
        ReservationService, 
        HotelService, 
        CreatereservationUsecase,
        CancelReservationUsecase,
        ReservationProcessor
    ],
    exports: [ReservationService, HotelService]
})
export class ReservationModule {}
