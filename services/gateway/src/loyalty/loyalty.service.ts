import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { firstValueFrom } from 'rxjs';
import { CreateLoyaltyDto } from 'src/loyalty/dto/create-loyalty.dto';
import { UpdateLoyaltyDto } from 'src/loyalty/dto/update-loyalty.dto';
import { Loyalty } from 'src/loyalty/entities/loyalty.entity';
import { CircuitBreaker } from 'src/util/circuit-breaker';
import { CircuitBreakerProvider } from 'src/util/curcuit-breaker-provider';

@Injectable()
export class LoyaltyService {

    private readonly logger = new Logger(LoyaltyService.name)

    private readonly baseUrl: string;

    private readonly cb = new CircuitBreaker();

    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {
        this.baseUrl = this.config.getOrThrow<string>('LOYALTY_URL');
     
    }

    async create(data: CreateLoyaltyDto) {
        const res = await firstValueFrom(this.httpService.post<Loyalty>(
            `${this.baseUrl}/loyalties/`,
            data,
        ))
        return res.data;
    }

    async findOne(username: string) {
        try {
            const res = await this.cb.fire(() => firstValueFrom(this.httpService.get<Loyalty>(
                `${this.baseUrl}/loyalties/${username}`,
            )))
            return res.data;
        } catch (err: any) {
            if (err.code === 'ECONNREFUSED' || err instanceof ServiceUnavailableException || !err.response) {
                throw new ServiceUnavailableException("Hotel Service unavailable");
            }
            throw err;
        }
    }

    async update(username: string, data: UpdateLoyaltyDto) {
        try {
            const res = await firstValueFrom(this.httpService.patch<Loyalty>(
                `${this.baseUrl}/loyalties/${username}`,
                data,
            ))
            return res.data;
        } catch (err: any) {
            if (err.code === 'ECONNREFUSED' || err instanceof ServiceUnavailableException || !err.response) {
                throw new ServiceUnavailableException("Payment Service unavailable");
            }
            throw err;
        }
    }

}
