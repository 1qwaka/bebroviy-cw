import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Reservation } from './entities/reservation.entity';
import { PaginationModel } from 'src/util/pagination.model';
import { CreateReservationDto } from 'src/reservation/dto/create-reservation.dto';
import { CreateReservationInternalDto } from 'src/reservation/dto/create-reservation-internal.dto';
import { CircuitBreaker } from 'src/util/circuit-breaker';

@Injectable()
export class ReservationService {

    private readonly baseUrl: string;

    private readonly cb = new CircuitBreaker();

    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {
        this.baseUrl = config.getOrThrow<string>('RESERVATION_URL');
    }

    async create(data: CreateReservationInternalDto) {
        const reservation = await firstValueFrom(this.httpService.post<Reservation>(
            `${this.baseUrl}/reservations`, 
            data
        ));

        return reservation.data;
    }

    async findAll(username: string) {
        const reservations = await this.cb.fire(() => firstValueFrom(this.httpService.get<Reservation[]>(
            `${this.baseUrl}/reservations`, 
            { params: { username } }
        )));

        return reservations.data;
    }

    async findOne(username: string, reservationUid: string) {
        const reservation = await this.cb.fire(() => firstValueFrom(this.httpService.get<Reservation>(
            `${this.baseUrl}/reservations/${reservationUid}`, 
            { params: { username } },
        )));

        return reservation.data;
    }

    async cancel(username: string, reservationUid: string) {
        const reservation = await firstValueFrom(this.httpService.delete<Reservation>(
            `${this.baseUrl}/reservations/${reservationUid}/cancel`, 
            { params: { username } },
        ));
        return reservation.data
    }
}
