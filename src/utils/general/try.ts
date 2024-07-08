export type TryFunction<T> = () => Promise<T>;

export type TryResultSuccess<T> = {
    ok: true;
    result: T;
    error: null;
};

export type TryResultFailure = {
    ok: false;
    result: null;
    error: unknown;
};

export type TryResult<T> = TryResultSuccess<T> | TryResultFailure;

export const ttry = async <T>(fn: TryFunction<T>): Promise<TryResult<T>> => {
    try {
        const result = await fn();
        return {
            ok: true,
            result,
            error: null
        };
    } catch (e) {
        return {
            ok: false,
            result: null,
            error: e
        };
    }
};
