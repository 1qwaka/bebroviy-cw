import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Hotel])],
    controllers: [HotelController],
    providers: [HotelService],
    exports: [TypeOrmModule],
})
export class HotelModule {
    
}
