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
                retries: 5, // Не пытаться бесконечно при старте
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
            // Если Kafka лежит, молча игнорируем отправку, 
            // но пытаемся восстановить соединение в фоне для будущих запросов
            this.connect().catch(() => {});
            return;
        }

        const message = { eventType, ...payload };
        
        this.logger.log('trying send: ' + JSON.stringify(message))

        try {
            await this.producer.send({
                topic: 'booking.events',
                messages: [{ value: JSON.stringify(message) }],
            }).catch(err => {
                this.logger.warn(`Failed to send event to Kafka: ${err.message}`);
                this.isConnected = false;
            });
            this.logger.log('sended successfully: ' + JSON.stringify(message))
        } catch (err: unknown) {
            this.logger.log('error sending: ' + JSON.stringify(message) + ' ' + String(err))
            
        }
    }
}