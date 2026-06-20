import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatController } from './stat.controller';
import { StatService } from './stat.service';
import { StatRecord } from './stat.entity';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.getOrThrow<string>('DB_HOST'),
                port: config.getOrThrow<number>('DB_PORT'),
                username: config.getOrThrow<string>('DB_USER'),
                password: config.getOrThrow<string>('DB_PASS'),
                database: config.getOrThrow<string>('DB_NAME'),
                entities: [StatRecord],
                synchronize: true,
            }),
        }),
        TypeOrmModule.forFeature([StatRecord]),
    ],
    controllers: [StatController],
    providers: [StatService],
})
export class AppModule {}