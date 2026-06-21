import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CryptoService } from '../crypto/crypto.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IdpJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(cryptoService: CryptoService, configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: cryptoService.getPublicKey(),
            issuer: configService.getOrThrow<string>('IDP_ISSUER'),
            algorithms: ['RS256'],
        });
    }

    async validate(payload: any) {
        return {
            userId: payload.sub,
            username: payload.preferred_username,
            role: payload.role,
        };
    }
}