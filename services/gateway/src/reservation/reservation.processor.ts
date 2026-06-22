import { Process, Processor } from "@nestjs/bull";
import { Logger, ServiceUnavailableException } from "@nestjs/common";
import axios from "axios";
import { type Job } from "bull";
import { ClsService } from "nestjs-cls";
import { CancelReservationParams, CancelReservationPartialError, CancelReservationUsecase } from "src/reservation/usecase/cancel-reservation";

@Processor('retry-queue')
export class ReservationProcessor {

    private readonly logger = new Logger(ReservationProcessor.name)

    constructor(
        private readonly cancelReservation: CancelReservationUsecase,
        private readonly cls: ClsService,

    ) { }

    @Process('retry-cancel-reservation')
    async cancel(job: Job<CancelReservationParams>) {
        this.logger.log(`Processing job ${job.id} [cancel reservation] (attempt ${job.attemptsMade})`
            + ` with username: ${job.data.username}; data: ${JSON.stringify(job.data)}`)

        await this.cls.run(async () => {
            this.cls.set('authorization', job.data.token);
        
            try {
                await this.cancelReservation.execute(job.data);
                this.logger.log(`Job ${job.id} [cancel reservation] succeed (attempt ${job.attemptsMade})`)
            } catch (err: unknown) {
                let info = ''

                if (axios.isAxiosError(err)) {
                    info += `${err.status} ${err.cause} ${err.code} ${err.message}`
                } else {
                    info += String(err)
                }

                this.logger.log(`Job ${job.id} [cancel reservation] failed (attempt ${job.attemptsMade}) ${info}`)

                if (err instanceof CancelReservationPartialError) {
                    await job.update({
                        ...job.data,
                        ...err.partial,
                    });
                }

                throw err;
            }
        });
    }

}