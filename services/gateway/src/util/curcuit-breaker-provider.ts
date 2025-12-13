import { Injectable } from '@nestjs/common';
import CircuitBreaker from 'opossum'

@Injectable()
export class CircuitBreakerProvider {
    create(
        action: (...args: any[]) => Promise<any>,
        options: CircuitBreaker.Options = {}
    ): CircuitBreaker {

        const defaults: CircuitBreaker.Options = {
            timeout: 3000,
            errorThresholdPercentage: 50,
            resetTimeout: 10000,
        };

        return new CircuitBreaker(action, { ...defaults, ...options });
    }
}