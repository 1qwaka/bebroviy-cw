import { Injectable, NotFoundException, Scope } from "@nestjs/common";
import { Loyalty } from "src/loyalty/entities/loyalty.entity";
import { LoyaltyService } from "src/loyalty/loyalty.service";
import { Payment } from "src/payment/entity/payment.entity";
import { PaymentService } from "src/payment/payment.service";
import { CreateReservationDto } from "src/reservation/dto/create-reservation.dto";
import { Hotel } from "src/reservation/entities/hotel.entity";
import { Reservation } from "src/reservation/entities/reservation.entity";
import { HotelService } from "src/reservation/hotel.service";
import { ReservationService } from "src/reservation/reservation.service";

export interface CreateReservationParams {
    username: string,
    dto: CreateReservationDto,
    hotel_?: Hotel,
    loyalty_?: Loyalty,
    payment_?: Payment,
    reservation_?: Reservation,
    newLoyalty_?: Loyalty,
}

@Injectable({ scope: Scope.TRANSIENT })
export class CreatereservationUsecase {

    hotel?: Hotel;

    loyalty?: Loyalty;

    payment?: Payment;

    reservation?: Reservation;

    newLoyalty?: Loyalty;

    constructor(
        private readonly reservationService: ReservationService,
        private readonly hotelService: HotelService,
        private readonly paymentService: PaymentService,
        private readonly loyaltyService: LoyaltyService,
    ) { }
    
    async execute({
        username,
        dto,
        hotel_,
        loyalty_,
        payment_,
        reservation_,
        newLoyalty_,
    }: CreateReservationParams) {
        this.hotel = hotel_ ?? await this.nullOnError(this.hotelService.findOne(dto.hotelUid));
        if (!this.hotel) {
            return false; 
        }
        
        this.loyalty = loyalty_ ?? await this.nullOnError(this.loyaltyService.findOne(username))
        if (!this.loyalty) {
            return false
        }

        const nights = this.countNights(dto.startDate, dto.endDate)
        const price = Math.floor(this.hotel.price * nights * (1 - this.loyalty.discount / 100) )

        this.payment = payment_ ?? await this.nullOnError(this.paymentService.create({ price }))
        if (!this.payment) {
            return false;
        }
        
        this.reservation = reservation_ ?? await this.nullOnError(this.reservationService.create({ 
            ...dto, 
            username,
            paymentUid: this.payment.paymentUid,
        }))
        if (!this.reservation) {
            return false;
        }
        
        this.newLoyalty = newLoyalty_ ?? await this.nullOnError(this.loyaltyService.update(
            username, 
            { reservationCountChange: 1 }
        ));
        if (!this.newLoyalty) {
            return false;
        }

        return true
    }

    public countNights(startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        const diffTime = endDay.getTime() - startDay.getTime();
        const nights = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        return nights;
    }

    private async nullOnError<T>(action: Promise<T> | (() => Promise<T>)) {
        try {
            return await (action instanceof Promise ? action : action());
        } catch {
            return undefined
        }
    }
}