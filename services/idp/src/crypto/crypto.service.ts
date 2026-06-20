import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
    private readonly privateKey: string;
    private readonly publicKey: string;
    private readonly keyId = 'key-1'; // ID ключа для ротации

    constructor(private configService: ConfigService) {
        const privateB64 = this.configService.getOrThrow<string>('JWT_PRIVATE_KEY_BASE64');
        const publicB64 = this.configService.getOrThrow<string>('JWT_PUBLIC_KEY_BASE64');

        if (!privateB64 || !publicB64) {
            throw new InternalServerErrorException('RSA keys are missing in env');
        }

        this.privateKey = Buffer.from(privateB64, 'base64').toString('utf-8');
        this.publicKey = Buffer.from(publicB64, 'base64').toString('utf-8');
    }

    getPrivateKey(): string {
        return this.privateKey;
    }

    getPublicKey(): string {
        return this.publicKey;
    }

    // Генерация JWKS из публичного ключа RSA (встроенными средствами Node.js)
    getJwks() {
        const key = crypto.createPublicKey(this.publicKey);
        const jwk = key.export({ format: 'jwk' });

        return {
            keys: [
                {
                    kty: 'RSA',
                    kid: this.keyId,
                    use: 'sig',
                    alg: 'RS256',
                    n: jwk.n,
                    e: jwk.e,
                },
            ],
        };
    }
}