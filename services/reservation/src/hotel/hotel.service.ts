import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Repository } from 'typeorm';
import { PaginationHotelDto } from 'src/hotel/dto/pagination-hotel.dto';

@Injectable()
export class HotelService {

    constructor(
        @InjectRepository(Hotel) private readonly repository: Repository<Hotel>
    ) { }

    onModuleInit() {
        try {
            this.createHotels()
        } catch { }
    }

    create(createHotelDto: CreateHotelDto) {
        const hotel = this.repository.create(createHotelDto);
        return this.repository.save(hotel);
    }

    findAll(paginationDto: PaginationHotelDto) {
        return this.repository.findAndCount({
            skip: paginationDto.page * paginationDto.size,
            take: paginationDto.size,
        });
    }

    findOne(hotelUid: string) {
        return this.repository.findOneBy({ hotelUid });
    }

    private async createHotels() {
        const hotelsData = [
            {
                id: 1,
                hotelUid: "049161bb-badd-4fa8-9d90-87c9a82b0668",
                name: "Ararat Park Hyatt Moscow",
                country: "Россия",
                city: "Москва",
                address: "Неглинная ул., 4",
                stars: 5,
                price: 10000,
            },
            {
                hotelUid: "e9bb4789-8f60-43b7-895e-4845a3c003f7",
                name: "The Ritz London",
                country: "Великобритания",
                city: "Лондон",
                address: "150 Piccadilly",
                stars: 5,
                price: 15000,
            },
            {
                hotelUid: "fb0d7bb5-76fc-4fb0-b722-762c773560c1",
                name: "Hotel de Crillon",
                country: "Франция",
                city: "Париж",
                address: "10 Place de la Concorde",
                stars: 5,
                price: 18000,
            },
            {
                hotelUid: "4b2476cc-561e-440d-991a-2330b3a48f05",
                name: "Marina Bay Sands",
                country: "Сингапур",
                city: "Сингапур",
                address: "10 Bayfront Ave",
                stars: 5,
                price: 20000,
            },
            {
                hotelUid: "20116c59-de4c-4555-bd16-1b5119b799e5",
                name: "Бутик-отель Гельвеция",
                country: "Россия",
                city: "Санкт-Петербург",
                address: "ул. Марата, 11",
                stars: 4,
                price: 7500,
            },
            {
                hotelUid: "4f3f0911-dd04-4b25-8a89-c0c851e813f3",
                name: "Park Inn by Radisson",
                country: "Германия",
                city: "Берлин",
                address: "Alexanderplatz 7",
                stars: 4,
                price: 8500,
            },
            {
                hotelUid: "3d491cdc-5aa6-40c5-82db-b2dc66399d49",
                name: "Hilton Tokyo",
                country: "Япония",
                city: "Токио",
                address: "6-6-2 Nishi-Shinjuku",
                stars: 5,
                price: 16000,
            },
            {
                hotelUid: "43d657aa-848b-4106-84bc-bc32374bfe0a",
                name: "Grand Hyatt Dubai",
                country: "ОАЭ",
                city: "Дубай",
                address: "Bur Dubai, Healthcare City",
                stars: 5,
                price: 14000,
            },
            {
                hotelUid: "d881a979-cefe-4b11-9602-5990e2891611",
                name: "Отель Минск",
                country: "Беларусь",
                city: "Минск",
                address: "пр. Независимости, 11",
                stars: 3,
                price: 4500,
            },
            {
                hotelUid: "406e31f8-1265-4a18-b411-dded7f95b07e",
                name: "Ibis Budget Madrid Centro",
                country: "Испания",
                city: "Мадрид",
                address: "Calle de la Montera, 10",
                stars: 2,
                price: 3500,
            },
            {
                hotelUid: "e1087b05-aa7a-42d1-8518-129a8b3f0684",
                name: "Swissotel Al Murooj",
                country: "ОАЭ",
                city: "Дубай",
                address: "Al Mustaqbal Street, Downtown",
                stars: 4,
                price: 9500,
            },
            {
                hotelUid: "3471555a-426f-41a5-80fc-56dfa0a72dd0",
                name: "Four Seasons Hotel New York",
                country: "США",
                city: "Нью-Йорк",
                address: "57 E 57th St",
                stars: 5,
                price: 22000,
            },
            {
                hotelUid: "597879f0-6c70-4214-a979-f150d4b49fb7",
                name: "Азимут Отель",
                country: "Россия",
                city: "Владивосток",
                address: "ул. Набережная, 10",
                stars: 3,
                price: 5000,
            },
            {
                hotelUid: "2d9308ae-910f-4e22-91b1-fd1912ee826e",
                name: "Radisson Blu Hotel Milan",
                country: "Италия",
                city: "Милан",
                address: "Via Villapizzone, 24",
                stars: 4,
                price: 11000,
            },
            {
                hotelUid: "1a4c0542-294e-4002-b1e8-df915178bfc8",
                name: "Beijing Hotel NUO",
                country: "Китай",
                city: "Пекин",
                address: "1 East Chang An Avenue",
                stars: 5,
                price: 13000,
            },
            {
                hotelUid: "ad6ad616-6883-41ad-8fe8-4fad3755faf4",
                name: "Taj Mahal Palace",
                country: "Индия",
                city: "Мумбаи",
                address: "Apollo Bunder",
                stars: 5,
                price: 12000,
            },
            {
                hotelUid: "37ccc58d-e59c-4a10-9e76-df2a01384faf",
                name: "Ibis Kiev City Center",
                country: "Украина",
                city: "Киев",
                address: "бул. Тараса Шевченко, 25",
                stars: 2,
                price: 2800,
            },
            {
                hotelUid: "90c17bfc-7a2c-4c9d-ae1c-da162713d8c4",
                name: "Scandic Grand Central",
                country: "Швеция",
                city: "Стокгольм",
                address: "Kungsgatan 70",
                stars: 4,
                price: 10500,
            },
            {
                hotelUid: "d1d77f28-95ad-418e-be3b-76c70eb0dc9e",
                name: "Mövenpick Hotel Amsterdam",
                country: "Нидерланды",
                city: "Амстердам",
                address: "Piet Heinkade 11",
                stars: 4,
                price: 11500,
            },
            {
                hotelUid: "30ac5735-553a-42ce-815a-2f559e70c7b2",
                name: "Hotel Tylösand",
                country: "Швеция",
                city: "Хальмстад",
                address: "Tylösandsvägen 28",
                stars: 3,
                price: 7800,
            },
        ];

        for (const hotelData of hotelsData) {
            const exists = await this.repository.findOne({
                where: { hotelUid: hotelData.hotelUid },
            });
            if (!exists) {
                const hotel = this.repository.create(hotelData);
                await this.repository.save(hotel);
            }
        }

    }

}
