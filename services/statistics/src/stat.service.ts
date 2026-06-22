import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatEventType, StatRecord } from './stat.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatService {
    private readonly logger = new Logger(StatService.name);

    constructor(
        @InjectRepository(StatRecord)
        private readonly repo: Repository<StatRecord>,
    ) { }

    async recordEvent(data: any) {
        try {
            const record = this.repo.create({
                eventType: data.eventType,
                hotelUid: data.hotelUid,
                price: data.price,
                loyaltyStatus: data.loyaltyStatus,
            });
            await this.repo.save(record);
            this.logger.log(`Saved stat event: ${data.eventType}`);
        } catch (err) {
            this.logger.error('Failed to save stat event', err);
        }
    }

    async recordAction(data: any) {
        try {
            const record = this.repo.create({
                eventType: StatEventType.USER_ACTION,
                actionName: data.actionName,
                username: data.username,
            });
            await this.repo.save(record);
        } catch (err) {
            this.logger.error('Failed to save user action', err);
        }
    }

    async getDashboardStats() {
        const totalCreated = await this.repo.count({ where: { eventType: StatEventType.RESERVATION_CREATED } });
        const totalCanceled = await this.repo.count({ where: { eventType: StatEventType.RESERVATION_CANCELED } });

        const revenueRes = await this.repo.createQueryBuilder('s')
            .select('SUM(s.price)', 'total')
            .where('s.eventType = :type', { type: StatEventType.RESERVATION_CREATED })
            .getRawOne();
        
        const revenueMinus = await this.repo.createQueryBuilder('s')
            .select('SUM(s.price)', 'total')
            .where('s.eventType = :type', { type: StatEventType.RESERVATION_CANCELED })
            .getRawOne();

        const hotelPopularity = await this.repo.createQueryBuilder('s')
            .select('s.hotelUid', 'hotelUid')
            .addSelect('COUNT(*)', 'count')
            .where('s.eventType = :type', { type: StatEventType.RESERVATION_CREATED })
            .groupBy('s.hotelUid')
            .orderBy('count', 'DESC')
            .limit(10)
            .getRawMany();

        const loyaltyDistribution = await this.repo.createQueryBuilder('s')
            .select('s.loyaltyStatus', 'status')
            .addSelect('COUNT(*)', 'count')
            .where('s.eventType = :type', { type: StatEventType.RESERVATION_CREATED })
            .groupBy('s.loyaltyStatus')
            .getRawMany();

        return {
            totalCreated,
            totalCanceled,
            revenue: parseInt(revenueRes?.total || '0', 10) - parseInt(revenueMinus?.total || '0', 10),
            hotelPopularity: hotelPopularity.map(h => ({ hotelUid: h.hotelUid, count: parseInt(h.count, 10) })),
            loyaltyDistribution: loyaltyDistribution.map(l => ({ status: l.status, count: parseInt(l.count, 10) })),
        };
    }

    async getActions(page: number, size: number) {
        const [items, total] = await this.repo.findAndCount({
            where: { eventType: StatEventType.USER_ACTION },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * size,
            take: size,
        });

        return {
            items,
            totalElements: total,
            page: Number(page),
            pageSize: Number(size),
        };
    }
}