import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Repository } from 'typeorm';
import { PaginationHotelDto } from 'src/hotel/dto/pagination-hotel.dto';

@Injectable()
export class HotelService {

    constructor (
        @InjectRepository(Hotel) private readonly repository: Repository<Hotel>
    ) {}

    onModuleInit() {
        try {
            const hotel = this.repository.create({
                id: 1,
                hotelUid: "049161bb-badd-4fa8-9d90-87c9a82b0668",
                name: "Ararat Park Hyatt Moscow",
                country: "Россия",
                city: "Москва",
                address: "Неглинная ул., 4",
                stars: 5,
                price: 10000,
            });
            this.repository.save(hotel);
        } catch {}
    }

    create(createHotelDto: CreateHotelDto) {
        const hotel = this.repository.create(createHotelDto);
        return this.repository.save(hotel);
    }
    
    findAll(paginationDto: PaginationHotelDto) {
        return this.repository.findAndCount({
            skip: (paginationDto.page - 1) * paginationDto.size,
            take: paginationDto.size,
        });
    }
    
    findOne(hotelUid: string) {
        return this.repository.findOneBy({ hotelUid });
    }

}
