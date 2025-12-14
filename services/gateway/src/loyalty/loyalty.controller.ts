import { Controller, Get, Headers, ServiceUnavailableException } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';

@Controller('loyalty')
export class LoyaltyController {
    constructor(private readonly loyaltyService: LoyaltyService) { }


    @Get()
    async findOne(@Headers('X-User-Name') username: string) {
        try {
            return await this.loyaltyService.findOne(username);
        } catch {
            throw new ServiceUnavailableException("Loyalty Service unavailable");
        }
    }
}
