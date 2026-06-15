import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        private readonly config: ConfigService,
    ) {
        const idpUrl = config.getOrThrow<string>('IDP_URL');
        const idpIssuer = config.getOrThrow<string>('IDP_ISSUER');

        super({
            secretOrKeyProvider: passportJwtSecret({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: `${idpUrl}/certs`,
            }),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            issuer: idpIssuer,
            algorithms: ['RS256'],
        });
    }

    // Этот метод вызывается АВТОМАТИЧЕСКИ после того, 
    // как токен прошел проверку подписи и срока годности.
    // В аргумент `payload` попадает расшифрованный JSON (см. выше)
    async validate(payload: any) {
        // Всё, что ты вернешь отсюда, NestJS положит в объект `request.user`
        return { 
            userId: payload.sub, 
            username: payload.preferred_username, // В Keycloak логин лежит тут
            email: payload.email,
            name: payload.name,
            payload,
        };
    }
}