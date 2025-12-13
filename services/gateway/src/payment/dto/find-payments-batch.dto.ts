import { Transform, Type } from "class-transformer";
import { IsArray, IsUUID } from "class-validator";

export class FindPaymentsBatchDto {
    @IsArray()
    @IsUUID(4, { each: true })
    @Transform(({ value }) => {
        return Array.isArray(value) ? value : [value] 
    })
    uids: string[]
}