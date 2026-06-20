import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum StatEventType {
    RESERVATION_CREATED = 'RESERVATION_CREATED',
    RESERVATION_CANCELED = 'RESERVATION_CANCELED',
}

@Entity()
export class StatRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: StatEventType })
    eventType: StatEventType;

    @Column()
    hotelUid: string;

    @Column({ type: 'int', default: 0 })
    price: number;

    @Column()
    loyaltyStatus: string;

    @CreateDateColumn()
    createdAt: Date;
}