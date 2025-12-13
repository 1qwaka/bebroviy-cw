import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { PaymentsService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { FindPaymentsBatchDto } from 'src/payment/dto/find-payments-batch.dto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @Post()
    create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentsService.create(createPaymentDto);
    }

    @Get()
    findAll(@Query() dto: FindPaymentsBatchDto) {
        return this.paymentsService.findAll(dto);
    }

    @Get(':id')
    findOne(@Param('id') uid: string) {
        return this.paymentsService.findOne(uid);
    }

    @Delete(':id')
    cancel(@Param('id') uid: string) {
        return this.paymentsService.cancel(uid);
    }

    @Delete(':id/cancel-cancelling')
    cancelCancelling(@Param('id') uid: string) {
        return this.paymentsService.cancelCancelling(uid);
    }
   
}
