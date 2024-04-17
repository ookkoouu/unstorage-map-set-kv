import type { Driver, StorageValue, Unwatch } from "unstorage";
import type { WatchCallback } from "./types";
import { memoryDriver, parse, stringify } from "./utils";

export interface KVStorage<
	T extends Record<string, StorageValue> = Record<string, StorageValue>,
> {
	get: () => Promise<T>;
	getItem: <K extends keyof T>(key: K) => Promise<T[K]>;
	set: (value: T) => Promise<void>;
	setItem: <K extends keyof T>(key: K, value: T[K]) => Promise<void>;
	reset: () => Promise<void>;
	watch: (callback: WatchCallback<T>) => Promise<Unwatch>;
	watchItem: <K extends keyof T>(
		key: K,
		callback: WatchCallback<T[K]>,
	) => Promise<Unwatch>;
}

export interface KVStorageOptions<T> {
	init: T;
	driver?: Driver;
}

export function createKVStorage<T extends Record<string, StorageValue>>(
	key: string,
	opts: KVStorageOptions<T>,
): KVStorage<T> {
	const _driver = opts.driver ?? (memoryDriver() as Driver);
	const _key = key;
	const _default = structuredClone(opts.init);

	return {
		async get() {
			const val = await _driver.getItem(_key);
			if (val == null) return structuredClone(_default);
			return parse<T>(val);
		},

		async getItem(key) {
			const val = await this.get();
			if (Object.hasOwn(val, key)) {
				return val[key];
			}
			return structuredClone(_default[key]);
		},

		async set(value) {
			if (_driver.setItem === undefined) return;
			return _driver.setItem(_key, stringify(value), {});
		},

		async setItem(key, value) {
			const val = await this.get();

			val[key] = value;
			return this.set(val);
		},

		async reset() {
			await this.set(_default);
		},

		async watch(callback) {
			if (_driver.watch === undefined) {
				return () => undefined;
			}
			return _driver.watch(async (e, k) => {
				if (e !== "update" || k !== _key) return;
				return callback(await this.get());
			});
		},

		async watchItem(key, callback) {
			if (_driver.watch === undefined) {
				return () => undefined;
			}
			return _driver.watch(async (e, k) => {
				if (e !== "update" || k !== _key) return;
				return callback((await this.get())[key]);
			});
		},
	};
}
