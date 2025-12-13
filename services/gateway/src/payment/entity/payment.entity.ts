export enum PaymentStatus {
    PAID = 'PAID',
    CANCELED = 'CANCELED',
}

export class Payment {
    id: number;
    paymentUid: string;
    status: PaymentStatus;
    price: number;
}
