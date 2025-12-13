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

export class Loyalty {
    id: number;
    username: string;
    reservationCount: number;
    status: LoyaltyStatus;
    discount: number;
}
