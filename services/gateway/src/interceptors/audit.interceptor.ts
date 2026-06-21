import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(
        private reflector: Reflector,
        private kafka: KafkaService,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const actionName = this.reflector.get<string>('actionName', context.getHandler());

        if (!actionName) {
            return next.handle();
        }

        return next.handle().pipe(
            tap({
                next: (data) => this.logAction(req, actionName, data, 'SUCCESS'),
                error: () => this.logAction(req, actionName, null, 'ERROR'),
            })
        );
    }

    private logAction(req: any, actionName: string, data: any, status: string) {
        let username = req.user?.username;

        // Если не авторизован (публичный рут), пытаемся достать из тела или выданного токена
        if (!username && req.body?.username) {
            username = req.body.username;
        } else if (!username && data?.access_token) {
            try {
                const payload = JSON.parse(Buffer.from(data.access_token.split('.')[1], 'base64').toString());
                username = payload.preferred_username;
            } catch (e) {}
        }

        this.kafka.emitUserAction({
            username: username || 'anonymous',
            actionName: `${actionName} (${status})`,
        });
    }
}