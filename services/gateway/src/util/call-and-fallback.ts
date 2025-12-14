export async function callAndFallback<T, E>(
    action: Promise<T> | (() => T),
    fallback: (err: unknown) => E
) {
    try {
        return action instanceof Promise ? await action : await action();
    } catch (err: unknown) {
        return fallback(err)
    }
}