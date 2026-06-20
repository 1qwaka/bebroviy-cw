import { Injectable, Logger } from '@nestjs/common';

export interface AuthCodePayload {
    userId: string;
    clientId: string;
    redirectUri: string;
    scopes: string[];
}

@Injectable()
export class CodeStorageService {
    private readonly logger = new Logger(CodeStorageService.name)

    constructor() {
        //  this.logger.log(`CodeStorageService instance created: ${Math.random()}`);
    }

    // Для перехода на Redis достаточно будет инжектировать RedisClient
    // и поменять логику в этих трех методах на async redis.set / redis.get
    private storage = new Map<string, { payload: AuthCodePayload; expiresAt: number }>();

    async saveCode(code: string, payload: AuthCodePayload, ttlSeconds: number = 300): Promise<void> {
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.storage.set(code, { payload, expiresAt });
    }

    async getCode(code: string): Promise<AuthCodePayload | null> {
        // this.logger.log(this.storage)
        const data = this.storage.get(code);
        // this.logger.log('got data from code ' + code + ' ' + JSON.stringify(data) + ' ' + (typeof code) + ' ' + JSON.stringify(code))
        if (!data) return null;
        if (Date.now() > data.expiresAt) {
            this.storage.delete(code);
            return null;
        }
        return data.payload;
    }

    async deleteCode(code: string): Promise<void> {
        this.storage.delete(code);
    }
}