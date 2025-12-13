import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLoyaltyDto } from './dto/create-loyalty.dto';
import { UpdateLoyaltyDto } from './dto/update-loyalty.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Loyalty, LoyaltyStatus, LoyaltyStatusDiscount } from './entities/loyalty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LoyaltyService {
    constructor(
        @InjectRepository(Loyalty)
        private readonly repository: Repository<Loyalty>,
    ) {}

    onModuleInit() {
        try {
            const loyalty = this.repository.create({
                id: 1,
                username: "Test Max",
                reservationCount: 25,
                status: LoyaltyStatus.GOLD,
                discount: 10,
            });
            this.repository.save(loyalty);
        } catch {}
    }

    create(dto: CreateLoyaltyDto) {
        const loyalty = this.repository.create({
            username: dto.username,
            discount: LoyaltyStatusDiscount[LoyaltyStatus.BRONZE],
            reservationCount: 0,
            status: LoyaltyStatus.BRONZE,
        })
        return this.repository.save(loyalty);
    }

    findOne(username: string) {
        return this.repository.findOneBy({ username });
    }

    async update(username: string, updateLoyaltyDto: UpdateLoyaltyDto) {
        const loyalty = await this.repository.findOneBy({ username });
        if (!loyalty) {
            throw new NotFoundException();
        }
        
        loyalty.reservationCount = Math.max(0, loyalty.reservationCount + updateLoyaltyDto.reservationCountChange);
        this.updateStatus(loyalty)

        return this.repository.save(loyalty);
    }

    private updateStatus(loyalty: Loyalty) {
        if (loyalty.reservationCount < 10) {
            loyalty.status = LoyaltyStatus.BRONZE;
            loyalty.discount = LoyaltyStatusDiscount[LoyaltyStatus.BRONZE];
        } else if (loyalty.reservationCount < 20) {
            loyalty.status = LoyaltyStatus.SILVER;
            loyalty.discount = LoyaltyStatusDiscount[LoyaltyStatus.SILVER];
        } else  {
            loyalty.status = LoyaltyStatus.GOLD;
            loyalty.discount = LoyaltyStatusDiscount[LoyaltyStatus.GOLD];
        }
    }

}
