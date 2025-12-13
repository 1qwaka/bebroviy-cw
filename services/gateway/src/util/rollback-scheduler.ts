export class RollbackScheduler<T> {
    private rollbackActions: Array<() => T> = [];

    public async execute<E>(action: () => E, rollbackAction: () => T) {
        const res = await action();
        this.rollbackActions.push(rollbackAction);
        return res;
    }

    public rollback() {
        return this.rollbackActions.map(action => action())
    }

    public rollbackSafe() {
        return this.rollbackActions.map(action => {
            try {
                return action();
            } catch {}
        })
    }
}