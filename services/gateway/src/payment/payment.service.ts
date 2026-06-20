import { HttpService } from '@nestjs/axios';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CreatePaymentDto } from 'src/payment/dto/create-payment.dto';
import { FindPaymentsBatchDto } from 'src/payment/dto/find-payments-batch.dto';
import { Payment } from 'src/payment/entity/payment.entity';
import { PaginationModel } from 'src/util/pagination.model';
import qs from 'qs'
import { CircuitBreaker } from 'src/util/circuit-breaker';

@Injectable()
export class PaymentService {
    
    private readonly baseUrl: string;

    private readonly cb = new CircuitBreaker();

    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {
        this.baseUrl = this.config.getOrThrow<string>('PAYMENT_URL')
    }

    async create(data: CreatePaymentDto) {
        try {
            const res = await firstValueFrom(this.httpService.post<Payment>(
                `${this.baseUrl}/payments`, 
                data,
            ));
            return res.data;
        } catch (err: any) {
            if (err.code === 'ECONNREFUSED' || err instanceof ServiceUnavailableException || !err.response) {
                throw new ServiceUnavailableException("Payment Service unavailable");
            }
            throw err;
        }
    }

    async findAll(data: FindPaymentsBatchDto) {
        const res = await this.cb.fire(() => firstValueFrom(this.httpService.get<Payment[]>(
            `${this.baseUrl}/payments`, 
            { 
                params: data,
                paramsSerializer: params => {
                    return qs.stringify(params, { arrayFormat: 'repeat' })
                }
            }
        )));
        return res.data;
    }

    async findOne(paymentUid: string) {
        const res = await this.cb.fire(() => firstValueFrom(this.httpService.get<Payment>(
            `${this.baseUrl}/payments/${paymentUid}`, 
        )));
        return res.data;
    }

    async cancel(paymentUid: string) {
        const res = await firstValueFrom(this.httpService.delete<Payment>(
            `${this.baseUrl}/payments/${paymentUid}`, 
        ));
        return res.data;
    }

    async cancelCancelling(paymentUid: string) {
        const res = await firstValueFrom(this.httpService.delete<Payment>(
            `${this.baseUrl}/payments/${paymentUid}/cancel-cancelling`, 
        ));
        return res.data;
    }
}
