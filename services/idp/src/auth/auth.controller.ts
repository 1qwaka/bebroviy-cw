import { Controller, Get, Post, Req, Res, Body, Query, UnauthorizedException, BadRequestException, Render, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CodeStorageService } from './code-storage.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import { CryptoService } from '../crypto/crypto.service';
import { ClientsService } from 'src/clients/clients.service';

@Controller('auth')
export class AuthController {
    private readonly logger = new Logger(AuthController.name)
    

    constructor(
        private usersService: UsersService,
        private clientsService: ClientsService,
        private codeStorage: CodeStorageService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private cryptoService: CryptoService,
    ) { }

    @Get('certs')
    getJwks() {
        return this.cryptoService.getJwks();
    }

    // 2. Страница логина и старт Authorization Code Flow
    @Get('authorize')
    async getAuthorize(@Query() query: any, @Req() req: Request, @Res() res: Response) {
        const { client_id, redirect_uri, response_type, scope, state } = query;

        if (response_type !== 'code') throw new BadRequestException('Unsupported response_type');

        const client = await this.clientsService.validateClient(client_id, redirect_uri);
        if (!client) throw new BadRequestException('Invalid client_id or redirect_uri');

        // // Проверяем, есть ли сессионная кука (уже залогинен)
        // const sessionUserId = req.cookies['idp_session'];
        // if (sessionUserId) {
        //     const user = await this.usersService.findById(sessionUserId);
        //     if (user) {
        //         return this.generateCodeAndRedirect(user.id, client_id, redirect_uri, scope, state, res);
        //     }
        // }

        this.logger.log('Return form to client with params: ' 
                + JSON.stringify({ client_id, redirect_uri, scope, state }))

        return res.render('login', { client_id, redirect_uri, scope, state });
    }

    // 3. Обработка формы логина
    @Post('authorize')
    async postAuthorize(@Body() body: any, @Res() res: Response) {
        const { username, password, client_id, redirect_uri, scope, state } = body;

        const user = await this.usersService.findByUsername(username);
        if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
            return res.render('login', { error: 'Invalid credentials', client_id, redirect_uri, scope, state });
        }

        res.cookie('idp_session', user.id, { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
        
        return this.generateCodeAndRedirect(user.id, client_id, redirect_uri, scope, state, res);
    }

    private async generateCodeAndRedirect(userId: string, clientId: string, redirectUri: string, scope: string, state: string, res: Response) {
        const code = crypto.randomBytes(16).toString('hex');
        const scopes = scope ? scope.split(' ') : ['openid'];

        this.logger.log('Saved code ' + code + ' with params: ' 
                + JSON.stringify({ userId, clientId, redirectUri, scopes }))
        await this.codeStorage.saveCode(code, { userId, clientId, redirectUri, scopes });
        // this.logger.log('Saved code: ' + code + ' ' + JSON.stringify(await this.codeStorage.getCode(code), null, 2))        

        const redirectUrl = new URL(redirectUri);
        redirectUrl.searchParams.append('code', code);
        if (state) redirectUrl.searchParams.append('state', state);

        return res.redirect(redirectUrl.toString());
    }

    // 4. Обмен кода на токены (Вызывает API Gateway/UI)
    @Post('token')
    async issueToken(@Body() body: any) {
        const { grant_type, code, client_id, client_secret, redirect_uri } = body;

        if (grant_type !== 'authorization_code') {
            throw new BadRequestException('Unsupported grant_type');
        }

        const client = await this.clientsService.validateClientCredentials(client_id, client_secret);
        if (!client) {
            throw new UnauthorizedException('Invalid client credentials');
        }

        const codeData = await this.codeStorage.getCode(code);
        if (!codeData || codeData.clientId !== client_id || codeData.redirectUri !== redirect_uri) {
            let additionalInfo = '';
            if (!codeData) {
                additionalInfo += 'code data is undefined'
            } else if (codeData.clientId !== client_id) {
                additionalInfo += `client id ${codeData.clientId} != ${client}`
            } else if (codeData.redirectUri !== redirect_uri) {
                additionalInfo += `redirectUri ${codeData.redirectUri} != ${redirect_uri}`
            }
            throw new BadRequestException('Invalid or expired code: ' + additionalInfo);
        }

        await this.codeStorage.deleteCode(code);

        const user = await this.usersService.findById(codeData.userId);
        if (!user) throw new BadRequestException('User not found');

        const issuer = this.configService.getOrThrow<string>('IDP_ISSUER');

        const accessTokenPayload = {
            sub: user.id,
            preferred_username: user.username,
            email: user.email,
            name: user.name || user.username,
            role: user.role,
            iss: issuer,
            aud: client_id,
            scopes: codeData.scopes,
        };

        const accessToken = this.jwtService.sign(accessTokenPayload, { expiresIn: '15m' });

        const idTokenPayload = {
            ...accessTokenPayload,
            nonce: body.nonce,
        };
        const idToken = this.jwtService.sign(idTokenPayload, { expiresIn: '1h' });

        return {
            access_token: accessToken,
            id_token: idToken,
            token_type: 'Bearer',
            expires_in: 900,
        };
    }
}