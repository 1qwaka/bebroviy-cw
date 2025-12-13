import { Body, Controller, Delete, Get, Headers, HttpCode, NotFoundException, Param, Post, Query, ServiceUnavailableException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { PaymentService } from 'src/payment/payment.service';
import { CreateReservationDto } from 'src/reservation/dto/create-reservation.dto';
import { HotelService } from 'src/reservation/hotel.service';
import { LoyaltyService } from 'src/loyalty/loyalty.service';
import { callAndFallback } from 'src/util/call-and-fallback';
import { type Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { Payment } from 'src/payment/entity/payment.entity';
import { RollbackScheduler } from 'src/util/rollback-scheduler';
import { type CreateReservationParams, CreatereservationUsecase } from 'src/reservation/usecase/create-reservation';

@Controller('reservations')
export class ReservationController {


    constructor(
        private readonly reservationService: ReservationService,
        private readonly hotelService: HotelService,
        private readonly paymentService: PaymentService,
        private readonly loyaltyService: LoyaltyService,
        @InjectQueue('retry-queue')
        private readonly retryQueue: Queue<CreateReservationParams>,
        private readonly createReservation: CreatereservationUsecase,
    ) { }

    @Get()
    async findAll(@Headers('X-User-Name') username: string) {
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
    async findOne(@Headers('X-User-Name') username: string, @Param('uid') reservationUid: string) {
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
    async delete(@Headers('X-User-Name') username: string, @Param('uid') reservationUid: string) {
        const rollbacker = new RollbackScheduler<Promise<unknown>>();

        try {
            const reservation = await rollbacker.execute(
                () => this.reservationService.cancel(username, reservationUid),
                () => this.reservationService.cancelCancelling(username, reservationUid),
            );
    
            const payment = await rollbacker.execute(
                () => this.paymentService.cancel(reservation.paymentUid),
                () => this.paymentService.cancelCancelling(reservation.paymentUid)
            );
    
            const loyalty = await rollbacker.execute(
                () => this.loyaltyService.update(username, { reservationCountChange: -1 }),
                () => this.loyaltyService.update(username, { reservationCountChange: 1 }),
            );
    
            return reservation
        } catch {
            await Promise.all(rollbacker.rollbackSafe());
            throw new ServiceUnavailableException();
        }

    }

    
    @Post()
    @HttpCode(200)
    async create(@Headers('X-User-Name') username: string, @Body() dto: CreateReservationDto) {
        console.log('Get create reservaton request')
        const success = await this.createReservation.execute({ username, dto })
        if (!success) {
            console.log(`Failed create reservation with username: ${username}; dto: ${dto}`)

            await this.retryQueue.add('retry-create-reservation', {
                username, 
                dto,
                hotel_: this.createReservation.hotel,
                loyalty_: this.createReservation.loyalty,
                payment_: this.createReservation.payment,
                reservation_: this.createReservation.reservation,
                newLoyalty_: this.createReservation.newLoyalty,
            }, {
                attempts: 5,
                backoff: 3000,
                removeOnComplete: true
            });
        }
        
        return {
            ...this.createReservation.reservation,
            payment: this.createReservation.payment,
            hotelUid: this.createReservation.reservation?.hotel.hotelUid,
            discount: this.createReservation.loyalty?.discount,
        }
    }


}
