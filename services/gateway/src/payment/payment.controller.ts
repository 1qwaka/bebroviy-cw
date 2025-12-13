import { Controller } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { FindPaymentsBatchDto } from 'src/payment/dto/find-payments-batch.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

}
