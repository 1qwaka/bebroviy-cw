import { Process, Processor } from "@nestjs/bull";
import { ServiceUnavailableException } from "@nestjs/common";
import { type Job } from "bull";
import { CancelReservationParams, CancelReservationUsecase } from "src/reservation/usecase/cancel-reservation";
import { CreateReservationParams, CreatereservationUsecase } from "src/reservation/usecase/create-reservation";


@Processor('retry-queue')
export class ReservationProcessor {

    constructor(
        // private readonly createReservation: CreatereservationUsecase,
        private readonly cancelReservation: CancelReservationUsecase,
    ) { }

    // @Process('retry-create-reservation')
    // async process(job: Job<CreateReservationParams>) {
    //     console.log(`Processing job ${job.id} (attempt ${job.attemptsMade})`
    //                 + ` with username: ${job.data.username}; dto: ${JSON.stringify(job.data.dto)}`)
    //     const success = await this.createReservation.execute(job.data)
    //     if (!success) {
    //         await job.update({
    //             ...job.data,
    //             hotel_: this.createReservation.hotel ?? job.data.hotel_,
    //             loyalty_: this.createReservation.loyalty ?? job.data.loyalty_,
    //             payment_: this.createReservation.payment ?? job.data.payment_,
    //             reservation_: this.createReservation.reservation ?? job.data.reservation_,
    //             newLoyalty_: this.createReservation.newLoyalty ?? job.data.newLoyalty_,
    //         })
    //         throw new ServiceUnavailableException();
    //     }
    // }

    @Process('retry-cancel-reservation')
    async cancel(job: Job<CancelReservationParams>) {
        console.log(`Processing job  ${job.id} [cancel reservation] (attempt ${job.attemptsMade})`
                    + ` with username: ${job.data.username}; data: ${JSON.stringify(job.data)}`)
        try {
            await this.cancelReservation.execute(job.data);
            console.log(`Job ${job.id} [cancel reservation] succeed (attempt ${job.attemptsMade})`)
        } catch {
            console.log(`Job ${job.id} [cancel reservation] failed (attempt ${job.attemptsMade})`)
            job.update({
                ...job.data,
                cancelledReservation: this.cancelReservation.cancelledReservation,
                cancelledPayment: this.cancelReservation.cancelledPayment,
                updatedLoyalty: this.cancelReservation.updatedLoyalty,
            })
            throw new ServiceUnavailableException();
        }
    }

}