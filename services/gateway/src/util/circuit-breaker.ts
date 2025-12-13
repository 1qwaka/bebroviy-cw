import { HttpException, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';

enum CircuitState {
    CLOSED,
    OPEN,
    HALF_OPEN,
}

export class CircuitBreaker {
    private state = CircuitState.CLOSED;
    private failureCount = 0;
    private nextAttempt = Date.now();

    constructor(
        private readonly failureThreshold: number = 3,
        private readonly timeout: number = 5000,
    ) { }


    async fire<T>(action: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() > this.nextAttempt) {
                this.state = CircuitState.HALF_OPEN;
            } else {
                throw new ServiceUnavailableException();
            }
        }

        try {
            const result = await action();
            if (this.state === CircuitState.HALF_OPEN) {
                this.reset();
            }
            return result;
        } catch (err: unknown) {
            this.recordFailure();
            throw err;
        }
    }

    private recordFailure() {
        this.failureCount++;
        if (this.failureCount >= this.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.timeout;
            // console.log('Circuit Breaker changed to OPEN state');
        }
    }

    private reset() {
        this.failureCount = 0;
        this.state = CircuitState.CLOSED;
        // console.log('Circuit Breaker changed to CLOSED state');
    }
}