import { Controller, Post, Body, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('api/v1/users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // Закрыто token-based авторизацией
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post()
    @SetMetadata('roles', ['Admin']) // Создавать могут только админы
    async createUser(@Body() body: any) {
        const user = await this.usersService.createUser(body);
        delete (user as any).passwordHash; // Не возвращаем хэш в ответе
        return user;
    }
}