import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    Request,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller('reservations')
export class ReservationController {
    constructor(private readonly reservationService: ReservationService) {}

    @Post()
    create(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationService.create(createReservationDto);
    }

    @Get()
    findAll(@Request() req: any) {
        const username = req.user.username; 
        return this.reservationService.findAll(username);
    }

    @Get(':id')
    findOne(@Param('id') uid: string, @Request() req: any) {
        const username = req.user.username; 
        return this.reservationService.findOne(uid, username);
    }

    @Delete(':id/cancel')
    cancel(@Param('id') uid: string, @Request() req: any) {
        const username = req.user.username; 
        return this.reservationService.cancel(uid, username);
    }

    @Delete(':id/cancel-cancelling')
    cancelCancelling(@Param('id') uid: string, @Request() req: any) {
        const username = req.user.username; 
        return this.reservationService.cancelCancelling(uid, username);
    }

}
