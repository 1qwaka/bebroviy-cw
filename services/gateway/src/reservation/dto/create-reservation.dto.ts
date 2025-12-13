import {
    IsDateString,
    IsUUID,
} from 'class-validator';

export class CreateReservationDto {
    @IsUUID(4)
    hotelUid: string;

    @IsDateString()
    startDate: string;

    @IsDateString()
    endDate: string;
}
