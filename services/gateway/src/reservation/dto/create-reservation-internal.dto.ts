import {
    IsDateString,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateReservationInternalDto {
    @IsUUID(4)
    hotelUid: string;

    @IsString()
    username: string;

    @IsUUID(4)
    paymentUid: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}
