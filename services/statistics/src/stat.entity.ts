import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum StatEventType {
    RESERVATION_CREATED = 'RESERVATION_CREATED',
    RESERVATION_CANCELED = 'RESERVATION_CANCELED',
    USER_ACTION = 'USER_ACTION',
}

@Entity()
export class StatRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'enum', enum: StatEventType })
    eventType: StatEventType;

    @Column({ nullable: true })
    hotelUid: string;

    @Column({ type: 'int', default: 0, nullable: true })
    price: number;

    @Column({ nullable: true })
    loyaltyStatus: string;

    @Column({ nullable: true })
    actionName: string;

    @Column({ nullable: true })
    username: string;

    @CreateDateColumn()
    createdAt: Date;
}