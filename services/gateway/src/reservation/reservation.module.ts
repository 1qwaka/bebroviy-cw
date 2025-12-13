import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { PaymentModule } from 'src/payment/payment.module';
import { LoyaltyModule } from 'src/loyalty/loyalty.module';

@Module({
    imports: [PaymentModule, LoyaltyModule],
    controllers: [ReservationController, HotelController],
    providers: [ReservationService, HotelService],
    exports: [ReservationService]
})
export class ReservationModule {}
