import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Подключаем Kafka Consumer
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.KAFKA,
        options: {
            client: {
                brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
            },
            consumer: {
                groupId: 'statistics-consumer-group',
            },
        },
    });

    await app.startAllMicroservices();
    await app.listen(process.env.PORT ?? 3014, '0.0.0.0');
}
bootstrap();