import { Module } from '@nestjs/common';
import { StatisticsController } from './statistics.controller';
import { ReservationModule } from 'src/reservation/reservation.module';

@Module({
    imports: [ReservationModule],
    controllers: [StatisticsController],
})
export class StatisticsModule { }