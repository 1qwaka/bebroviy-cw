import { Type } from "class-transformer";
import { IsInt, IsOptional, Min } from "class-validator";

export class PaginationHotelDto {

    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    page: number = 0;

    @IsInt()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    size: number = 10;
    
}
