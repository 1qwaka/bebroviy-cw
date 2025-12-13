import { Hotel } from '../../hotel/entities/hotel.entity';
import { Column, Entity, Generated, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum PaymentStatus {
    PAID = 'PAID',
    CANCELED = 'CANCELED',
}

@Entity()
export class Reservation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    @Generated('uuid')
    reservationUid: string;

    @Column({ 
      type: 'varchar', 
      length: 80 
    })
    username: string;

    @Column()
    @Generated('uuid')
    paymentUid: string;

    @ManyToOne(() => Hotel)
    @JoinColumn({ name: 'hotelId' })
    hotel: Hotel

    @Column()
    hotelId: number;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
    })
    status: PaymentStatus;

    @Column({ type: 'timestamptz' })
    startDate: Date;

    @Column({ type: 'timestamptz' })
    endDate: Date;
}
