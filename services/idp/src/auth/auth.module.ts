import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { CodeStorageService } from './code-storage.service';
import { CryptoService } from '../crypto/crypto.service';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { IdpJwtStrategy } from './idp-jwt.strategy';
import { CryptoModule } from 'src/crypto/crypto.module';

@Module({
    imports: [
        UsersModule,
        ClientsModule,
        CryptoModule,
        JwtModule.registerAsync({
            imports: [CryptoModule],
            inject: [CryptoService],
            useFactory: (crypto: CryptoService) => ({
                privateKey: crypto.getPrivateKey(),
                publicKey: crypto.getPublicKey(),
                signOptions: { algorithm: 'RS256', keyid: 'key-1' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [CodeStorageService, IdpJwtStrategy],
})
export class AuthModule { }