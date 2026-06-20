import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { ClientsModule } from '../clients/clients.module';
import { UsersService } from '../users/users.service';
import { ClientsService } from '../clients/clients.service';
import { UserRole } from '../users/user.entity';

@Module({
    imports: [UsersModule, ClientsModule],
})
export class SeederModule implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeederModule.name);

    constructor(
        private usersService: UsersService,
        private clientsService: ClientsService,
    ) { }

    async onApplicationBootstrap() {
        // 1. Создаем Админа
        const admin = await this.usersService.findByUsername('admin');
        if (!admin) {
            await this.usersService.createUser({
                username: 'admin',
                password: 'admin_password', // В проде брать из env
                email: 'admin@idp.local',
                name: 'System Admin',
                role: UserRole.ADMIN,
            });
            this.logger.log('Default Admin user created.');
        }

        await this.createUsers();

        // 2. Создаем хардкод клиента для API Gateway
        // Допускаем, что Gateway слушает колбэк на http://gateway-svc/callback
        const clientExists = await this.clientsService.validateClient('gateway-client', 'http://gateway-svc/callback');
        if (!clientExists) {
            // Игнорируем ошибку уникальности если клиент существует с другим URI
            try {
                await this.clientsService.createClient(
                    'gateway-client',
                    'gateway-secret',
                    [
                        'http://gateway-svc/callback',
                        'http://localhost:8080/callback',
                        'http://localhost:8100/callback',
                        'http://localhost:5173/callback',
                        'http://my-app.local/callback',
                    ],
                );
                this.logger.log('Default Gateway OAuth Client created.');
            } catch (e) { }
        }
    }

    private async createUsers() {
        const defaultUsers = [
            { username: 'alice', password: 'pass_alice', email: 'alice@idp.local', name: 'Alice Johnson' },
            { username: 'bob', password: 'pass_bob', email: 'bob@idp.local', name: 'Bob Smith' },
            { username: 'carol', password: 'pass_carol', email: 'carol@idp.local', name: 'Carol Williams' },
            { username: 'dave', password: 'pass_dave', email: 'dave@idp.local', name: 'Dave Brown' },
            { username: 'eve', password: 'pass_eve', email: 'eve@idp.local', name: 'Eve Davis' },
        ];

        for (const userData of defaultUsers) {
            const existingUser = await this.usersService.findByUsername(userData.username);
            if (!existingUser) {
                await this.usersService.createUser({
                    username: userData.username,
                    password: userData.password,
                    email: userData.email,
                    name: userData.name,
                    role: UserRole.USER,
                });
                this.logger.log(`Default user '${userData.username}' created.`);
            }
        }
    }
}