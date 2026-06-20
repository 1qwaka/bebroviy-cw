import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    })

    app.setGlobalPrefix('api', {
        exclude: [
            { path: 'manage/health', method: RequestMethod.GET },
        ],
    })

    app.enableCors({
        origin: '*',
        credentials: true,
    })


    await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
