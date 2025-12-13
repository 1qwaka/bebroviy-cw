import { Module } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { HotelModule } from 'src/hotel/hotel.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Reservation]),
        HotelModule,
    ],
    controllers: [ReservationController],
    providers: [ReservationService],
})
export class ReservationModule {}
