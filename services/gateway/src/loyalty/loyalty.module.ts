import { Module } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { CircuitBreakerProvider } from 'src/util/curcuit-breaker-provider';

@Module({
  controllers: [LoyaltyController],
  providers: [LoyaltyService, CircuitBreakerProvider],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
