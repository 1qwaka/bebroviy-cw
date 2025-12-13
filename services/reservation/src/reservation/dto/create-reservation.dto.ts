import {
    IsDateString,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateReservationDto {
    @IsString()
    @MinLength(1)
    @MaxLength(80)
    username: string;

    @IsUUID(4)
    hotelUid: string;

    @IsUUID(4)
    paymentUid: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}
