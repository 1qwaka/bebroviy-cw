import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Param,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { PaginationHotelDto } from 'src/hotel/dto/pagination-hotel.dto';

@Controller('hotels')
export class HotelController {
    constructor(private readonly hotelService: HotelService) {}

    @Post()
    create(@Body() createHotelDto: CreateHotelDto) {
        return this.hotelService.create(createHotelDto);
    }

    @Get()
    async findAll(@Query() paginationDto: PaginationHotelDto) {
        const [hotels, total] = await this.hotelService.findAll(paginationDto);
        return {
            page: paginationDto.page,
            pageSize: paginationDto.size,
            totalElements: total,
            items: hotels,
        } 
    }

    @Get(':uid')
    async findOne(@Param('uid') hotelUid: string) {
        const hotel = await this.hotelService.findOne(hotelUid);
        return hotel
    }

}
