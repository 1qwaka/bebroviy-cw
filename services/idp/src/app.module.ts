import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { SeederModule } from './seeder/seeder.module';
import { User } from './users/user.entity';
import { Client } from './clients/client.entity';
import { AppController } from 'src/app.controller';
import { AuthModule } from 'src/auth/auth.module';
import { ClientsModule } from 'src/clients/clients.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.getOrThrow<string>('DB_HOST'),
                port: configService.getOrThrow<number>('DB_PORT'),
                username: configService.getOrThrow<string>('DB_USER'),
                password: configService.getOrThrow<string>('DB_PASS'),
                database: configService.getOrThrow<string>('DB_NAME'),
                entities: [User, Client],
                synchronize: true,
            }),
        }),
        UsersModule,
        AuthModule,
        ClientsModule,
        SeederModule,
    ],
    controllers: [AppController]
})
export class AppModule { }