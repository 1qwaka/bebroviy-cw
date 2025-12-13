import { Controller, Get, Query } from '@nestjs/common';
import { PaginationHotelDto } from 'src/reservation/dto/pagination-hotel.dto';
import { HotelService } from 'src/reservation/hotel.service';

@Controller('hotels')
export class HotelController {

    constructor(
        private readonly hotelService: HotelService,
    ) { }

    @Get()
    async findHotels(@Query() dto: PaginationHotelDto) {
        return this.hotelService.findAll(dto);
    }
}
