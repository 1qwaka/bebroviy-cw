import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async findByUsername(username: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ username });
    }

    async findById(id: string): Promise<User | null> {
        return this.usersRepository.findOneBy({ id });
    }

    async createUser(dto: any): Promise<User> {
        const exists = await this.findByUsername(dto.username);
        if (exists) throw new ConflictException('Username already exists');

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(dto.password, salt);

        const user = this.usersRepository.create({
            username: dto.username,
            email: dto.email,
            name: dto.name,
            passwordHash: hash,
            role: dto.role || UserRole.USER, // По умолчанию User
        });

        return this.usersRepository.save(user);
    }
}