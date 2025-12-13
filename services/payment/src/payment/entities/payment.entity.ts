import { Column, Entity, Generated, PrimaryGeneratedColumn } from "typeorm";

export enum PaymentStatus {
    PAID = 'PAID',
    CANCELED = 'CANCELED',
}

@Entity()
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @Generated('uuid')
    paymentUid: string;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
    })
    status: PaymentStatus;

    @Column({ type: 'int' })
    price: number;
}
