import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Logger, Post, Query, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { firstValueFrom } from "rxjs";
import { IsPublic } from "src/auth/decorators/is-public.decorator";
import { AuthDto } from "src/auth/dto/auth.dto";
import { ActionName } from "../util/action-name.decorator";

@Controller()
export class AuthController {
    private readonly logger = new Logger(AuthController.name)
    private readonly idpUrl: string;
    private readonly oidcClientSecret: string;
    private readonly oidcClientId: string;
    private readonly redirectUri: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) { 
        this.idpUrl = this.config.getOrThrow<string>('IDP_URL');
        this.oidcClientSecret = this.config.getOrThrow<string>('OIDC_CLIENT_SECRET');
        this.oidcClientId = this.config.getOrThrow<string>('OIDC_CLIENT_ID');
        this.redirectUri = this.config.getOrThrow<string>('REDIRECT_URI');
    }

    @IsPublic()
    @Post('authorize')
    @ActionName('авторизация по паролю')
    async authorize(@Body() authDto: AuthDto) {
        try {
            const res = await firstValueFrom(this.httpService.post<any>(`${this.idpUrl}/token`, {
                'grant_type': 'password',
                'username': authDto.username,
                'password': authDto.password,
                'client_secret': this.oidcClientSecret,
                'client_id': this.oidcClientId,
            }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }))
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                this.logger.error(`Axios Error: ${err.code} ${err.message} ${err.response?.status}`)
                this.logger.error(err.response?.data)
                this.logger.error(err.request?.data)
            } else {
                this.logger.error(`Non Axios Error: ${err}`)
            }
            throw new UnauthorizedException('Fail to authorize');
        }
    }

    @IsPublic()
    @Get('callback')
    @ActionName('вход через callback (OIDC)')
    async callback(@Query('code') code: string) {
        try {
            const res = await firstValueFrom(this.httpService.post<any>(`${this.idpUrl}/token`, {
                'grant_type': 'authorization_code',
                'code': code,
                'client_secret': this.oidcClientSecret,
                'client_id': this.oidcClientId,
                'redirect_uri': this.redirectUri,
            }))
            return res.data;
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                this.logger.error(`Axios Error: ${err.code} ${err.message} ${err.response?.status}`)
                this.logger.error(err.response?.data)
                this.logger.error(err.request?.data)
            } else {
                this.logger.error(`Non Axios Error: ${err}`)
            }
            throw new UnauthorizedException('Fail to authorize');
        }
    }
}