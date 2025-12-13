import { Body, Controller, Delete, Get, Headers, HttpCode, NotFoundException, Param, Post, Query } from '@nestjs/common';
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

@Controller('reservations')
export class ReservationController {


    constructor(
        private readonly reservationService: ReservationService,
        private readonly hotelService: HotelService,
        private readonly paymentService: PaymentService,
        private readonly loyaltyService: LoyaltyService,
    ) { }

    @Get()
    async findAll(@Headers('X-User-Name') username: string) {
        const reservations = await this.reservationService.findAll(username)
        const payments = await callAndFallback(
            () => this.paymentService.findAll({
                uids: reservations.map(res => res.paymentUid),
            }),
            () => []
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
        const reservation = await this.reservationService.cancel(username, reservationUid);
        const payment = await this.paymentService.cancel(reservation.paymentUid);
        const loyalty = await this.loyaltyService.update(username, { reservationCountChange: -1 });
        return reservation
    }

    
    @Post()
    @HttpCode(200)
    async create(@Headers('X-User-Name') username: string, @Body() dto: CreateReservationDto) {
        const hotel = await this.hotelService.findOne(dto.hotelUid);
        if (!hotel) {
            throw new NotFoundException(); 
        }
        
        const loyalty = await this.loyaltyService.findOne(username)
        if (!loyalty) {
            throw new NotFoundException(); 
        }

        const nights = this.countNights(dto.startDate, dto.endDate)
        const price = Math.floor(hotel.price * nights * (1 - loyalty.discount / 100) )

        const payment = await this.paymentService.create({ price })
     
        const reservation = await this.reservationService.create({ 
            ...dto, 
            username,
            paymentUid: payment.paymentUid,
        })
        
        const newLoyalty = await this.loyaltyService.update(username, { reservationCountChange: 1 });
        
        return {
            ...reservation,
            payment,
            hotelUid: reservation.hotel.hotelUid,
            discount: loyalty.discount,
        }
    }

    private countNights(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        const diffTime = endDay.getTime() - startDay.getTime();
        const nights = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        return nights;
    }
}
