import { Injectable, Scope } from "@nestjs/common";
import { Loyalty } from "src/loyalty/entities/loyalty.entity";
import { LoyaltyService } from "src/loyalty/loyalty.service";
import { Payment } from "src/payment/entity/payment.entity";
import { PaymentService } from "src/payment/payment.service";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { ReservationService } from "src/reservation/reservation.service";
import { KafkaService } from 'src/kafka/kafka.service';

export interface CancelReservationParams {
    username: string;
    reservationUid: string;
    cancelledReservation?: Reservation
    cancelledPayment?: Payment
    updatedLoyalty?: Loyalty
}

@Injectable({ scope: Scope.TRANSIENT })
export class CancelReservationUsecase {

    cancelledReservation?: Reservation

    cancelledPayment?: Payment

    updatedLoyalty?: Loyalty

    constructor(
        private readonly reservationService: ReservationService,
        private readonly paymentService: PaymentService,
        private readonly loyaltyService: LoyaltyService,
        private readonly kafkaService: KafkaService,
    ) { }
    

    async execute({
        username,
        reservationUid, 
        cancelledReservation,
        cancelledPayment,
        updatedLoyalty,
    }: CancelReservationParams) {
        this.cancelledReservation = cancelledReservation 
                                    ?? await this.reservationService.cancel(username, reservationUid)
        this.cancelledPayment = cancelledPayment
                                ?? await this.paymentService.cancel(this.cancelledReservation.paymentUid);
        this.updatedLoyalty = updatedLoyalty
                                ?? await this.loyaltyService.update(username, { reservationCountChange: -1 })

        this.kafkaService.emitEvent('RESERVATION_CANCELED', {
            hotelUid: this.cancelledReservation.hotel.hotelUid,
            price: this.cancelledPayment.price,
            loyaltyStatus: this.updatedLoyalty.status,
            username: username,
        });
    }

}
