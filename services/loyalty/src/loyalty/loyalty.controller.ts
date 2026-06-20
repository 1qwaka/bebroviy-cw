import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Request,
} from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { CreateLoyaltyDto } from './dto/create-loyalty.dto';
import { UpdateLoyaltyDto } from './dto/update-loyalty.dto';

@Controller('loyalties')
export class LoyaltyController {
    constructor(private readonly loyaltyService: LoyaltyService) {}

    @Post()
    create(@Body() createLoyaltyDto: CreateLoyaltyDto) {
        return this.loyaltyService.create(createLoyaltyDto);
    }

    @Get(':username')
    findOne(@Request() req: any) {
        const username = req.user.username; 
        return this.loyaltyService.findOne(username);
    }

    @Patch(':username')
    update(@Request() req: any, @Body() updateLoyaltyDto: UpdateLoyaltyDto) {
        const username = req.user.username; 
        return this.loyaltyService.update(username, updateLoyaltyDto);
    }
}
