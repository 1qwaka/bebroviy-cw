import { HttpService } from "@nestjs/axios";
import { Body, Controller, Logger, Post, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
import { firstValueFrom } from "rxjs";
import { IsPublic } from "src/auth/decorators/is-public.decorator";
import { AuthDto } from "src/auth/dto/auth.dto";

@Controller()
export class AuthController {

    private readonly logger = new Logger(AuthController.name)

    private readonly idpUrl: string;

    private readonly oidcClientSecret: string;

    private readonly oidcClientId: string;

    
    constructor(
        private readonly httpService: HttpService,
        private readonly config: ConfigService,
    ) { 
        this.idpUrl = this.config.getOrThrow<string>('IDP_URL');
        this.oidcClientSecret = this.config.getOrThrow<string>('OIDC_CLIENT_SECRET');
        this.oidcClientId = this.config.getOrThrow<string>('OIDC_CLIENT_ID');
    }


    @IsPublic()
    @Post('authorize')
    async authorize(@Body() authDto: AuthDto) {
        try {
            const res = await firstValueFrom(this.httpService.post<any>(`${this.idpUrl}/token`, {
                'grant_type': 'password',
                'username': authDto.username,
                'password': authDto.password,
                'client_secret': this.oidcClientSecret,
                'client_id': this.oidcClientId,
            }, 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                }
            }))
            this.logger.log(res.data)
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