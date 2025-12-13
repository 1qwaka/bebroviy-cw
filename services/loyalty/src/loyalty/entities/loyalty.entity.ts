import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum LoyaltyStatus {
    BRONZE = 'BRONZE',
    SILVER = 'SILVER',
    GOLD = 'GOLD',
}

export const LoyaltyStatusDiscount = {
    [LoyaltyStatus.BRONZE]: 5,
    [LoyaltyStatus.SILVER]: 7,
    [LoyaltyStatus.GOLD]: 10,
} as const;


@Entity()
export class Loyalty {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'varchar',
        length: 80,
        unique: true,
    })
    username: string;

    @Column({
        type: 'int',
        default: 0,
    })
    reservationCount: number;

    @Column({
        type: 'enum',
        enum: LoyaltyStatus,
    })
    status: LoyaltyStatus;

    @Column({ type: 'int' })
    discount: number;
}
