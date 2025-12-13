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
    findAll(@Query('username') username: string) {
        return this.reservationService.findAll(username);
    }

    @Get(':id')
    findOne(@Param('id') uid: string, @Query('username') username: string) {
        return this.reservationService.findOne(uid, username);
    }

    @Delete(':id/cancel')
    cancel(@Param('id') uid: string, @Query('username') username: string) {
        return this.reservationService.cancel(uid, username);
    }

}
