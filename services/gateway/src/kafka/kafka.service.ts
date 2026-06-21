import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit {
    private readonly logger = new Logger(KafkaService.name);
    private kafka: Kafka;
    private producer: Producer;
    private isConnected = false;

    constructor(private readonly config: ConfigService) {
        const broker = this.config.getOrThrow<string>('KAFKA_BROKER') || 'kafka:9092';
        this.kafka = new Kafka({
            clientId: 'gateway-producer',
            brokers: [broker],
              retry: {
                initialRetryTime: 3000,
                retries: 5, 
            }
        });
        this.producer = this.kafka.producer();
    }

    onModuleInit() {
        this.connect().catch(err => {
            this.logger.warn(`Kafka init failed (${err.message}). App will run without statistics.`);
        });
    }

    private async connect() {
        await this.producer.connect();
        this.isConnected = true;
        this.logger.log('Kafka Producer connected successfully');
    }

    async emitEvent(eventType: string, payload: any) {
       if (!this.isConnected) {
            this.connect().catch(() => {});
            return;
        }
        const message = { eventType, ...payload };
        try {
            await this.producer.send({
                topic: 'booking.events',
                messages: [{ value: JSON.stringify(message) }],
            });
        } catch (err: unknown) {
            this.logger.log('error sending: ' + String(err));
        }
    }

    // Новый метод для логов действий пользователей
    async emitUserAction(payload: any) {
        if (!this.isConnected) {
            this.connect().catch(() => {});
            return;
        }
        try {
            await this.producer.send({
                topic: 'user.actions',
                messages: [{ value: JSON.stringify(payload) }],
            });
        } catch (err: unknown) {
            this.logger.error(`Failed to send user action: ${err}`);
        }
    }
}