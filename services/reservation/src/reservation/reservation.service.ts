import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentStatus, Reservation } from './entities/reservation.entity';
import { Repository } from 'typeorm';
import { Hotel } from '../hotel/entities/hotel.entity';

@Injectable()
export class ReservationService {
    constructor(
        @InjectRepository(Reservation)
        private readonly reservationRepo: Repository<Reservation>,
        @InjectRepository(Hotel)
        private readonly hotelRepo: Repository<Hotel>,
    ) {}

    async create(createReservationDto: CreateReservationDto) {
        const hotel = await this.hotelRepo.findOneBy({ hotelUid: createReservationDto.hotelUid })
        if (!hotel) {
            throw new NotFoundException();
        }

        const overlappingCount = await this.reservationRepo.createQueryBuilder('r')
            .where('r.hotelId = :hotelId', { hotelId: hotel.id })
            .andWhere('r.status = :status', { status: PaymentStatus.PAID })
            .andWhere('r.startDate < :endDate', { endDate: createReservationDto.endDate })
            .andWhere('r.endDate > :startDate', { startDate: createReservationDto.startDate })
            .getCount();

        if (overlappingCount >= hotel.capacity) {
            throw new ConflictException('Нет свободных номеров на выбранные даты');
        }

        const reservation = this.reservationRepo.create({
            ...createReservationDto,
            hotel,
            status: PaymentStatus.PAID
        })
        return this.reservationRepo.save(reservation);
    }

    findAll(username: string) {
        return this.reservationRepo.find({
            where: { username },
            relations: ['hotel'],
        });
    }

    async findOne(reservationUid: string, username: string) {
        const reservation = await this.reservationRepo.findOne({
            where: { reservationUid },
            relations: ['hotel'],
        });
        if (reservation?.username !== username) {
            throw new ForbiddenException();
        }
        return reservation;
    }

    async changeStatus(reservationUid: string, username: string, newStatus: PaymentStatus) {
        const reservation = await this.reservationRepo.findOne({
            where: { reservationUid },
            relations: ['hotel'],
        });
        if (reservation?.username !== username) {
            throw new ForbiddenException();
        }
        reservation.status = newStatus;
        return this.reservationRepo.save(reservation);
    }

    async cancel(reservationUid: string, username: string) {
        return this.changeStatus(reservationUid, username, PaymentStatus.CANCELED);
    }

    async cancelCancelling(reservationUid: string, username: string) {
        return this.changeStatus(reservationUid, username, PaymentStatus.PAID);
    }
}