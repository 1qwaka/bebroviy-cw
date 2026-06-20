import { Controller, Get, Headers, HttpException, Logger, Request, ServiceUnavailableException } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import axios from 'axios';

@Controller('loyalty')
export class LoyaltyController {

    private readonly logger = new Logger(LoyaltyController.name);

    constructor(private readonly loyaltyService: LoyaltyService) { }


    @Get()
    async findOne(@Request() req: any) {
        const username = req.user.username; 
        try {
            const loyalty = await this.loyaltyService.findOne(username);
            return loyalty;
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.status && err.status < 500) {
                throw new HttpException(err.message ?? '', err.status)
            } else {
                this.logger.error('unknown error: ' + err)
                throw new ServiceUnavailableException("Loyalty Service unavailable");
            }
        }
    }
}
