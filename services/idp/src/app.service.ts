import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AppService {
    constructor(
        private readonly httpService: HttpService,
        private readonly cls: ClsService,
    ) { }

    onModuleInit() {
        this.httpService.axiosRef.interceptors.request.use(config => {
            const token = this.cls.get('authorization');
            if (token) {
                config.headers.Authorization = token;
            }
            return config;
        });
    }
}
