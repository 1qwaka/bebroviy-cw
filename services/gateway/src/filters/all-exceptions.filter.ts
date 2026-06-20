import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        if (status === HttpStatus.NOT_FOUND) {
            this.logger.warn(
                `404 Not Found: ${request.method} ${request.url} ` +
                `from ${request.ip} – Headers: ${JSON.stringify(request.headers)}`,
                exception instanceof Error ? exception.stack : '',
            );
        }

        if (exception instanceof HttpException) {
            response.status(status).json(exception.getResponse());
        } else {
            response.status(status).json({
                statusCode: status,
                message: 'Internal server error',
            });
        }
    }
}