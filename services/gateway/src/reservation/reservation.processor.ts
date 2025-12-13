import { Process, Processor } from "@nestjs/bull";
import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { type Job } from "bull";
import { LoyaltyService } from "src/loyalty/loyalty.service";
import { PaymentService } from "src/payment/payment.service";
import { HotelService } from "src/reservation/hotel.service";
import { ReservationService } from "src/reservation/reservation.service";
import { CreateReservationParams, CreatereservationUsecase } from "src/reservation/usecase/create-reservation";


@Processor('retry-queue')
export class ReservationProcessor {

    constructor(
        private readonly createReservation: CreatereservationUsecase,
    ) { }

    @Process('retry-create-reservation')
    async process(job: Job<CreateReservationParams>) {
        console.log(`Processing job ${job.id} (attempt ${job.attemptsMade})`
                    + ` with username: ${job.data.username}; dto: ${JSON.stringify(job.data.dto)}`)
        const success = await this.createReservation.execute(job.data)
        if (!success) {
            await job.update({
                ...job.data,
                hotel_: this.createReservation.hotel ?? job.data.hotel_,
                loyalty_: this.createReservation.loyalty ?? job.data.loyalty_,
                payment_: this.createReservation.payment ?? job.data.payment_,
                reservation_: this.createReservation.reservation ?? job.data.reservation_,
                newLoyalty_: this.createReservation.newLoyalty ?? job.data.newLoyalty_,
            })
            throw new ServiceUnavailableException();
        }
    }

}