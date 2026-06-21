import { Controller, Get, Query } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { StatService } from './stat.service';

@Controller('statistics')
export class StatController {
    constructor(private readonly statService: StatService) {}

    @Get()
    getStats() {
        return this.statService.getDashboardStats();
    }

    @Get('actions')
    getActions(@Query('page') page: number = 1, @Query('size') size: number = 10) {
        return this.statService.getActions(page, size);
    }

    @EventPattern('booking.events')
    handleBookingEvent(@Payload() message: any) {
        this.statService.recordEvent(message);
    }

    @EventPattern('user.actions')
    handleUserAction(@Payload() message: any) {
        this.statService.recordAction(message);
    }
}