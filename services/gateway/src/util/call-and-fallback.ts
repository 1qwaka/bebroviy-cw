export function callAndFallback<T, E>(
    action: () => T,
    fallback: (err: unknown) => E
) {
    try {
        return action();
    } catch (err: unknown) {
        return fallback(err)
    }
}