import { Hotel } from './hotel.entity';

export enum PaymentStatus {
    PAID = 'PAID',
    CANCELED = 'CANCELED',
}

export class Reservation {
    id: number;
    reservationUid: string;
    username: string;
    paymentUid: string;
    hotel: Hotel
    hotelId: number;
    status: PaymentStatus;
    startDate: string;
    endDate: string;
}
