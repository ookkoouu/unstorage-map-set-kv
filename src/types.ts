export type WatchCallback<T> = (newValue?: T) => MaybePromise;
export type MaybePromise<T = unknown> = T | Promise<T>;
