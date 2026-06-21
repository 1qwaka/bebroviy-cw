import { Body, Controller, Delete, Get, Headers, HttpCode, HttpException, InternalServerErrorException, Logger, Param, Post, Request, ServiceUnavailableException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { PaymentService } from 'src/payment/payment.service';
import { CreateReservationDto } from 'src/reservation/dto/create-reservation.dto';
import { HotelService } from 'src/reservation/hotel.service';
import { LoyaltyService } from 'src/loyalty/loyalty.service';
import { callAndFallback } from 'src/util/call-and-fallback';
import { type Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Payment } from 'src/payment/entity/payment.entity';
import { RollbackScheduler } from 'src/util/rollback-scheduler';
import { CreatereservationUsecase } from 'src/reservation/usecase/create-reservation';
import { CancelReservationUsecase } from 'src/reservation/usecase/cancel-reservation';
import { KafkaService } from 'src/kafka/kafka.service';
import { ActionName } from '../util/action-name.decorator';

@Controller('reservations')
export class ReservationController {
    private readonly logger = new Logger(ReservationController.name);

    constructor(
        private readonly reservationService: ReservationService,
        private readonly hotelService: HotelService,
        private readonly paymentService: PaymentService,
        private readonly loyaltyService: LoyaltyService,
        @InjectQueue('retry-queue')
        private readonly retryQueue: Queue,
        private readonly createReservation: CreatereservationUsecase,
        private readonly cancelReservation: CancelReservationUsecase,
        private readonly kafkaService: KafkaService,
    ) { }

    @Get()
    @ActionName('просмотр своих бронирований')
    async findAll(@Request() req: any) {
        const username = req.user.username;
        const reservations = await this.reservationService.findAll(username)
        const payments = await callAndFallback(
            () => this.paymentService.findAll({
                uids: reservations.map(res => res.paymentUid),
            }),
            () => [] as Payment[]
        )
        return reservations.map(res => ({ 
             ...res,
            hotel: {
                ...res.hotel,
                fullAddress: `${res.hotel.country}, ${res.hotel.city}, ${res.hotel.address}`
            },
            startDate: res.startDate.slice(0, res.startDate.indexOf('T')),
            endDate: res.endDate.slice(0, res.endDate.indexOf('T')),
            payment: payments.find(p => p.paymentUid === res.paymentUid),
        }));
    }

    @Get(':uid')
    @ActionName('детальный просмотр бронирования')
    async findOne(@Request() req: any, @Param('uid') reservationUid: string) {
        const username = req.user.username;
        const reservation = await this.reservationService.findOne(username, reservationUid)
        const payment = await callAndFallback(
            () => this.paymentService.findOne(reservation.paymentUid),
            () => ({ paymentUid: reservation.paymentUid })
        );
        return {
            ...reservation,
            payment,
            hotel: {
                ...reservation.hotel,
                fullAddress: `${reservation.hotel.country}, ${reservation.hotel.city}, ${reservation.hotel.address}`
            },
            startDate: reservation.startDate.slice(0, reservation.startDate.indexOf('T')),
            endDate: reservation.endDate.slice(0, reservation.endDate.indexOf('T'))
        }
    }

    @Delete(':uid')
    @HttpCode(204)
    @ActionName('отмена бронирования')
    async delete(@Request() req: any, @Param('uid') reservationUid: string) {
        const username = req.user.username;
        // try {
            await this.cancelReservation.execute({ username, reservationUid });
            this.logger.log('Successfully Deleted Reservation')
            return this.cancelReservation.cancelledReservation;
        // } catch (err: unknown) {
        //     this.logger.error('Error Delete Reservation: ' + err)
        //     await this.retryQueue.add('retry-cancel-reservation', {
        //         username, 
        //         reservationUid,
        //         cancelledReservation: this.cancelReservation.cancelledReservation,
        //         cancelledPayment: this.cancelReservation.cancelledPayment,
        //         updatedLoyalty: this.cancelReservation.updatedLoyalty,
        //     }, {
        //         attempts: 5,
        //         backoff: 3000,
        //         removeOnComplete: true
        //     });

        //     return { username, reservationUid };
        // }
    }
    
    @Post()
    @HttpCode(200)
    @ActionName('создание нового бронирования')
    async create(@Request() req: any, @Body() dto: CreateReservationDto) {
        const username = req.user.username as string;
        const rollbacker = new RollbackScheduler<Promise<unknown>>();

        try {
            const hotel = await this.hotelService.findOne(dto.hotelUid);
            const loyalty = await this.loyaltyService.findOne(username);

            const nights = this.createReservation.countNights(dto.startDate, dto.endDate)
            const price = Math.floor(hotel.price * nights * (1 - loyalty.discount / 100))
    
            const payment = await rollbacker.execute(
                () => this.paymentService.create({ price }),
                () => this.paymentService.cancel(payment.paymentUid)
            )

            const reservation = await rollbacker.execute(
                () => this.reservationService.create({ 
                    ...dto, 
                    username,
                    paymentUid: payment.paymentUid,
                }),
                () => this.reservationService.cancel(username, reservation.reservationUid),
            )

            const newLoyalty = await rollbacker.execute(
                () => this.loyaltyService.update(username, { reservationCountChange: 1 }),
                () => this.loyaltyService.update(username, { reservationCountChange: -1 }),
            )
            
            this.kafkaService.emitEvent('RESERVATION_CREATED', {
                hotelUid: hotel.hotelUid,
                price,
                loyaltyStatus: loyalty.status,
                username: username,
            });
            
            return {
                ...reservation,
                payment,
                hotelUid: reservation?.hotel.hotelUid,
                discount: loyalty?.discount,
            }
        } catch (err: unknown) {
            await Promise.all(rollbacker.rollbackSafe());
            if (err instanceof HttpException) throw err;
            throw new InternalServerErrorException("Internal error");
        }
    }
}