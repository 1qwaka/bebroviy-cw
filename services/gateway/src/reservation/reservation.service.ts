import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Reservation } from './entities/reservation.entity';
import { PaginationModel } from 'src/util/pagination.model';
import { CreateReservationDto } from 'src/reservation/dto/create-reservation.dto';
import { CreateReservationInternalDto } from 'src/reservation/dto/create-reservation-internal.dto';
import { CircuitBreaker } from 'src/util/circuit-breaker';
import { ClsService } from 'nestjs-cls';
import { defaultExceptionWrapper } from 'src/util/default-exception-wrapper';

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
        try {
            const reservation = await firstValueFrom(this.httpService.post<Reservation>(
                `${this.baseUrl}/reservations`,
                data
            ));

            return reservation.data;
        } catch (err: any) {
            if (err.code === 'ECONNREFUSED' || err instanceof ServiceUnavailableException || !err.response) {
                throw new ServiceUnavailableException("Reservation Service unavailable");
            }
            throw err;
        }

    }

    async findAll(username: string) {
        return defaultExceptionWrapper(async () => {
            const reservations = await this.cb.fire(() => firstValueFrom(this.httpService.get<Reservation[]>(
                `${this.baseUrl}/reservations`,
                { params: { username } }
            )));

            return reservations.data;
        }, { message: 'Reservation Service unavailable' });

    }

    async findOne(username: string, reservationUid: string) {
        return defaultExceptionWrapper(async () => {
            const reservation = await this.cb.fire(() => firstValueFrom(this.httpService.get<Reservation>(
                `${this.baseUrl}/reservations/${reservationUid}`,
                { params: { username } },
            )));

            return reservation.data;
        }, { message: 'Reservation Service unavailable' });
    }

    async cancel(username: string, reservationUid: string) {
        return defaultExceptionWrapper(async () => {
            const reservation = await firstValueFrom(this.httpService.delete<Reservation>(
                `${this.baseUrl}/reservations/${reservationUid}/cancel`,
                { params: { username } },
            ));
            return reservation.data
        }, { message: 'Reservation Service unavailable' });
    }

    async cancelCancelling(username: string, reservationUid: string) {
        return defaultExceptionWrapper(async () => {
        const reservation = await firstValueFrom(this.httpService.delete<Reservation>(
            `${this.baseUrl}/reservations/${reservationUid}/cancel-cancelling`,
            { params: { username } },
        ));
        return reservation.data
        }, { message: 'Reservation Service unavailable' });
        
    }
}
