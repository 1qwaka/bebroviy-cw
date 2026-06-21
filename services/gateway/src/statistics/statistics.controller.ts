import { Controller, Get, Query, SetMetadata, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RolesGuard } from '../auth/guards/roles.guard';
import { HotelService } from 'src/reservation/hotel.service';
import { ActionName } from '../util/action-name.decorator';

export interface StatHotelItem {
    hotelUid: string;
    count: number;
    name?: string;
}

export interface StatLoyaltyItem {
    status: string;
    count: number;
}

export interface StatisticsResponse {
    totalCreated: number;
    totalCanceled: number;
    revenue: number;
    hotelPopularity: StatHotelItem[];
    loyaltyDistribution: StatLoyaltyItem[];
}

@Controller('statistics')
@UseGuards(RolesGuard)
export class StatisticsController {
    private readonly statsUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly hotelService: HotelService,
        private readonly config: ConfigService,
    ) {
        this.statsUrl = this.config.getOrThrow<string>('STATISTICS_URL') || 'http://statistics:8080';
    }

    @Get()
    @SetMetadata('roles', ['Admin'])
    @ActionName('просмотр агрегированной статистики')
    async getStats() {
        const res = await firstValueFrom(this.httpService.get<StatisticsResponse>(`${this.statsUrl}/statistics`));
        for (const pop of res.data.hotelPopularity) {
            const hotel = await this.hotelService.findOne(pop.hotelUid);
            Object.assign(pop, hotel);
        }
        return res.data;
    }

    @Get('actions')
    @SetMetadata('roles', ['Admin'])
    @ActionName('просмотр журнала действий')
    async getActions(@Query('page') page = 1, @Query('size') size = 10) {
        const res = await firstValueFrom(this.httpService.get(`${this.statsUrl}/statistics/actions`, {
            params: { page, size }
        }));
        return res.data;
    }
}