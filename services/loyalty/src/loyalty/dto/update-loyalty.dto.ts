import { IsInt } from "class-validator";

export class UpdateLoyaltyDto {
    @IsInt()
    reservationCountChange: number;
}
