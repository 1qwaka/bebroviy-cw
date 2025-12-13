import { IsString } from 'class-validator';

export class CreateLoyaltyDto {
    @IsString()
    username: string;
}
