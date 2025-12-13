import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class CreateHotelDto {

    @IsString()
    @MaxLength(255)
    name: string;

    @IsString()
    @MaxLength(80)
    country: string;

    @IsString()
    @MaxLength(80)
    city: string;

    @IsString()
    @MaxLength(80)
    address: string;

    @IsInt()
    @Min(0)
    @IsOptional()
    stars: number;

    @IsInt()
    @Min(0)
    price: number;
    
}
