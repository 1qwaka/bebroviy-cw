import { Controller, Get, HttpCode } from "@nestjs/common";

@Controller()
export class AppController {


    @Get('manage/health')
    @HttpCode(200)
    health() {

    }


}
