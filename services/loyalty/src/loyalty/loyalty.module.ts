import { Module } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Loyalty } from 'src/loyalty/entities/loyalty.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Loyalty])],
    controllers: [LoyaltyController],
    providers: [LoyaltyService],
})
export class LoyaltyModule {}
