import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaginationHotelDto } from './dto/pagination-hotel.dto';
import { Hotel } from './entities/hotel.entity';
import { firstValueFrom } from 'rxjs';
import { PaginationModel } from 'src/util/pagination.model';
import { CircuitBreaker } from 'src/util/circuit-breaker';

@Injectable()
export class HotelService {

    private readonly baseUrl: string;

    private readonly cb = new CircuitBreaker();

    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {
        this.baseUrl = config.getOrThrow<string>('RESERVATION_URL');
    }

    async findAll(data: PaginationHotelDto) {
        const res = await this.cb.fire(() => firstValueFrom(
            this.httpService.get<PaginationModel<Hotel>>(`${this.baseUrl}/hotels`, { params: {
                page: data.page - 1,
                size: data.size,
            } })
        ));
        return res.data;
    }
 
    async findOne(hotelUid: string) {
        try {
            const res = await this.cb.fire(() => firstValueFrom(
                this.httpService.get<Hotel>(`${this.baseUrl}/hotels/${hotelUid}`)
            ));
            return res.data;
        } catch (err: any) {
            if (err.code === 'ECONNREFUSED' || err instanceof ServiceUnavailableException || !err.response) {
                throw new ServiceUnavailableException("Hotel Service unavailable");
            }
            throw err;
        }
    }
}
