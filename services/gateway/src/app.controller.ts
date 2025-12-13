import { Controller, Get, Headers, HttpCode, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';
import { HttpService } from '@nestjs/axios';
import { ReservationService } from 'src/reservation/reservation.service';
import { LoyaltyService } from 'src/loyalty/loyalty.service';
import { PaymentService } from 'src/payment/payment.service';
import { Loyalty } from 'src/loyalty/entities/loyalty.entity';
import { callAndFallback } from 'src/util/call-and-fallback';

@Controller()
export class AppController {
    constructor(
        private readonly reservationService: ReservationService,
        private readonly loyaltyService: LoyaltyService,
        private readonly paymentService: PaymentService,
    ) { }


    @Version(VERSION_NEUTRAL)
    @Get('manage/health')
    @HttpCode(200)
    health() {

    }
    
    @Get('me')
    async getMe(@Headers('X-User-Name') username: string) {
        const reservations = await this.reservationService.findAll(username)
        
        const loyalty = await callAndFallback(
            () => this.loyaltyService.findOne(username),
            () => ({ username })
        );

        const payments = await callAndFallback(
            () => this.paymentService.findAll({
                uids: reservations.map(res => res.paymentUid),
            }),
            () => []
        );
        
        return {
            reservations: reservations.map(res => ({
                ...res,
                hotel: {
                    ...res.hotel,
                    fullAddress: `${res.hotel.country}, ${res.hotel.city}, ${res.hotel.address}`
                },
                startDate: res.startDate.slice(0, res.startDate.indexOf('T')),
                endDate: res.endDate.slice(0, res.endDate.indexOf('T')),
                payment: payments.find(p => p.paymentUid === res.paymentUid),
            })),
            loyalty,
        }
    }

}
