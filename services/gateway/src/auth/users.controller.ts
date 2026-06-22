import { Body, Controller, Post, UseGuards, SetMetadata, HttpException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { RolesGuard } from './guards/roles.guard';
import { ActionName } from '../util/action-name.decorator';
import axios from 'axios';

@Controller('users')
@UseGuards(RolesGuard)
export class UsersController {
    private readonly logger = new Logger(UsersController.name);
    private readonly idpApiUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) {
        const idpUrl = this.config.getOrThrow<string>('IDP_URL');
        this.idpApiUrl = idpUrl.replace('/auth', '/api/v1/users');
    }

    @Post()
    @SetMetadata('roles', ['Admin'])
    @ActionName('регистрация нового пользователя')
    async createUser(@Body() dto: any) {
        try {
            const res = await firstValueFrom(this.httpService.post(this.idpApiUrl, dto));
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response) {
                throw new HttpException(
                    err?.response?.data?.message || 'Ошибка создания пользователя',
                    err?.response?.status
                );
            }
            this.logger.error('Error Create User: ' + err);
            throw new HttpException('Internal server error', 500);
        }
    }
}