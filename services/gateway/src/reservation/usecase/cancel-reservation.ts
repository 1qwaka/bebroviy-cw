import { Injectable, Logger, Scope } from "@nestjs/common";
import { Loyalty } from "src/loyalty/entities/loyalty.entity";
import { LoyaltyService } from "src/loyalty/loyalty.service";
import { Payment } from "src/payment/entity/payment.entity";
import { PaymentService } from "src/payment/payment.service";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { ReservationService } from "src/reservation/reservation.service";
import { KafkaService } from 'src/kafka/kafka.service';
import axios from "axios";
import { HttpService } from "@nestjs/axios";
import { ClsService } from "nestjs-cls";

export interface CancelReservationParams {
    username: string;
    reservationUid: string;
    cancelledReservation?: Reservation
    cancelledPayment?: Payment
    updatedLoyalty?: Loyalty
    token?: string;
}

export interface CancelReservationResult {
    cancelledReservation?: Reservation;
    cancelledPayment?: Payment;
    updatedLoyalty?: Loyalty;
}

export class CancelReservationPartialError extends Error {
    constructor(
        public readonly partial: Partial<CancelReservationResult>,
        cause: unknown
    ) {
        super('Partial cancel failure');
        this.cause = cause;
    }
}

@Injectable({ scope: Scope.TRANSIENT })
export class CancelReservationUsecase {

    private readonly logger = new Logger(CancelReservationUsecase.name)

    constructor(
        private readonly reservationService: ReservationService,
        private readonly paymentService: PaymentService,
        private readonly loyaltyService: LoyaltyService,
        private readonly kafkaService: KafkaService,
        
    ) { }
    
    async execute(params: CancelReservationParams): Promise<CancelReservationResult> {
       const partial: Partial<CancelReservationResult> = {};

        try {
            partial.cancelledReservation = params.cancelledReservation 
                ?? await this.reservationService.cancel(params.username, params.reservationUid);

            partial.cancelledPayment = params.cancelledPayment
                ?? await this.paymentService.cancel(partial.cancelledReservation.paymentUid);

            partial.updatedLoyalty = params.updatedLoyalty
                ?? await this.loyaltyService.update(params.username, { reservationCountChange: -1 });

            this.kafkaService.emitEvent('RESERVATION_CANCELED', {
                hotelUid: partial.cancelledReservation.hotel.hotelUid,
                price: partial.cancelledPayment.price,
                loyaltyStatus: partial.updatedLoyalty.status,
                username: params.username,
            });
            
            return partial as CancelReservationResult;
        } catch (err) {
             let info = ''
            
            if (axios.isAxiosError(err)) {
                info += `${err.status} ${err.cause} ${err.code} ${err.message} ${err.request?.headers}`
            } else {
                info += String(err)
            }

            this.logger.log(`Usecase failed: ${info}`)

            throw new CancelReservationPartialError(partial, err);
        }

    }

}
