import { Controller, Get } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { StatService } from './stat.service';

@Controller('statistics')
export class StatController {
    constructor(private readonly statService: StatService) {}

    // Эндпоинт для REST API (вызывается из Gateway)
    @Get()
    getStats() {
        return this.statService.getDashboardStats();
    }

    // Слушатель Kafka
    @EventPattern('booking.events')
    handleBookingEvent(@Payload() message: any) {
        this.statService.recordEvent(message);
    }
}