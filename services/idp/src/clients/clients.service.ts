import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ClientsService {
    constructor(
        @InjectRepository(Client)
        private clientsRepository: Repository<Client>,
    ) { }

    async validateClient(clientId: string, redirectUri: string): Promise<boolean> {
        const client = await this.clientsRepository.findOneBy({ clientId });
        if (!client) {
            return false
        };
        return client.redirectUris.includes(redirectUri);
    }

    async validateClientCredentials(clientId: string, clientSecret: string): Promise<Client | null> {
        const client = await this.clientsRepository.findOneBy({ clientId });
        if (!client) return null;

        const isMatch = await bcrypt.compare(clientSecret, client.clientSecretHash);
        if (!isMatch) return null;

        return client;
    }

    async createClient(clientId: string, clientSecret: string, redirectUris: string[]) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(clientSecret, salt);

        const client = this.clientsRepository.create({
            clientId,
            clientSecretHash: hash,
            redirectUris,
        });
        return this.clientsRepository.save(client);
    }
}