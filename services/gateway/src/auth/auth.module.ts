import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthController } from 'src/auth/auth.controller';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtStrategy } from 'src/auth/jwt-strategy.service';
import { UsersController } from 'src/auth/users.controller';

@Module({
    controllers: [AuthController, UsersController],
    providers: [
        JwtStrategy,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        }
    ],
    exports: [JwtStrategy]
})
export class AuthModule {}
