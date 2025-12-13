import { Controller, Get, Headers } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';

@Controller('loyalty')
export class LoyaltyController {
    constructor(private readonly loyaltyService: LoyaltyService) { }


    @Get()
    findOne(@Headers('X-User-Name') username: string) {
        return this.loyaltyService.findOne(username);
    }
}
