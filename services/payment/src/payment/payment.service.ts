import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { In, Repository } from 'typeorm';
import { FindPaymentsBatchDto } from './dto/find-payments-batch.dto';

@Injectable()
export class PaymentsService {

    constructor(
        @InjectRepository(Payment)
        private readonly repository: Repository<Payment>
    ) {}

    create(dto: CreatePaymentDto) {
        const payment = this.repository.create({
            status: PaymentStatus.PAID,
            price: dto.price,
        })
        return this.repository.save(payment);
    }

    findAll(dto: FindPaymentsBatchDto) {
        return this.repository.find({
            where: { paymentUid: In(dto.uids) },
        });
    }

    findOne(paymentUid: string) {
        return this.repository.findOneBy({ paymentUid });
    }

    async cancel(paymentUid: string) {
        const payment = await this.repository.findOneBy({ paymentUid })
        if (!payment) {
            return new NotFoundException()
        }
        payment.status = PaymentStatus.CANCELED;
        return this.repository.save(payment);
    }

}
