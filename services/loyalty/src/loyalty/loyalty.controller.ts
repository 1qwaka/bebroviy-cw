import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
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
    findOne(@Param('username') username: string) {
        return this.loyaltyService.findOne(username);
    }

    @Patch(':username')
    update(@Param('username') username: string, @Body() updateLoyaltyDto: UpdateLoyaltyDto) {
        return this.loyaltyService.update(username, updateLoyaltyDto);
    }
}
